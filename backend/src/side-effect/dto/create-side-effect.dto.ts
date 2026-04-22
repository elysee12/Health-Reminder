import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Severity } from '@prisma/client';

export class CreateSideEffectDto {
  @IsInt()
  @IsNotEmpty()
  patientId: number;

  @IsInt()
  @IsOptional()
  prescriptionId?: number;

  @IsString()
  @IsNotEmpty()
  effect: string;

  @IsEnum(Severity)
  @IsNotEmpty()
  severity: Severity;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  reportedDate?: string | Date;

  @IsString()
  @IsOptional()
  notes?: string;
}
