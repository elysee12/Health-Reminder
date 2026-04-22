import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';

@Injectable()
export class FollowUpService {
  constructor(private prisma: PrismaService) {}

  async create(createFollowUpDto: CreateFollowUpDto) {
    const { followUpDate, ...rest } = createFollowUpDto;
    return this.prisma.followUp.create({
      data: {
        ...rest,
        followUpDate: new Date(followUpDate),
      },
    });
  }

  async findAll() {
    return this.prisma.followUp.findMany({
      include: {
        patient: true,
        provider: true,
      },
    });
  }

  async findByPatient(patientId: number) {
    return this.prisma.followUp.findMany({
      where: { patientId },
      orderBy: { followUpDate: 'desc' },
      include: {
        provider: true,
      },
    });
  }

  async findByProvider(providerId: number) {
    return this.prisma.followUp.findMany({
      where: { providerId },
      orderBy: { followUpDate: 'asc' },
      include: {
        patient: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.followUp.findUnique({
      where: { id },
      include: {
        patient: true,
        provider: true,
      },
    });
  }

  async update(id: number, updateFollowUpDto: UpdateFollowUpDto) {
    const { followUpDate, ...rest } = updateFollowUpDto;
    return this.prisma.followUp.update({
      where: { id },
      data: {
        ...rest,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.followUp.delete({
      where: { id },
    });
  }
}
