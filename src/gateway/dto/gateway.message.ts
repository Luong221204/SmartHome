import { IsBoolean, IsNumber, IsString } from "class-validator";


export class SendMessageDto {
  @IsString()
  id: string;

   @IsString()
  roomId: string;


  @IsNumber()
  value: number;

  @IsString()
  type: string;
  
  @IsBoolean()
  status: boolean;

  @IsString()
  kind: string;

  @IsString()
  name: string;
}