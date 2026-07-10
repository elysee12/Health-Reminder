import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getPublicStats() {
    const [patientCount, reminderCount, hospitalCount, userCount] = await Promise.all([
      this.prisma.patient.count(),
      this.prisma.reminder.count(),
      this.prisma.hospital.count(),
      this.prisma.user.count(),
    ]);

    return {
      patientCount,
      reminderCount,
      hospitalCount,
      userCount,
    };
  }
}
