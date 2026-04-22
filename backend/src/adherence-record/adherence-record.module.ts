import { Module } from '@nestjs/common';
import { AdherenceRecordService } from './adherence-record.service';
import { AdherenceRecordController } from './adherence-record.controller';

@Module({
  controllers: [AdherenceRecordController],
  providers: [AdherenceRecordService],
})
export class AdherenceRecordModule {}
