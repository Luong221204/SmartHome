import { Body, Controller, Delete, Get, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { DeviceService } from "./device.service";


@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('add')
  async addDevice(
    @Body()
    body: {
      name: string;
      type: string;
      houseId: string;
      roomId: string;
    },
  ) {
    return await this.deviceService.createDevice(body);
  }

  @Put('update')
  async updateAutomation(
    @Body()
    body: any,
  ) {
    return await this.deviceService.updateAutomation(body);
  }

  @Get('logs')
  async getDeviceLog(
    @Query('deviceId') deviceId: string,
    @Query('limit', new ParseIntPipe()) limit: number,
    @Query('startAfter') startAfter?: string,
  ) {
    
    return await this.deviceService.getDeviceLog(deviceId, limit, startAfter);
  }

  @Get('')
  async getDeviceByRoomId(@Query('houseId') houseId: string) {
    return await this.deviceService.getDeviceByRoomId(houseId);
  }

  @Get('detail')
  async getDeviceDetail(@Query('deviceId') deviceId: string) {
    return await this.deviceService.getDeviceDetail(deviceId);
  }
  @Delete('delete')
  async deleteDevice(@Query('deviceId') deviceId: string) {
    return await this.deviceService.deleteDevice(deviceId);
  }

  @Get('energy-stats')
  async getEnergyStats(@Query('deviceId') deviceId: string) {
    return await this.deviceService.getEnergyStats(deviceId);
  }
}
