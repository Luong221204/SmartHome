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
@Module({
  imports: [GatewayModule, HomeModule, AuthModule],
  controllers: [EspController, HomeController, AuthController],
  providers: [FirebaseService, FirestoreService, HomeService],
})
export class AppModule {}
