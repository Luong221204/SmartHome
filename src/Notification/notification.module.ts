import { Module } from "@nestjs/common";
import { EspController } from "./esp.controller";
import { FirebaseService } from './firebase.service';
import { NotificationRepository } from './notification.repo';
import { HouseApprovalModule } from "src/module/house.approval/house.module";
import { forwardRef } from '@nestjs/common';
import { UserModule } from "src/user/user.module";

@Module({
  imports: [forwardRef(() => HouseApprovalModule), UserModule],
  controllers: [EspController],
  providers: [FirebaseService, NotificationRepository],
  exports: [FirebaseService],
})
export class NotificationModule {}
