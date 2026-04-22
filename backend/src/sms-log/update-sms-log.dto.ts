import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { SmsStatus } from '@prisma/client';

export class UpdateSmsLogDto {
  @IsInt()
  @IsOptional()
  patientId?: number;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsEnum(SmsStatus)
  @IsOptional()
  status?: SmsStatus;
}
