import { IsString, MinLength } from 'class-validator';
export class ResetDto {
  token: string;
  @IsString()
  @MinLength(6)
  newPassword: string;
}
