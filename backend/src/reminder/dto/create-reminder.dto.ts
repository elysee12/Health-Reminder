import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReminderStatus, ReminderType } from '@prisma/client';

export class CreateReminderDto {
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
  dosage: string;

  @IsString()
  @IsNotEmpty()
  scheduledTime: string | Date;

  @IsEnum(ReminderStatus)
  @IsOptional()
  status?: ReminderStatus;

  @IsEnum(ReminderType)
  @IsNotEmpty()
  type: ReminderType;
}
