import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Gender, CommunicationMethod, RiskLevel } from '@prisma/client';

export class CreatePatientDto {
  @IsInt()
  @IsOptional()
  userId?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsInt()
  @IsNotEmpty()
  age: number;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  registeredDate: string | Date;

  @IsEnum(CommunicationMethod)
  @IsNotEmpty()
  communicationMethod: CommunicationMethod;

  @IsString()
  @IsOptional()
  bloodPressure?: string;

  @IsEnum(RiskLevel)
  @IsOptional()
  riskLevel?: RiskLevel;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  pin?: string;

  @IsInt()
  @IsOptional()
  hospitalId?: number;

  @IsInt()
  @IsOptional()
  registeredByUserId?: number;

  @IsInt()
  @IsOptional()
  registeredByHospitalId?: number;
}
