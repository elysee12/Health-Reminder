import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFollowUpDto {
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  patientId: number;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  providerId: number;

  @IsString()
  @IsNotEmpty()
  followUpDate: string | Date;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
