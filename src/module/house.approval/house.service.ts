import { Injectable } from '@nestjs/common';
import { HouseApprovalRepository } from './house.repo';
import { HouseRequestDto } from './house.dto/house.request';
@Injectable()
export class HouseApprovallService {
  constructor(
    private readonly houseApprovalRepository: HouseApprovalRepository,
  ) {}

  async requestToJoinHouse(h: HouseRequestDto): Promise<void> {
    // Logic to approve the house
    
  }
}
