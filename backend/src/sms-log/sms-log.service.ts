import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSmsLogDto } from './create-sms-log.dto';
import { UpdateSmsLogDto } from './update-sms-log.dto';
import { SmsStatus } from '@prisma/client';

@Injectable()
export class SmsLogService {
  private readonly logger = new Logger(SmsLogService.name);
  private readonly brevoApiKey = process.env.BREVO_API_KEY;
  private readonly smsSender = process.env.BREVO_SMS_SENDER || 'HealthRem'; // Max 11 alphanumeric chars

  constructor(private prisma: PrismaService) {}

  async sendSms(phone: string, message: string, patientId?: number) {
    // Ensure phone number is in E.164 format if possible, but Brevo usually handles it if it starts with +
    // If it doesn't start with +, we might need to add a default country code, 
    // but for now let's assume the user provides a valid number or we pass it as is.
    
    // 1. Create a pending log entry immediately
    const log = await this.create({
      phone,
      message,
      status: 'pending',
      patientId,
    });

    // 2. Start the sending process in the background
    this.processSmsSending(log.id, phone, message);

    return true;
  }

  private async processSmsSending(logId: number, phone: string, message: string) {
    try {
      if (!this.brevoApiKey) {
        this.logger.error('BREVO_API_KEY is not configured');
        await this.update(logId, { status: 'failed' });
        return;
      }

      this.logger.log(`Background: Sending SMS to ${phone} via Brevo`);
      
      const url = 'https://api.brevo.com/v3/transactionalSMS/sms';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': this.brevoApiKey,
        },
        body: JSON.stringify({
          type: 'transactional',
          sender: this.smsSender,
          recipient: phone.startsWith('+') ? phone : `+${phone}`, // Ensure it has +
          content: message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error(`Failed to send SMS to ${phone} via Brevo. Status: ${response.status}`, errorData);
        await this.update(logId, { status: 'failed' });
        return;
      }

      await this.update(logId, { status: 'delivered' });
      this.logger.log(`SMS delivered to ${phone} via Brevo`);
    } catch (error) {
      this.logger.error(`Error sending SMS to ${phone}: ${error.message}`);
      await this.update(logId, { status: 'failed' });
    }
  }

  async broadcast(message: string, patientId?: number, phone?: string) {
    if (patientId) {
      // Send to specific patient
      const patient = await this.prisma.patient.findUnique({
        where: { id: patientId },
      });
      if (patient && patient.phone) {
        return this.sendSms(patient.phone, message, patient.id);
      }
      return false;
    } else if (phone) {
      // Send to custom phone number
      return this.sendSms(phone, message);
    } else {
      // Send to all patients
      const patients = await this.prisma.patient.findMany({
        where: { phone: { not: '' } },
      });
      
      const results = await Promise.all(
        patients.map((patient) => this.sendSms(patient.phone, message, patient.id)),
      );
      
      return results.every((res) => res === true);
    }
  }

  async create(createSmsLogDto: CreateSmsLogDto) {
    const { patientId, phone, message, status } = createSmsLogDto;
    return this.prisma.smsLog.create({
      data: {
        phone,
        message,
        status,
        patient: typeof patientId === 'number' ? { connect: { id: patientId } } : undefined,
      },
      include: { patient: true },
    });
  }

  async findAll(providerId?: number) {
    return this.prisma.smsLog.findMany({
      where: providerId ? { patient: { registeredByUserId: providerId } } : undefined,
      include: { patient: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number ) {
    return this.prisma.smsLog.findUnique({
      where: { id },
      include: { patient: true },
    });
  }

  async update(id: number, updateSmsLogDto: UpdateSmsLogDto) {
    const { patientId, phone, message, status } = updateSmsLogDto;
    return this.prisma.smsLog.update({
      where: { id },
      data: {
        phone,
        message,
        status,
        patient: typeof patientId === 'number' ? { connect: { id: patientId } } : undefined,
      },
      include: { patient: true },
    });
  }

  async remove(id: number) {
    return this.prisma.smsLog.delete({
      where: { id },
    });
  }
}
