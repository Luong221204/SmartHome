import { Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { SensorService } from './sensor.service';
@Controller('sensor')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  @Post('add')
  async addNewSensor(
    @Body()
    body: {
      name: string;
      kind: string;
      houseId: string;
      roomId: string;
      refferTo: string;
      gipo: number;
    },
  ) {
    return await this.sensorService.addNewSensor(body);
  }

  @Post('update')
  async updateSensor(
    @Body()
    body: {
      id: string;
      name: string;
      type: string;
      status: boolean;
      houseId: string;
      roomId: string;
      refferTo: string;
      gipo: number;
    },
  ) {
    return await this.sensorService.updateSensor(body);
  }

  @Delete('delete')
  async deleteSensor(
    @Query('id') id:string
  ) {
    return await this.sensorService.deleteSensor(id);
  }
  
  
@Get('')
  async getSensors(
  @Query('houseId') houseId?: string,
  @Query('roomId') roomId?: string,
) {
  if (houseId) {
    return await this.sensorService.getSensorsByHouseId(houseId);
  }
  if (roomId) {
    return await this.sensorService.getSensorsByRoomId(roomId);
  }
  // Trả về lỗi hoặc danh sách trống nếu không có tham số nào
  return [];
}

  @Get('detail')
  async getSensorDetail(@Query('sensorId') sensorId: string) {
    return await this.sensorService.getSensorDetail(sensorId);
  }

}