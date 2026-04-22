import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { HospitalStatus } from '@prisma/client';

export class CreateHospitalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEnum(HospitalStatus)
  @IsOptional()
  status?: HospitalStatus;
}
