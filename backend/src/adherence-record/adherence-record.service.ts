import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdherenceRecordDto } from './dto/create-adherence-record.dto';
import { UpdateAdherenceRecordDto } from './dto/update-adherence-record.dto';

@Injectable()
export class AdherenceRecordService {
  constructor(private prisma: PrismaService) {}

  async create(createAdherenceRecordDto: CreateAdherenceRecordDto) {
    const { scheduledTime, confirmedTime, patientId, prescriptionId, ...rest } = createAdherenceRecordDto;
    return this.prisma.adherenceRecord.create({
      data: {
        ...rest,
        patient: { connect: { id: patientId } },
        prescription: typeof prescriptionId === 'number' ? { connect: { id: prescriptionId } } : undefined,
        scheduledTime: new Date(scheduledTime),
        confirmedTime: confirmedTime ? new Date(confirmedTime) : undefined,
      },
    });
  }

  async findAll(providerId?: number) {
    return this.prisma.adherenceRecord.findMany({
      where: providerId ? { patient: { registeredByUserId: providerId } } : undefined,
      include: {
        patient: true,
        prescription: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.adherenceRecord.findUnique({
      where: { id },
      include: {
        patient: true,
        prescription: true,
      },
    });
  }

  async update(id: number, updateAdherenceRecordDto: UpdateAdherenceRecordDto) {
    const { scheduledTime, confirmedTime, patientId, prescriptionId, ...rest } = updateAdherenceRecordDto as any;
    return this.prisma.adherenceRecord.update({
      where: { id },
      data: {
        ...rest,
        patient: typeof patientId === 'number' ? { connect: { id: patientId } } : undefined,
        prescription: typeof prescriptionId === 'number' ? { connect: { id: prescriptionId } } : undefined,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
        confirmedTime: confirmedTime ? new Date(confirmedTime) : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.adherenceRecord.delete({
      where: { id },
    });
  }
}
