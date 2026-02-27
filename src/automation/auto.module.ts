import {Module} from '@nestjs/common';
import { AutoController } from "./auto.controller";
import { AutoRepo } from "./auto.repo";
import { AutoService } from "./auto.service";
import { Device } from 'src/dtos/dtos.device';
import { DeviceModule } from 'src/device/device.module';
import { NotificationModule } from 'src/notification/notification.module';


@Module({
  imports: [DeviceModule, NotificationModule],
  controllers: [AutoController],
  providers: [AutoRepo, AutoService],
  exports: [AutoService, AutoRepo],
})
export class AutoModule { }