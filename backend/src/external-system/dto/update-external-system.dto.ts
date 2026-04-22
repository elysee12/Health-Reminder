import { PartialType } from '@nestjs/mapped-types';
import { CreateExternalSystemDto } from './create-external-system.dto';

export class UpdateExternalSystemDto extends PartialType(CreateExternalSystemDto) {}
