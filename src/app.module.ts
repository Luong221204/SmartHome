import { Module } from '@nestjs/common';

import { GatewayModule } from './gateway/gateway.module';
import { HomeModule } from './home/home.module';
import { AuthModule } from './auth/auth.module';
import { FirestoreModule } from './home/firestore.module';
import { ConfigModule } from '@nestjs/config';
import { SensorModule } from './sensor/sensor.module';
import { NotificationModule } from './notification/notification.module';
import { HouseApprovalModule } from './module/house.approval/house.module';
import { AutoModule } from './automation/auto.module';
import { MqttBrokerModule } from './mqtt/mqtt.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserModule } from './user/user.module';
import { ScheduleModule } from '@nestjs/schedule/dist/schedule.module';
@Module({
  imports: [
    EventEmitterModule.forRoot(), // Thêm dòng này
    GatewayModule,
    HomeModule,
    AuthModule,
    FirestoreModule,
    NotificationModule,
    SensorModule,
    HouseApprovalModule,
    AutoModule,
    MqttBrokerModule,
    UserModule,
    ScheduleModule.forRoot(), // BẮT BUỘC phải có dòng này
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule {}
