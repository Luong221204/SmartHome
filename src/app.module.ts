import { Module } from '@nestjs/common';

import { EspController } from './notification/esp.controller';
import { FirebaseService } from './notification/firebase.service';
import { GatewayModule } from './gateway/gateway.module';
import { HomeController } from './home/home.controller';
import { FirestoreService } from './home/firestore.service';
import { HomeService } from './home/home.service';
import { HomeModule } from './home/home.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { FirestoreModule } from './home/firestore.module';
import { ConfigModule } from '@nestjs/config';
import { SensorModule } from './sensor/sensor.module';
import { NotificationModule } from './notification/notification.module';
import { NotificationRepository } from './notification/notification.repo';
@Module({
  imports: [
    GatewayModule,
    HomeModule,
    AuthModule,
    FirestoreModule,
    SensorModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [EspController, HomeController, AuthController],
  providers: [FirebaseService, FirestoreService, HomeService],
})
export class AppModule {}
