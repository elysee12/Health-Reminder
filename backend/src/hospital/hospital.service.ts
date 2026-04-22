import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';

@Injectable()
export class HospitalService {
  constructor(private prisma: PrismaService) {}

  async create(createHospitalDto: CreateHospitalDto) {
    return this.prisma.hospital.create({
      data: createHospitalDto,
    });
  }

  async findAll() {
    return this.prisma.hospital.findMany({
      include: {
        _count: {
          select: {
            providers: true,
            patients: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.hospital.findUnique({
      where: { id },
      include: {
        providers: true,
        patients: true,
      },
    });
  }

  async update(id: number, updateHospitalDto: UpdateHospitalDto) {
    return this.prisma.hospital.update({
      where: { id },
      data: updateHospitalDto,
    });
  }

  async remove(id: number) {
    return this.prisma.hospital.delete({
      where: { id },
    });
  }
}
