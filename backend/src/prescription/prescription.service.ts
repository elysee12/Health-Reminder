import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { ReminderType } from '@prisma/client';

@Injectable()
export class PrescriptionService {
  constructor(private prisma: PrismaService) {}

  async create(createPrescriptionDto: CreatePrescriptionDto) {
    const { startDate, endDate, patientId, providerId, reminderType, reminderTimes, ...rest } = createPrescriptionDto;

    const prescription = await this.prisma.prescription.create({
      data: {
        ...rest,
        patient: { connect: { id: patientId } },
        provider: typeof providerId === 'number' ? { connect: { id: providerId } } : undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reminderType,
        reminderTimes: reminderTimes as any,
      },
    });

    await this.generateReminders(prescription.id, patientId, prescription.medication, prescription.dosage, startDate, endDate, reminderType, reminderTimes);

    return prescription;
  }

  private async generateReminders(
    prescriptionId: number,
    patientId: number,
    medication: string,
    dosage: string,
    startDate: string | Date,
    endDate: string | Date,
    reminderType: ReminderType,
    reminderTimes: string[]
  ) {
    // Delete existing reminders first
    await this.prisma.reminder.deleteMany({
      where: { prescriptionId },
    });

    const remindersToCreate: any[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Create dates in Rwanda timezone (CAT - UTC+2)
    let currentDate = new Date(start);
    currentDate.setHours(0, 0, 0, 0);
    
    const endBoundary = new Date(end);
    endBoundary.setHours(23, 59, 59, 999);

    while (currentDate <= endBoundary) {
      for (const time of reminderTimes) {
        const [hours, minutes] = time.split(':').map(Number);
        
        // Create the scheduled time in Rwanda timezone
        // Format: YYYY-MM-DD HH:MM:SS (will be interpreted as local Rwanda time)
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hoursStr = String(hours).padStart(2, '0');
        const minutesStr = String(minutes).padStart(2, '0');
        
        // Create date string in Rwanda timezone format
        const dateStr = `${year}-${month}-${day}T${hoursStr}:${minutesStr}:00+02:00`;
        const scheduledTime = new Date(dateStr);

        if (scheduledTime >= start && scheduledTime <= end) {
          remindersToCreate.push({
            patientId,
            prescriptionId,
            medication,
            dosage,
            scheduledTime,
            type: reminderType,
          });
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (remindersToCreate.length > 0) {
      await this.prisma.reminder.createMany({
        data: remindersToCreate,
      });
    }
  }

  async findAll(providerId?: number) {
    return this.prisma.prescription.findMany({
      where: providerId ? { providerId } : undefined,
      include: {
        patient: true,
        provider: true,
        reminders: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: true,
        provider: true,
        reminders: true,
      },
    });
  }

  async update(id: number, updatePrescriptionDto: UpdatePrescriptionDto) {
    const { startDate, endDate, patientId, providerId, reminderType, reminderTimes, ...rest } = updatePrescriptionDto as any;
    
    const prescription = await this.prisma.prescription.update({
      where: { id },
      data: {
        ...rest,
        patient: typeof patientId === 'number' ? { connect: { id: patientId } } : undefined,
        provider: typeof providerId === 'number' ? { connect: { id: providerId } } : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        reminderType,
        reminderTimes: reminderTimes as any,
      },
    });

    // Regenerate reminders using latest values from the updated prescription
    await this.generateReminders(
      prescription.id,
      prescription.patientId,
      prescription.medication,
      prescription.dosage,
      prescription.startDate,
      prescription.endDate,
      prescription.reminderType,
      prescription.reminderTimes as string[]
    );

    return prescription;
  }

  async remove(id: number) {
    return this.prisma.prescription.delete({
      where: { id },
    });
  }
}
