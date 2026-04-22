import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AdherenceStatus } from '@prisma/client';

export class CreateAdherenceRecordDto {
  @IsInt()
  @IsNotEmpty()
  patientId: number;

  @IsInt()
  @IsOptional()
  prescriptionId?: number;

  @IsString()
  @IsNotEmpty()
  medication: string;

  @IsString()
  @IsNotEmpty()
  scheduledTime: string | Date;

  @IsString()
  @IsOptional()
  confirmedTime?: string | Date;

  @IsEnum(AdherenceStatus)
  @IsNotEmpty()
  status: AdherenceStatus;
}
