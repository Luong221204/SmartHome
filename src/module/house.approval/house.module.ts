import { Module } from '@nestjs/common';
import { HouseApprovalController } from './house.controller';
import { HouseApprovalRepository } from './house.repo';
import { HouseApprovallService } from './house.service';
import { NotificationModule } from 'src/notification/notification.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [forwardRef(() => NotificationModule)],
  controllers: [HouseApprovalController],
  providers: [HouseApprovalRepository, HouseApprovallService],
  exports: [HouseApprovallService, HouseApprovalRepository],
})
export class HouseApprovalModule {

}