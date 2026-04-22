import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Injectable()
export class ReminderService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.reminder.findMany({
      where: providerId ? { patient: { registeredByUserId: providerId } } : undefined,
      include: {
        patient: true,
        prescription: true,
      },
    });
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
