import { Inject, Injectable } from '@nestjs/common';
import { FirestoreService } from 'src/home/firestore.service';
import { HouseRequestDto } from './house.dto/house.request';

@Injectable()
export class HouseApprovalRepository {
  constructor(@Inject() private readonly firebaseAdmin: FirestoreService) {}

  async requsetToJoinHouse(
    request: HouseRequestDto,
  ): Promise<{ success: boolean }> {
    try {
      await this.firebaseAdmin.db
        .collection('houseRequestToAccess')
        .add(request);
      return { success: true };
    } catch (err) {
      console.error('Error adding document: ', err);
      return { success: false };
    }
  }
}

