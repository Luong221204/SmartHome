import { IsOptional, IsString } from 'class-validator';

export class HouseRequestDto {
  @IsString()
  houseId: string;

  @IsString()
  memberId: string;

  requestAt: Date;


  @IsOptional()
  description: string;

}
