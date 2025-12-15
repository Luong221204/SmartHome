import { Module } from '@nestjs/common';

import { EspController } from './Notification/esp.controller';
import { FirebaseService } from './Notification/firebase.service';
import { GatewayModule } from './gateway/gateway.module';
import { HomeController } from './home/home.controller';
import { FirestoreService } from './home/firestore.service';
import { HomeService } from './home/home.service';
import { HomeModule } from './home/home.module';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { FirestoreModule } from './home/firestore.module';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    GatewayModule,
    HomeModule,
    AuthModule,
    FirestoreModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [EspController, HomeController, AuthController],
  providers: [FirebaseService, FirestoreService, HomeService],
})
export class AppModule {}
