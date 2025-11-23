import { Module } from '@nestjs/common';

import { EspController } from './Notification/esp.controller';
import { FirebaseService } from './Notification/firebase.service';
import { GatewayModule } from './gateway/gateway.module';
import { HomeController } from './home/home.controller';
import { FirestoreService } from './home/firestore.service';
import { HomeService } from './home/home.service';
@Module({
  imports: [GatewayModule],
  controllers: [EspController, HomeController],
  providers: [FirebaseService, FirestoreService, HomeService],
})
export class AppModule {}
