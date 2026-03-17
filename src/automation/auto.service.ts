import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { AutoRepo } from "./auto.repo";
import { Action, AutomationDto } from "./auto.dto/auto.object";
import { User } from "src/auth/user.entity";
import { DeviceService } from "src/device/device.service";
import { FirebaseService } from "src/notification/firebase.service";
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { MqttBrokerService } from "src/mqtt/mqtt.service";
import { MyGateway } from "src/gateway/gateway";

@Injectable()
export class AutoService implements OnModuleInit {
  constructor(
    private readonly repo: AutoRepo,
    private readonly deviceService: DeviceService,
    private readonly firebaseService: FirebaseService,
    private mqttService: MqttBrokerService,
    private gateway: MyGateway,
    private schedulerRegistry: SchedulerRegistry,
  ) { }
  async onModuleInit() {
    const snapshot = await this.repo.loadAllSchedulers();
    snapshot.forEach((doc) => {
      this.addCronJob(doc.id, doc.data() as AutomationDto);
    });
  }

  async getAutomationByDeviceId(deviceId: string) {
    return await this.repo.getAutomationByDeviceId(deviceId);
  }
  // Hàm thêm một lịch chạy động
  addCronJob(automationId: string, data: AutomationDto) {
    const job = new CronJob(
      data.schedule.cron,
      async () => {
        console.log(`[Scheduler] Thực thi kịch bản: ${data.name}`);
        const notificationId = await this.repo.saveNotifcation(data);
        await this.firebaseService.sendAutomationAlertNotification(
          data.name,
          'Thực thi hành động theo lịch trình',
          data.houseId,
          notificationId,
        );
        this.executeAction(data.action, data.houseId);
        void this.deviceService.updateAutomation(data.action, 'SCHEDULE');

        await this.repo.executeScheduleAction(automationId, data);
      },
      null,
      true,
      data.schedule.timezone,
    );

    this.schedulerRegistry.addCronJob(automationId, job);
    job.start();
  }

  // Hàm để App gọi khi người dùng cập nhật lịch mới trên điện thoại
  updateJob(id: string, newData: AutomationDto) {
    // Xóa job cũ nếu đang chạy
    if (this.schedulerRegistry.doesExist('cron', id)) {
      this.schedulerRegistry.deleteCronJob(id);
    }
    // Thêm job mới
    if (newData.isEnabled) {
      this.addCronJob(id, newData);
    }
  }
  async createAutomation(
    body: any,
  ): Promise<boolean> {
    const { id, success } = await this.repo.create(body)
    if (body.type == 'SCHEDULE') {
      this.updateJob(id, body);
    }
    return success;
  }

  async updateAutomation(
    body: any,
  ): Promise<boolean> {
    // Implement update logic here, for now we just call create as a placeholder
    this.updateJob(body.id, body)
    return await this.repo.update(body);
  }

  async findAll(user: User, houseId: string) {
    return await this.repo.findAll(user, houseId);
  }

  async deleteAutomation(user: User, automationId: string) {
    return await this.repo.deleteAutomation(user, automationId);
  }

  async implementAutomationLogic(
    houseId: string,
    roomId: string,
    sensorId: string,
    current: Record<string, number>,
  ) {
    console.log('check điều kiện');
    const result = await this.repo.implementAutomationLogic(
      houseId,
      roomId,
      sensorId,
      current,
    );
    this.gateway.emitSensorData(sensorId, current);
    result.forEach(async (value, index) => {
      const condition = value.condition;
      if (condition.sensorId !== sensorId) return;

      console.log('Điều kiện cần kiểm tra:', current[condition.property]);
      const isMatch = this.evaluateCondition(
        current[condition.property],
        condition.operation,
        condition.threshold
      );
      if (isMatch) {
        const now = new Date();
        const lastTime = value.control.lastExecuted.toDate();

        // đổi cooldown phút → milliseconds
        const cooldownMs = value.control.cooldownMinutes * 60 * 1000;

        const isExpired = now.getTime() > lastTime.getTime() + cooldownMs;
        if (isExpired) {
          await this.repo.update({ ...value, isExecuting: true });

          void this.repo.updateLastExecuted(value.id);
          console.log(
            'thoa man dieu kien, thuc hien hanh dong',
            value.action.deviceId,
          );
          // 1. Tạo đối tượng chứa dữ liệu
          const deviceUpdate = {
            id: value.action.deviceId,
            value: value.action.value,
            status: value.action.status,
            kind: 'DEVICE'
          };

          // 2. Publish qua MQTT (như bạn đã làm)
          this.mqttService.publish("devices", deviceUpdate);

          // 3. Cập nhật automation và lấy roomId
          const r = await this.deviceService.updateAutomation(value.action, 'AUTO');

          // 4. Chuẩn bị mảng JSON và chuyển thành chuỗi để emit qua Gateway
          // Chúng ta bỏ deviceUpdate vào trong mảng [ ]
          const dataPayload = JSON.stringify([deviceUpdate]);

          this.gateway.emitRoomData(r.roomId, dataPayload);
          console.log('Điều kiện tự động thỏa mãn');
          const notificationId = await this.repo.saveNotifcation(value)
          void this.firebaseService.sendAutomationAlertNotification(
            value.name,
            'Điều kiện tự động thỏa mãn',
            houseId,
            notificationId
          );
          this.executeAction(value.action, houseId);
        }
      } else {
        if (value.isExecuting) {
          await this.repo.update({ ...value, isExecuting: false });
          await this.deviceService.updateAutomation(
            {
              id: value.action.deviceId,
              status: false,
              value: value.action.value
            }
            , 'SYSTEM',
          );
        }
      }
    });
  }

  evaluateCondition(
    sensorValue: number,
    operator: string,
    conditionValue: number,
  ): boolean {
    switch (operator) {
      case '>':
        return sensorValue > conditionValue;
      case '<':
        return sensorValue < conditionValue;
      case '>=':
        return sensorValue >= conditionValue;
      case '<=':
        return sensorValue <= conditionValue;
      case '==':
        return sensorValue === conditionValue;
      default:
        return false;
    }
  }

  executeAction(action: Action, houseId: string) {
    const topic = `house/${houseId}/device/${action.deviceId}`;

    this.mqttService.publish(
      topic,
      JSON.stringify({
        command: action,
      }),
    );

    console.log('Action executed:', action);
  }
  async getAutomationScene(
    deviceId: string,
    limit: number,
    startAfter?: string,
  ) {
    return await this.repo.getAutomationScenes(deviceId, limit, startAfter);
  }
}
