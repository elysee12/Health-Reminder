import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExternalSystemDto } from './dto/create-external-system.dto';
import { UpdateExternalSystemDto } from './dto/update-external-system.dto';

@Injectable()
export class ExternalSystemService {
  constructor(private prisma: PrismaService) {}

  async create(createExternalSystemDto: CreateExternalSystemDto) {
    const { lastSync, ...rest } = createExternalSystemDto;
    return this.prisma.externalSystem.create({
      data: {
        ...rest,
        lastSync: lastSync ? new Date(lastSync) : undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.externalSystem.findMany();
  }

  async findOne(id: number) {
    return this.prisma.externalSystem.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateExternalSystemDto: UpdateExternalSystemDto) {
    const { lastSync, ...rest } = updateExternalSystemDto;
    return this.prisma.externalSystem.update({
      where: { id },
      data: {
        ...rest,
        lastSync: lastSync ? new Date(lastSync) : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.externalSystem.delete({
      where: { id },
    });
  }
}
