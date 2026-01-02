import { IsNumber, IsOptional } from 'class-validator';

export class SensorLog {
  @IsNumber()
  @IsOptional()
  value: number;

  status: boolean;

  updateAt: Date;

  @IsNumber()
  @IsOptional()
  temperature?: number;

  @IsNumber()
  @IsOptional()
  humidity?: number;
}
