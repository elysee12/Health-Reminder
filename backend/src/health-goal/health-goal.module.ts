import { Module } from '@nestjs/common';
import { HealthGoalService } from './health-goal.service';
import { HealthGoalController } from './health-goal.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HealthGoalController],
  providers: [HealthGoalService],
  exports: [HealthGoalService],
})
export class HealthGoalModule {}
