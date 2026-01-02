import { Module } from "@nestjs/common";
import { SensorController } from "./sensor.controller";
import { SensorService } from "./sensor.service";
import { Sensor } from "src/dtos/dtos.sensor";
import { SensorRepository } from "./sensor.repository";
import { FirestoreModule } from "src/home/firestore.module";

@Module({
  imports: [FirestoreModule],
  controllers: [SensorController],
  providers: [SensorService, SensorRepository],
}
)
export class SensorModule {}