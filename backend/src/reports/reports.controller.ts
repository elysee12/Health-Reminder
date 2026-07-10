import { Controller, Get, Query, UseGuards, Request, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response } from 'express';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('adherence')
  async getAdherenceReport(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('period') period?: 'today' | 'week' | 'month' | 'year',
    @Query('patientId') patientId?: string,
    @Query('hospitalId') hospitalId?: string,
  ) {
    const user = req.user;
    return this.reportsService.getAdherenceReport(user, {
      startDate,
      endDate,
      period,
      patientId: patientId ? parseInt(patientId) : undefined,
      hospitalId: hospitalId ? parseInt(hospitalId) : undefined,
    });
  }

  @Get('prescriptions')
  async getPrescriptionReport(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('period') period?: 'today' | 'week' | 'month' | 'year',
    @Query('status') status?: 'active' | 'completed' | 'discontinued',
    @Query('patientId') patientId?: string,
    @Query('hospitalId') hospitalId?: string,
  ) {
    const user = req.user;
    return this.reportsService.getPrescriptionReport(user, {
      startDate,
      endDate,
      period,
      status,
      patientId: patientId ? parseInt(patientId) : undefined,
      hospitalId: hospitalId ? parseInt(hospitalId) : undefined,
    });
  }

  @Get('reminders')
  async getRemindersReport(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('period') period?: 'today' | 'week' | 'month' | 'year',
    @Query('status') status?: 'pending' | 'taken' | 'missed' | 'snoozed',
    @Query('patientId') patientId?: string,
    @Query('hospitalId') hospitalId?: string,
  ) {
    const user = req.user;
    return this.reportsService.getRemindersReport(user, {
      startDate,
      endDate,
      period,
      status,
      patientId: patientId ? parseInt(patientId) : undefined,
      hospitalId: hospitalId ? parseInt(hospitalId) : undefined,
    });
  }

  @Get('appointments')
  async getAppointmentsReport(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('period') period?: 'today' | 'week' | 'month' | 'year',
    @Query('status') status?: 'pending' | 'confirmed' | 'cancelled' | 'completed',
    @Query('type') type?: 'regular' | 'emergency',
    @Query('patientId') patientId?: string,
    @Query('hospitalId') hospitalId?: string,
  ) {
    const user = req.user;
    return this.reportsService.getAppointmentsReport(user, {
      startDate,
      endDate,
      period,
      status,
      type,
      patientId: patientId ? parseInt(patientId) : undefined,
      hospitalId: hospitalId ? parseInt(hospitalId) : undefined,
    });
  }

  @Get('patients')
  async getPatientsReport(
    @Request() req,
    @Query('hospitalId') hospitalId?: string,
    @Query('riskLevel') riskLevel?: 'low' | 'moderate' | 'high',
  ) {
    const user = req.user;
    return this.reportsService.getPatientsReport(user, {
      hospitalId: hospitalId ? parseInt(hospitalId) : undefined,
      riskLevel,
    });
  }

  @Get('summary')
  async getSummaryReport(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('period') period?: 'today' | 'week' | 'month' | 'year',
  ) {
    const user = req.user;
    return this.reportsService.getSummaryReport(user, {
      startDate,
      endDate,
      period,
    });
  }

  @Get('export/excel')
  async exportToExcel(
    @Request() req,
    @Res() res: Response,
    @Query('reportType') reportType: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('period') period?: string,
    @Query('patientId') patientId?: string,
    @Query('hospitalId') hospitalId?: string,
    @Query('status') status?: string,
  ) {
    const user = req.user;
    let reportData;

    // Get the report data first
    if (reportType === 'adherence') {
      reportData = await this.reportsService.getAdherenceReport(user, {
        startDate,
        endDate,
        period,
        patientId: patientId ? parseInt(patientId) : undefined,
        hospitalId: hospitalId ? parseInt(hospitalId) : undefined,
      });
    } else if (reportType === 'patients') {
      reportData = await this.reportsService.getPatientsReport(user, {
        hospitalId: hospitalId ? parseInt(hospitalId) : undefined,
      });
    } else if (reportType === 'prescriptions') {
      reportData = await this.reportsService.getPrescriptionReport(user, {
        startDate,
        endDate,
        period,
        status,
        patientId: patientId ? parseInt(patientId) : undefined,
        hospitalId: hospitalId ? parseInt(hospitalId) : undefined,
      });
    } else if (reportType === 'appointments') {
      reportData = await this.reportsService.getAppointmentsReport(user, {
        startDate,
        endDate,
        period,
        status,
        patientId: patientId ? parseInt(patientId) : undefined,
        hospitalId: hospitalId ? parseInt(hospitalId) : undefined,
      });
    } else if (reportType === 'reminders') {
      reportData = await this.reportsService.getRemindersReport(user, {
        startDate,
        endDate,
        period,
        status,
        patientId: patientId ? parseInt(patientId) : undefined,
        hospitalId: hospitalId ? parseInt(hospitalId) : undefined,
      });
    } else {
      throw new Error('Invalid report type');
    }

    await this.reportsService.exportToExcel(reportType, reportData, res);
  }

  @Get('export/pdf')
  async exportToPDF(
    @Request() req,
    @Res() res: Response,
    @Query('reportType') reportType: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('period') period?: string,
    @Query('patientId') patientId?: string,
    @Query('hospitalId') hospitalId?: string,
    @Query('status') status?: string,
  ) {
    const user = req.user;
    let reportData;

    // Get the report data first
    if (reportType === 'adherence') {
      reportData = await this.reportsService.getAdherenceReport(user, {
        startDate,
        endDate,
        period,
        patientId: patientId ? parseInt(patientId) : undefined,
        hospitalId: hospitalId ? parseInt(hospitalId) : undefined,
      });
    } else if (reportType === 'patients') {
      reportData = await this.reportsService.getPatientsReport(user, {
        hospitalId: hospitalId ? parseInt(hospitalId) : undefined,
      });
    } else if (reportType === 'prescriptions') {
      reportData = await this.reportsService.getPrescriptionReport(user, {
        startDate,
        endDate,
        period,
        status,
        patientId: patientId ? parseInt(patientId) : undefined,
        hospitalId: hospitalId ? parseInt(hospitalId) : undefined,
      });
    } else if (reportType === 'appointments') {
      reportData = await this.reportsService.getAppointmentsReport(user, {
        startDate,
        endDate,
        period,
        status,
        patientId: patientId ? parseInt(patientId) : undefined,
        hospitalId: hospitalId ? parseInt(hospitalId) : undefined,
      });
    } else if (reportType === 'reminders') {
      reportData = await this.reportsService.getRemindersReport(user, {
        startDate,
        endDate,
        period,
        status,
        patientId: patientId ? parseInt(patientId) : undefined,
        hospitalId: hospitalId ? parseInt(hospitalId) : undefined,
      });
    } else {
      throw new Error('Invalid report type');
    }

    await this.reportsService.exportToPDF(reportType, reportData, res);
  }
}
