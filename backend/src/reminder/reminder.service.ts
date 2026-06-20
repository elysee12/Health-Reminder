import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SmsLogService } from '../sms-log/sms-log.service';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private prisma: PrismaService,
    private smsLogService: SmsLogService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running medication reminder cron job');
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000); // 5-minute window to avoid missing reminders if server was down

    // Find pending reminders that are due
    const dueReminders = await this.prisma.reminder.findMany({
      where: {
        status: 'pending',
        type: { in: ['sms', 'both'] },
        scheduledTime: {
          gte: fiveMinutesAgo,
          lte: now,
        },
      },
      include: {
        patient: {
          include: {
            user: true,
            smsLogs: true, // Get sms logs for patient to check if we already sent
          },
        },
      },
    });

    this.logger.debug(`Found ${dueReminders.length} due reminders to process`);

    for (const reminder of dueReminders) {
      const { patient, medication, dosage } = reminder;
      
      if (patient && patient.phone) {
        // Check if we already sent a DELIVERED SMS for this reminder (within last 10 mins)
        const recentDeliveredSms = patient.smsLogs?.filter(log => {
          const timeDiff = Math.abs(log.createdAt.getTime() - reminder.scheduledTime.getTime());
          return timeDiff < 10 * 60 * 1000 && log.status === 'delivered'; // Only skip if it was actually delivered
        });

        if (recentDeliveredSms && recentDeliveredSms.length > 0) {
          this.logger.debug(`Skipping reminder ${reminder.id} - SMS already delivered to ${patient.phone}`);
          continue;
        }

        // Default to Kinyarwanda if language isn't set!
        const language = patient.user?.language || 'rw';
        let message = '';

        if (language === 'rw') {
          message = `Mwibuke kunywa umuti wa ${medication} (${dosage}) ubu. Gira ubuzima bwiza!`;
        } else {
          message = `Reminder: It is time to take your medication: ${medication} (${dosage}). Stay healthy!`;
        }

        this.logger.log(`Sending reminder SMS to ${patient.name} (${patient.phone})`);
        
        try {
          await this.smsLogService.sendSms(patient.phone, message, patient.id);
          this.logger.log(`Successfully sent SMS for reminder ${reminder.id}`);
        } catch (error) {
          this.logger.error(`Failed to send SMS for reminder ${reminder.id}: ${error}`);
        }
      }
    }
  }

  async create(createReminderDto: CreateReminderDto) {
    const { scheduledTime, patientId, prescriptionId, ...rest } = createReminderDto;
    return this.prisma.reminder.create({
      data: {
        ...rest,
        patient: { connect: { id: patientId } },
        prescription: typeof prescriptionId === 'number' ? { connect: { id: prescriptionId } } : undefined,
        scheduledTime: new Date(scheduledTime),
      },
    });
  }

  async findAll(providerId?: number) {
    await this.autoMarkMissedReminders();
    return this.prisma.reminder.findMany({
      where: providerId ? { patient: { registeredByUserId: providerId } } : undefined,
      include: {
        patient: true,
        prescription: true,
      },
    });
  }

  private async autoMarkMissedReminders() {
    const now = new Date();
    
    // Find all pending reminders that are in the past
    const pastPendingReminders = await this.prisma.reminder.findMany({
      where: {
        status: 'pending',
        scheduledTime: { lt: now },
      },
      orderBy: { scheduledTime: 'asc' },
    });

    if (pastPendingReminders.length === 0) return;

    // For each past pending reminder, check if there's a next reminder that has already reached its scheduled time
    for (const reminder of pastPendingReminders) {
      if (!reminder.prescriptionId) continue;

      const nextReminder = await this.prisma.reminder.findFirst({
        where: {
          prescriptionId: reminder.prescriptionId,
          scheduledTime: {
            gt: reminder.scheduledTime,
            lte: now,
          },
        },
      });

      if (nextReminder) {
        await this.prisma.reminder.update({
          where: { id: reminder.id },
          data: { status: 'missed' },
        });
      }
    }
  }

  async findOne(id: number) {
    return this.prisma.reminder.findUnique({
      where: { id },
      include: {
        patient: true,
        prescription: true,
      },
    });
  }

  async update(id: number, updateReminderDto: UpdateReminderDto) {
    const { scheduledTime, patientId, prescriptionId, ...rest } = updateReminderDto as any;
    return this.prisma.reminder.update({
      where: { id },
      data: {
        ...rest,
        patient: typeof patientId === 'number' ? { connect: { id: patientId } } : undefined,
        prescription: typeof prescriptionId === 'number' ? { connect: { id: prescriptionId } } : undefined,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.reminder.delete({
      where: { id },
    });
  }
}
