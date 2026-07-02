import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../auth/email.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, hospitalId, ...rest } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        ...rest,
        hospital: typeof hospitalId === 'number' ? { connect: { id: hospitalId } } : undefined,
        password: hashedPassword,
        status: rest.status || 'pending', // Default to pending if not specified (for access requests)
      },
    });

    // If status is pending (access request), send confirmation email
    if (user.status === 'pending') {
      await this.emailService.sendAccessRequestConfirmation(user.email, user.name);
    }

    // If status is active (admin created user), send credentials email with plain password
    if (user.status === 'active') {
      await this.emailService.sendUserCredentials(user.email, user.name, password, user.role);
    }

    return user;
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

    // Get current user to check status before update
    const currentUser = await this.prisma.user.findUnique({
      where: { id },
    });

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        hospital: typeof hospitalId === 'number' ? { connect: { id: hospitalId } } : undefined,
      },
    });

    // If status changed from 'pending' to 'active' (access request approved)
    if (currentUser && currentUser.status === 'pending' && updatedUser.status === 'active') {
      await this.emailService.sendAccountActivationEmail(updatedUser.email, updatedUser.name);
    }

    // If status changed from any other status to 'active' and admin created this user (has password in update)
    if (currentUser && currentUser.status !== 'active' && updatedUser.status === 'active' && data.password) {
      // This is admin activating and setting password, send credentials
      // Note: We can't send plain password here since it's already hashed above
      // Admins should create users with active status directly to send credentials
    }

    return updatedUser;
  }

  async remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
