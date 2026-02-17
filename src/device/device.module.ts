import { Module } from "@nestjs/common";
import { DeviceController } from "./device.controller";
import { DeviceService } from "./device.service";
import { Device } from "src/dtos/dtos.device";
import { DeviceRepository } from "./device.repo";


@Module({
    imports: [],
    controllers: [DeviceController],
  providers: [DeviceService, DeviceRepository],
})
export class DeviceModule {}