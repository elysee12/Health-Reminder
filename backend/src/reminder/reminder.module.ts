import { Module } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { ReminderController } from './reminder.controller';
import { SmsLogModule } from '../sms-log/sms-log.module';

@Module({
  imports: [SmsLogModule],
  controllers: [ReminderController],
  providers: [ReminderService],
})
export class ReminderModule {}
