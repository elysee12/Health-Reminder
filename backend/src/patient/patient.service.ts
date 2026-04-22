import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  async create(createPatientDto: CreatePatientDto) {
    const { registeredDate, userId, hospitalId, registeredByUserId, registeredByHospitalId, ...rest } = createPatientDto;
    
    // Hash password if provided
    if (rest.password) {
      rest.password = await bcrypt.hash(rest.password, 10);
    }

    return this.prisma.patient.create({
      data: {
        ...rest,
        user: typeof userId === 'number' ? { connect: { id: userId } } : undefined,
        hospital:
          typeof hospitalId === 'number'
            ? { connect: { id: hospitalId } }
            : typeof registeredByHospitalId === 'number'
            ? { connect: { id: registeredByHospitalId } }
            : undefined,
        registeredByUser:
          typeof registeredByUserId === 'number' ? { connect: { id: registeredByUserId } } : undefined,
        registeredByHospital:
          typeof registeredByHospitalId === 'number' ? { connect: { id: registeredByHospitalId } } : undefined,
        registeredDate: new Date(registeredDate),
      },
    });
  }

  async findAll(registeredByUserId?: number) {
    return this.prisma.patient.findMany({
      where: registeredByUserId ? { registeredByUserId } : undefined,
      include: {
        hospital: true,
        user: true,
        registeredByUser: true,
        registeredByHospital: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.patient.findUnique({
      where: { id },
      include: {
        hospital: true,
        user: true,
        registeredByUser: true,
        registeredByHospital: true,
        prescriptions: true,
        reminders: true,
        adherenceRecords: true,
      },
    });
  }

  async update(id: number, updatePatientDto: UpdatePatientDto) {
    const { registeredDate, userId, hospitalId, registeredByUserId, registeredByHospitalId, ...rest } = updatePatientDto as any;
    
    // Hash password if provided
    if (rest.password) {
      rest.password = await bcrypt.hash(rest.password, 10);
    }

    return this.prisma.patient.update({
      where: { id },
      data: {
        ...rest,
        user: typeof userId === 'number' ? { connect: { id: userId } } : undefined,
        hospital: typeof hospitalId === 'number' ? { connect: { id: hospitalId } } : undefined,
        registeredByUser: typeof registeredByUserId === 'number' ? { connect: { id: registeredByUserId } } : undefined,
        registeredByHospital: typeof registeredByHospitalId === 'number' ? { connect: { id: registeredByHospitalId } } : undefined,
        registeredDate: registeredDate ? new Date(registeredDate) : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.patient.delete({
      where: { id },
    });
  }
}
