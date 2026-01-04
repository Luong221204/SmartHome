import { Injectable } from '@nestjs/common';
import { HouseApprovalRepository } from './house.repo';
import { HouseRequestDto } from './house.dto/house.request';
import { RequestJoinHouseDto } from 'src/notification/dto/requesJoinHouse.dto';
import { FirebaseService } from 'src/notification/firebase.service';
import { HouseCreateDto } from './house.dto/house.create';
import { HouseUpdateDto } from './house.dto/house.update';
import { HousePendingDto } from './house.dto/house.approval';
@Injectable()
export class HouseApprovallService {
  constructor(
    private readonly houseApprovalRepository: HouseApprovalRepository,
    private firebaseService: FirebaseService,
  ) { }


  async getHouseIdsByUserId(userId: string): Promise<string[]> {
    // Logic to get house IDs by user ID
    return [];
  }

  async resolveJoinHouse(body: HousePendingDto){
    const r = await this.houseApprovalRepository.resovleJoinHouse(body);
    if (r.success) {
      await this.firebaseService.sendResolveJoinHouseNotification(
        body,
        r.fcmToken,
        body.fcmToken
      );
    }
    return r;
  }

  async userWithdrawRequest({ userId, houseId }) {
    return await this.houseApprovalRepository.withDrawRequest(houseId, userId)
  }

  async saveRequestJoinHouseNotification(request: RequestJoinHouseDto) {
    const log =
      await this.houseApprovalRepository.saveRequestJoinHouseNotification(
        request,
      );
    if (log.success) {
      await this.firebaseService.sendRequestToJoinHouseNotification(request);
    }
    return log;
  }

  async createHouse(h: HouseCreateDto) {
    return await this.houseApprovalRepository.createHouse(h);
  }

  async updateHouse(h: HouseUpdateDto) {
    return await this.houseApprovalRepository.updateHouse(h);
  }
}
