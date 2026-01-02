import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { SensorType } from '../enum/sensor.type';

export class Sensor {
  @IsString()
  sensorId: string;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  humidity?: number;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsNumber()
  standardValue?: number;

  @IsEnum(SensorType)
  sensorType: string;

  createdAt: Date;

  status: boolean;

  @IsOptional()
  gpio?: number;
}