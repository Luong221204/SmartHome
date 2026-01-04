import { Module } from '@nestjs/common';

import { GatewayModule } from './gateway/gateway.module';
import { HomeModule } from './home/home.module';
import { AuthModule } from './auth/auth.module';
import { FirestoreModule } from './home/firestore.module';
import { ConfigModule } from '@nestjs/config';
import { SensorModule } from './sensor/sensor.module';
import { NotificationModule } from './notification/notification.module';
import { HouseApprovalModule } from './module/house.approval/house.module';
@Module({
  imports: [
    GatewayModule,
    HomeModule,
    AuthModule,
    FirestoreModule,
    NotificationModule,
    SensorModule,
    HouseApprovalModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule {}
