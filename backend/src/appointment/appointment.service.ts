import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { EmailService } from '../auth/email.service';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    const { dateTime, patientId, hospitalId, ...rest } = createAppointmentDto;
    
    const appointment = await this.prisma.appointment.create({
      data: {
        ...rest,
        dateTime: new Date(dateTime),
        patientId,
        hospitalId,
      },
      include: {
        patient: true,
        hospital: true,
      },
    });

    // Send notifications
    await this.sendAppointmentNotifications(appointment);

    return appointment;
  }

  async findAll() {
    return this.prisma.appointment.findMany({
      include: {
        patient: true,
        hospital: true,
      },
    });
  }

  async findByPatient(patientId: number) {
    return this.prisma.appointment.findMany({
      where: { patientId },
      orderBy: { dateTime: 'desc' },
      include: {
        hospital: true,
      },
    });
  }

  async findByHospital(hospitalId: number) {
    return this.prisma.appointment.findMany({
      where: { hospitalId },
      orderBy: { dateTime: 'asc' },
      include: {
        patient: true,
      },
    });
  }

  async findByProvider(providerId: number) {
    return this.prisma.appointment.findMany({
      where: { patient: { registeredByUserId: providerId } },
      orderBy: { dateTime: 'asc' },
      include: {
        patient: true,
        hospital: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        hospital: true,
      },
    });
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    const { dateTime, ...rest } = updateAppointmentDto;
    
    const appointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        ...rest,
        dateTime: dateTime ? new Date(dateTime) : undefined,
      },
      include: {
        patient: true,
        hospital: true,
      },
    });

    // If status changed to confirmed, send notifications
    if (rest.status === 'confirmed') {
      await this.sendAppointmentNotifications(appointment);
    }

    return appointment;
  }

  private async sendAppointmentNotifications(appointment: any) {
    try {
      const patient = appointment.patient;
      const hospital = appointment.hospital;
      
      // Format date/time for Rwanda timezone
      const dateTime = new Date(appointment.dateTime);
      const dateStr = dateTime.toLocaleDateString('en-US', { 
        timeZone: 'Africa/Kigali',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const timeStr = dateTime.toLocaleTimeString('en-US', {
        timeZone: 'Africa/Kigali',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Send SMS via Simple Gateway
      if (patient.phone) {
        const smsMessage = `APPOINTMENT CONFIRMED\n\nHello ${patient.name},\n\nYour appointment at ${hospital.name} is confirmed.\n\nDate: ${dateStr}\nTime: ${timeStr}\nType: ${appointment.type}\nReason: ${appointment.reason}\n\nPlease arrive 15 minutes early.\n\n- mHealth Reminder`;
        
        await this.sendSMS(patient.phone, smsMessage, patient.id);
      }

      // Send email
      if (patient.email) {
        await this.emailService.sendAppointmentConfirmation(
          patient.email,
          patient.name,
          hospital.name,
          dateStr,
          timeStr,
          appointment.type,
          appointment.reason
        );
      }

      this.logger.log(`Appointment notifications sent to patient ${patient.name} (ID: ${patient.id})`);
    } catch (error) {
      this.logger.error('Failed to send appointment notifications', error);
      // Don't throw error - notification failure shouldn't break appointment creation
    }
  }

  private async sendSMS(phone: string, message: string, patientId: number) {
    try {
      const smsGatewayUrl = process.env.SMS_GATEWAY_URL;
      
      if (!smsGatewayUrl) {
        this.logger.warn('SMS_GATEWAY_URL not configured');
        return;
      }

      const response = await fetch(smsGatewayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.replace(/\s/g, ''),
          message: message
        }),
      });

      if (!response.ok) {
        throw new Error(`SMS Gateway returned ${response.status}`);
      }

      // Log SMS in database
      await this.prisma.smsLog.create({
        data: {
          patientId,
          phone: phone.replace(/\s/g, ''),
          message,
          status: 'delivered',
        },
      });

      this.logger.log(`SMS sent to ${phone}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phone}`, error);
      
      // Log failed SMS
      try {
        await this.prisma.smsLog.create({
          data: {
            patientId,
            phone: phone.replace(/\s/g, ''),
            message,
            status: 'failed',
          },
        });
      } catch (dbError) {
        this.logger.error('Failed to log SMS error', dbError);
      }
    }
  }

  async remove(id: number) {
    return this.prisma.appointment.delete({
      where: { id },
    });
  }
}
