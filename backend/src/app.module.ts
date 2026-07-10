import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PatientModule } from './patient/patient.module';
import { HospitalModule } from './hospital/hospital.module';
import { PrescriptionModule } from './prescription/prescription.module';
import { ReminderModule } from './reminder/reminder.module';
import { AdherenceRecordModule } from './adherence-record/adherence-record.module';
import { ExternalSystemModule } from './external-system/external-system.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SmsLogModule } from './sms-log/sms-log.module';
import { HealthGoalModule } from './health-goal/health-goal.module';
import { SideEffectModule } from './side-effect/side-effect.module';
import { AppointmentModule } from './appointment/appointment.module';
import { FollowUpModule } from './follow-up/follow-up.module';
import { StatsModule } from './stats/stats.module';
import { ReportsModule } from './reports/reports.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UserModule,
    PatientModule,
    HospitalModule,
    PrescriptionModule,
    ReminderModule,
    AdherenceRecordModule,
    ExternalSystemModule,
    ApiKeyModule,
    SmsLogModule,
    HealthGoalModule,
    SideEffectModule,
    AppointmentModule,
    FollowUpModule,
    StatsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
