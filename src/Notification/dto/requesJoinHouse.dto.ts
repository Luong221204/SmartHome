import { IsOptional } from "class-validator";


export class RequestJoinHouseDto {
  userId: string;
  houseId: string;
  @IsOptional()
  createdAt: Date;

  @IsOptional()
  description: string;

  @IsOptional()
  fcmToken?: string;
}