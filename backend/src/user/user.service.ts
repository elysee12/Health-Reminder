import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, hospitalId, ...rest } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return this.prisma.user.create({
      data: {
        ...rest,
        hospital: typeof hospitalId === 'number' ? { connect: { id: hospitalId } } : undefined,
        password: hashedPassword,
        status: rest.status || 'pending', // Default to pending if not specified (for access requests)
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: {
        hospital: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        hospital: true,
        patientProfile: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { hospitalId, ...data } = updateUserDto as any;
    
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        hospital: typeof hospitalId === 'number' ? { connect: { id: hospitalId } } : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
