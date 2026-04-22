import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSideEffectDto } from './dto/create-side-effect.dto';
import { UpdateSideEffectDto } from './dto/update-side-effect.dto';

@Injectable()
export class SideEffectService {
  constructor(private prisma: PrismaService) {}

  async create(createSideEffectDto: CreateSideEffectDto) {
    const { reportedDate, startDate, ...rest } = createSideEffectDto;
    return this.prisma.sideEffect.create({
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : new Date(),
        reportedDate: reportedDate ? new Date(reportedDate) : new Date(),
      },
    });
  }

  async findAll(providerId?: number) {
    return this.prisma.sideEffect.findMany({
      where: providerId ? { patient: { registeredByUserId: providerId } } : undefined,
      include: {
        patient: true,
        prescription: true,
      },
    });
  }

  async findByPatient(patientId: number) {
    return this.prisma.sideEffect.findMany({
      where: { patientId },
      orderBy: { reportedDate: 'desc' },
      include: {
        prescription: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.sideEffect.findUnique({
      where: { id },
      include: {
        patient: true,
        prescription: true,
      },
    });
  }

  async update(id: number, updateSideEffectDto: UpdateSideEffectDto) {
    const { reportedDate, startDate, ...rest } = updateSideEffectDto;
    return this.prisma.sideEffect.update({
      where: { id },
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : undefined,
        reportedDate: reportedDate ? new Date(reportedDate) : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.sideEffect.delete({
      where: { id },
    });
  }
}
