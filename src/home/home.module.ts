import { Module } from '@nestjs/common';
import { GatewayModule } from 'src/gateway/gateway.module';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { FirestoreService } from './firestore.service';

@Module({
  imports: [GatewayModule],
  providers: [HomeService, FirestoreService],
  controllers: [HomeController],
  exports: [FirestoreService],
})
export class HomeModule {}
