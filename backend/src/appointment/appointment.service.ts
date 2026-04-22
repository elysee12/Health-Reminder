import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    const { dateTime, ...rest } = createAppointmentDto;
    return this.prisma.appointment.create({
      data: {
        ...rest,
        dateTime: new Date(dateTime),
      },
    });
  }

  async findAll() {
    return this.prisma.appointment.findMany({
      include: {
        patient: true,
        hospital: true,
      },
    });
  }

  async findByPatient(patientId: number) {
    return this.prisma.appointment.findMany({
      where: { patientId },
      orderBy: { dateTime: 'desc' },
      include: {
        hospital: true,
      },
    });
  }

  async findByHospital(hospitalId: number) {
    return this.prisma.appointment.findMany({
      where: { hospitalId },
      orderBy: { dateTime: 'asc' },
      include: {
        patient: true,
      },
    });
  }

  async findByProvider(providerId: number) {
    return this.prisma.appointment.findMany({
      where: { patient: { registeredByUserId: providerId } },
      orderBy: { dateTime: 'asc' },
      include: {
        patient: true,
        hospital: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        hospital: true,
      },
    });
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    const { dateTime, ...rest } = updateAppointmentDto;
    return this.prisma.appointment.update({
      where: { id },
      data: {
        ...rest,
        dateTime: dateTime ? new Date(dateTime) : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.appointment.delete({
      where: { id },
    });
  }
}
