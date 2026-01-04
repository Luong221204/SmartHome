import { Body, Controller, Post, Req } from '@nestjs/common';
import { HouseApprovallService } from './house.service';
import { RequestJoinHouseDto } from 'src/notification/dto/requesJoinHouse.dto';
import { HouseCreateDto } from './house.dto/house.create';
import { HouseUpdateDto } from './house.dto/house.update';
import { HousePendingDto } from './house.dto/house.approval';

@Controller('house')
export class HouseApprovalController {
  constructor(private readonly houseApprovallService: HouseApprovallService) {}

  @Post('request-join')
  async requestToJoinHouse(@Body() body: RequestJoinHouseDto) {
    return await this.houseApprovallService.saveRequestJoinHouseNotification(
      body,
    );
  }
  @Post('approve-join')
  async approveJoinHouse(@Body() body: HousePendingDto) {
    return await this.houseApprovallService.resolveJoinHouse(body)
  }

  @Post('withdraw-request')
  async withdrawRequest(@Body() data: { houseId: string; userId: string }) {
    return this.houseApprovallService.userWithdrawRequest(data);
  }

  @Post('create-house')
  async createHouse(@Body() h: HouseCreateDto) {
    // Implementation for creating a house
    return await this.houseApprovallService.createHouse(h);
  }

  @Post('update-house')
  async updateHouse(@Body() h: HouseUpdateDto) {
    // Implementation for updating a house
    return await this.houseApprovallService.updateHouse(h);
  }

  
}