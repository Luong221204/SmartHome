import { IsNumber, IsString } from "class-validator";

export class Room {
  roomId: string;

  @IsNumber()
  floor: number;

  @IsNumber()
  totalDevice: number;

  @IsString()
  houseId: string;

  totalPowerConsumption: number;
}