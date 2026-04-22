import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SystemStatus } from '@prisma/client';

export class CreateExternalSystemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  protocol: string;

  @IsEnum(SystemStatus)
  @IsOptional()
  status?: SystemStatus;

  @IsString()
  @IsOptional()
  lastSync?: string | Date;
}
