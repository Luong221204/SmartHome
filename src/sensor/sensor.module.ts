import { Module } from "@nestjs/common";
import { SensorController } from "./sensor.controller";
import { SensorService } from "./sensor.service";
import { Sensor } from "src/dtos/dtos.sensor";
import { SensorRepository } from "./sensor.repository";
import { FirestoreModule } from "src/home/firestore.module";
import { AutoModule } from "src/automation/auto.module";
import { GatewayModule } from "src/gateway/gateway.module";

@Module({
  imports: [AutoModule],
  controllers: [SensorController],
  providers: [SensorService, SensorRepository],
  exports: [SensorService],
}
)
export class SensorModule {}