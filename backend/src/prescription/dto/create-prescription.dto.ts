import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PrescriptionStatus, ReminderType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreatePrescriptionDto {
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  patientId: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  providerId?: number;

  @IsString()
  @IsNotEmpty()
  medication: string;

  @IsString()
  @IsNotEmpty()
  dosage: string;

  @IsString()
  @IsNotEmpty()
  frequency: string;

  @IsString()
  @IsNotEmpty()
  startDate: string | Date;

  @IsString()
  @IsNotEmpty()
  endDate: string | Date;

  @IsEnum(PrescriptionStatus)
  @IsOptional()
  status?: PrescriptionStatus;

  @IsEnum(ReminderType)
  @IsNotEmpty()
  reminderType: ReminderType;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  reminderTimes: string[];
}
