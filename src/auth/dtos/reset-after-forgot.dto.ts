import { IsEmail, IsNumber, IsString, Matches } from 'class-validator';
export class OptDto {
    @IsEmail()
    email: string;

    @IsString()
    newPassword: string;

  @IsString()
  otp: string;
}
