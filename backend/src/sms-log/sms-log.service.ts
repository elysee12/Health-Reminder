import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSmsLogDto } from './create-sms-log.dto';
import { UpdateSmsLogDto } from './update-sms-log.dto';

@Injectable()
export class SmsLogService {
  constructor(private prisma: PrismaService) {}

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
