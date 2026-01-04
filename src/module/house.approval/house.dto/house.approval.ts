import { IsString } from 'class-validator';

export class HousePendingDto {
  @IsString()
  houseId: string;

  @IsString()
  memberId: string;

  @IsString()
  memberApprovalId: string;

  isApproved: boolean;

  fcmToken: string;

}
