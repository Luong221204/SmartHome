import {forwardRef, Module} from '@nestjs/common';
import { AutoController } from "./auto.controller";
import { AutoRepo } from "./auto.repo";
import { AutoService } from "./auto.service";
import { Device } from 'src/dtos/dtos.device';
import { DeviceModule } from 'src/device/device.module';
import { NotificationModule } from 'src/notification/notification.module';
import { MqttBrokerModule } from 'src/mqtt/mqtt.module';
import { GatewayModule } from 'src/gateway/gateway.module';
import { MyGateway } from 'src/gateway/gateway';


@Module({
  imports: [
    DeviceModule,
    NotificationModule,
    MqttBrokerModule,
    forwardRef(() => GatewayModule),
  ],
  controllers: [AutoController],
  providers: [AutoRepo, AutoService, MyGateway],
  exports: [AutoService, AutoRepo],
})
export class AutoModule { }