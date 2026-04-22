import { PartialType } from '@nestjs/mapped-types';
import { CreateAdherenceRecordDto } from './create-adherence-record.dto';

export class UpdateAdherenceRecordDto extends PartialType(CreateAdherenceRecordDto) {}
