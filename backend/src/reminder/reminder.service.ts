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
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    // Find pending reminders that are due now
    const dueReminders = await this.prisma.reminder.findMany({
      where: {
        status: 'pending',
        type: { in: ['sms', 'both'] },
        scheduledTime: {
          gte: oneMinuteAgo,
          lte: now,
        },
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });

    for (const reminder of dueReminders) {
      const { patient, medication, dosage } = reminder;
      if (patient && patient.phone) {
        const language = patient.user?.language || 'en';
        let message = '';

        if (language === 'rw') {
          message = `Mwibuke kunywa umuti wa ${medication} (${dosage}) ubu. Gira ubuzima bwiza!`;
        } else {
          message = `Reminder: It is time to take your medication: ${medication} (${dosage}). Stay healthy!`;
        }

        await this.smsLogService.sendSms(patient.phone, message, patient.id);
        
        // We don't mark as 'taken' automatically, it stays 'pending' until the patient confirms in the app
        // or it is marked 'missed' by the autoMarkMissedReminders job.
        // However, we should probably mark that the SMS was sent. 
        // For now, let's just log it.
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
