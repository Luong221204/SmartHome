import { IsNumber } from 'class-validator';

export class DeviceLog {
  @IsNumber()
  currentIntensity: number;

  status: boolean;

  updateAt: Date;
}
