import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { DeviceType } from "../enum/device.type";

export class Device {

    @IsString()
    roomId: string;

    @IsString()
    deviceId: string;

  @IsEnum(DeviceType)
  deviceType: string;

    @IsNumber()
    currentIntentsity: number;

    @IsNumber()
    voltage: number;

    @IsNumber()
    maxIntentsity: number;

    status: boolean;

    @IsString()
    description: string;

    @IsNumber()
    totalPowerConsumption: number;

    createdAt: Date;

    @IsOptional()
    gpio?:number;

}