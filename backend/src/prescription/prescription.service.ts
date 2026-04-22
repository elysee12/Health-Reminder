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
      },
    });

    // Generate reminders
    const remindersToCreate: any[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      for (const time of reminderTimes) {
        const [hours, minutes] = time.split(':').map(Number);
        const scheduledTime = new Date(d);
        scheduledTime.setHours(hours, minutes, 0, 0);

        remindersToCreate.push({
          patientId: patientId,
          prescriptionId: prescription.id,
          medication: prescription.medication,
          dosage: prescription.dosage,
          scheduledTime: scheduledTime,
          type: reminderType,
        });
      }
    }

    if (remindersToCreate.length > 0) {
      await this.prisma.reminder.createMany({
        data: remindersToCreate,
      });
    }

    return prescription;
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
    const { startDate, endDate, patientId, providerId, ...rest } = updatePrescriptionDto as any;
    return this.prisma.prescription.update({
      where: { id },
      data: {
        ...rest,
        patient: typeof patientId === 'number' ? { connect: { id: patientId } } : undefined,
        provider: typeof providerId === 'number' ? { connect: { id: providerId } } : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.prescription.delete({
      where: { id },
    });
  }
}
