import { Module } from "@nestjs/common";
import { EspController } from "./esp.controller";
import { FirebaseService } from "./firebase.service";
import { NotificationRepository } from "./notification.repo";


@Module({
  imports: [],
  controllers: [EspController],
  providers: [FirebaseService, NotificationRepository],
  exports: [FirebaseService],
})
export class NotificationModule {}
