import { IsString } from 'class-validator';

export class HouseApprovalDto {
  @IsString()
  houseId: string;

  @IsString()
  memberId: string;

  @IsString()
  memberApprovalId: string;

  requestAt: Date;

  isApproved: boolean;

  approvedAt: Date;

  updateAt: Date;

  isActive: boolean;
}
