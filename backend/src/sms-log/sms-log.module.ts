import { Module } from '@nestjs/common';
import { SmsLogService } from './sms-log.service';
import { SmsLogController } from './sms-log.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SmsLogController],
  providers: [SmsLogService],
})
export class SmsLogModule {}
