import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { SmsStatus } from '@prisma/client';

export class CreateSmsLogDto {
  @IsInt()
  @IsOptional()
  patientId?: number;

  @IsString()
  phone: string;

  
  @IsString()
  message: string;

  @IsEnum(SmsStatus)
  @IsOptional()
  status?: SmsStatus;
}
