import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiKeyStatus } from '@prisma/client';

export class CreateApiKeyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsEnum(ApiKeyStatus)
  @IsOptional()
  status?: ApiKeyStatus;
}
