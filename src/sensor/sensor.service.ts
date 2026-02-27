import { Injectable } from '@nestjs/common';
import { SensorRepository } from './sensor.repository';
import { OnEvent } from '@nestjs/event-emitter';
import { AutoService } from 'src/automation/auto.service';

@Injectable()
export class SensorService {
  constructor(
    private readonly sensorRepository: SensorRepository,
    private readonly autoService: AutoService,
  ) {}

  async addNewSensor(body: {
    name: string;
    type: string;
    houseId: string;
    roomId: string;
    refferTo: string;
  }): Promise<boolean> {
    return this.sensorRepository.addNewSensor(body);
  }

  async deleteSensor(
    sensorId: string,
  ): Promise<{ success: boolean; error?: string }> {
    return this.sensorRepository.deleteSensor(sensorId);
  }

  @OnEvent('mqtt.sensors')
  async handleSensor(payload) {
   // Vào đến đây chắc chắn là dữ liệu sensor, không cần check topic 'device' nữa
    console.log('Xử lý sensor:', payload.data);
   const result = this.handleSensorData(payload.data);
    const houseId = await this.sensorRepository.saveSensorData(
      result.sensorId,
      result.current,
    );
    await this.autoService.implementAutomationLogic(
      houseId,
      result.sensorId,
      result.current,
    );
  }


handleSensorData(payload):{sensorId: string, current: Record<string, number>} {
  
  const { sensorId, current } = JSON.parse(payload);

   // Chuyển sang Map đã chuẩn hóa số
  const currentMap = new Map<string, number>(
    Object.entries(current).map(([key, value]) => [key, parseFloat(value as string)])
  );
  return { sensorId, current: Object.fromEntries(currentMap) };
}

 async getSensorsByRoomId(roomId: string) {
    return this.sensorRepository.getSensorsByRoomId(roomId);
  }

  async getSensorsByHouseId(houseId: string) {
    return this.sensorRepository.getSensorsByHouseId(houseId);
  }

  async getSensorDetail(sensorId: string) {
    return this.sensorRepository.getSensorDetail(sensorId);
  }

  async updateSensor(body: {
    name: string;
    id: string;
    type: string;
    status: boolean;
    houseId: string;
    roomId: string;
    refferTo: string;
    gipo: number;
  }) {
    return this.sensorRepository.updateSensor(body);
  } 
}