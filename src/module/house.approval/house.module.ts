import { Module } from '@nestjs/common';
import { FirestoreModule } from 'src/home/firestore.module';
import { HouseApprovalController } from './house.controller';
import { HouseApprovalRepository } from './house.repo';
import { HouseApprovallService } from './house.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [FirestoreModule, NotificationModule],
  controllers: [HouseApprovalController],
  providers: [HouseApprovalRepository, HouseApprovallService],
  exports: [HouseApprovallService],
})
export class HouseApprovalModule {

}