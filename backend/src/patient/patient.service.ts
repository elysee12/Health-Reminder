import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  async create(createPatientDto: CreatePatientDto) {
    const { registeredDate, userId, hospitalId, registeredByUserId, registeredByHospitalId, ...rest } = createPatientDto;
    
    // Convert empty string email to null
    if (rest.email === '') {
      rest.email = undefined;
    }
    
    // Hash password if provided
    if (rest.password) {
      rest.password = await bcrypt.hash(rest.password, 10);
    }

    try {
      return await this.prisma.patient.create({
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
    } catch (error: any) {
      // Handle Prisma unique constraint errors
      if (error.code === 'P2002') {
        // error.meta.target can be a string like 'Patient_phone_key' or an array like ['phone']
        const target = error.meta?.target;
        const field = Array.isArray(target) ? target[0] : target;
        
        if (field && field.includes('phone')) {
          throw new ConflictException('This phone number is already registered. Please use a different phone number or login if you already have an account.');
        }
        if (field && field.includes('email')) {
          throw new ConflictException('This email is already registered. Please use a different email or login if you already have an account.');
        }
        if (field && field.includes('nationalId')) {
          throw new ConflictException('This national ID is already registered. Please use a different ID or login if you already have an account.');
        }
        throw new ConflictException('This information is already registered. Please use different values or login if you already have an account.');
      }
      throw error;
    }
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
    
    // Convert empty string email to null
    if (rest.email === '') {
      rest.email = null;
    }
    
    // Hash password if provided
    if (rest.password) {
      rest.password = await bcrypt.hash(rest.password, 10);
    }

    try {
      return await this.prisma.patient.update({
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
    } catch (error: any) {
      // Handle Prisma unique constraint errors
      if (error.code === 'P2002') {
        // error.meta.target can be a string like 'Patient_phone_key' or an array like ['phone']
        const target = error.meta?.target;
        const field = Array.isArray(target) ? target[0] : target;
        
        if (field && field.includes('phone')) {
          throw new ConflictException('This phone number is already used by another patient. Please use a different phone number.');
        }
        if (field && field.includes('email')) {
          throw new ConflictException('This email is already used by another patient. Please use a different email.');
        }
        if (field && field.includes('nationalId')) {
          throw new ConflictException('This national ID is already used by another patient. Please use a different ID.');
        }
        throw new ConflictException('This information is already used by another patient. Please use different values.');
      }
      throw error;
    }
  }

  async remove(id: number) {
    return this.prisma.patient.delete({
      where: { id },
    });
  }
}
