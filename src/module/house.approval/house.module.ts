import { Module } from '@nestjs/common';
import { HouseApprovalController } from './house.controller';
import { HouseApprovalRepository } from './house.repo';
import { HouseApprovallService } from './house.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [HouseApprovalController],
  providers: [HouseApprovalRepository, HouseApprovallService],
  exports: [HouseApprovallService],
})
export class HouseApprovalModule {

}