import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHealthGoalDto } from './dto/create-health-goal.dto';
import { UpdateHealthGoalDto } from './dto/update-health-goal.dto';

@Injectable()
export class HealthGoalService {
  constructor(private prisma: PrismaService) {}

  async create(createHealthGoalDto: CreateHealthGoalDto) {
    const { startDate, endDate, ...rest } = createHealthGoalDto;
    return this.prisma.healthGoal.create({
      data: {
        ...rest,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
    });
  }

  async findAll(registeredByUserId?: number) {
    return this.prisma.healthGoal.findMany({
      where: registeredByUserId ? { patient: { registeredByUserId } } : undefined,
      include: {
        patient: true,
      },
    });
  }

  async findByPatient(patientId: number) {
    return this.prisma.healthGoal.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.healthGoal.findUnique({
      where: { id },
      include: {
        patient: true,
      },
    });
  }

  async update(id: number, updateHealthGoalDto: UpdateHealthGoalDto) {
    const { startDate, endDate, ...rest } = updateHealthGoalDto;
    return this.prisma.healthGoal.update({
      where: { id },
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.healthGoal.delete({
      where: { id },
    });
  }
}
