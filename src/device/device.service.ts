import { Inject, Injectable } from "@nestjs/common";
import { DeviceRepository } from "./device.repo";
import { AutomationDeviceDto } from "./dto/device.dto";
import { Cron } from '@nestjs/schedule';
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class DeviceService {
  
  getDeviceDetail(deviceId: string) {
    return this.deviceRepo.getDeviceDetail(deviceId);
  }
  
  constructor(private readonly deviceRepo: DeviceRepository) {}

  getDeviceLog(deviceId: string, limit: number, startAfter?: string) {
    return this.deviceRepo.getDeviceLog(deviceId, limit, startAfter);
  }

  async getDeviceByRoomId(roomId: string) {
    return await this.deviceRepo.getDeviceByRoomId(roomId);
  }

  async createDevice(body: {
    name: string;
    type: string;
    houseId: string;
    roomId: string;
  }): Promise<{ success: boolean; error?: string }> {
    return await this.deviceRepo.createDevice(body);
  }

  deleteDevice(deviceId: string) {
    return this.deviceRepo.deleteDevice(deviceId);
  }

  async updateAutomation(
    body: any,
  ): Promise<{ success: boolean; error?: string }> {
    // Implement update logic here, for now we just call create as a placeholder
    return await this.deviceRepo.update(body);
  }

  @OnEvent('mqtt.devices')
  async handleDataPower(payload: any) {
    const { deviceId, watt, status } = payload;
    await this.deviceRepo.handlePowerData(deviceId, watt, status);
  }


  // Chạy vào 23:55 mỗi đêm để chuẩn bị Document cho ngày hôm sau
  @Cron('55 23 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async prepareNextDayDoc() {
    console.log('[Energy] Đang chuẩn bị Document cho ngày mới...');
    // 1. Lấy ngày mai (YYYY-MM-DD)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    await this.deviceRepo.prepareNextDayDoc(tomorrowStr);
  }

  async getEnergyStats(deviceId: string) {
    return await this.deviceRepo.getEnergyStats(deviceId);
  }

}
