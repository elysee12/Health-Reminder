import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSmsLogDto } from './create-sms-log.dto';
import { UpdateSmsLogDto } from './update-sms-log.dto';
import { SmsStatus } from '@prisma/client';

@Injectable()
export class SmsLogService {
  private readonly logger = new Logger(SmsLogService.name);
  private readonly smsGatewayUrl = process.env.SMS_GATEWAY_URL || 'http://11.114.194.30:8080/send-sms';

  constructor(private prisma: PrismaService) {}

  async sendSms(phone: string, message: string, patientId?: number) {
    // 1. Create a pending log entry immediately
    const log = await this.create({
      phone,
      message,
      status: 'pending',
      patientId,
    });

    // 2. Start the sending process in the background (don't await it fully for the response)
    this.processSmsSending(log.id, phone, message);

    return true; // Return immediately to the caller
  }

  private async processSmsSending(logId: number, phone: string, message: string) {
    try {
      this.logger.log(`Background: Sending SMS to ${phone}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(this.smsGatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, message }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const status: SmsStatus = response.ok ? 'delivered' : 'failed';
      
      await this.update(logId, { status });

      if (!response.ok) {
        this.logger.error(`Failed to send SMS to ${phone}. Status: ${response.status}`);
      }
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
