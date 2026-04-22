import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GoalStatus } from '@prisma/client';

export class CreateHealthGoalDto {
  @IsInt()
  @IsNotEmpty()
  patientId: number;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  targetValue: string;

  @IsString()
  @IsOptional()
  currentValue?: string;

  @IsString()
  @IsNotEmpty()
  startDate: string | Date;

  @IsString()
  @IsOptional()
  endDate?: string | Date;

  @IsEnum(GoalStatus)
  @IsOptional()
  status?: GoalStatus;
}
