import { Module } from '@nestjs/common';
import { GatewayModule } from 'src/gateway/gateway.module';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { FirestoreModule } from './firestore.module';

@Module({
  imports: [GatewayModule, FirestoreModule],
  providers: [HomeService],
  controllers: [HomeController],
  exports: [],
})
export class HomeModule {}
