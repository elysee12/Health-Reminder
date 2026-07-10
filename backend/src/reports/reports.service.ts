import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private getDateRange(period?: string, startDate?: string, endDate?: string) {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now.setHours(23, 59, 59, 999));

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      switch (period) {
        case 'today':
          start = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          start = new Date(now);
          start.setDate(start.getDate() - 7);
          start.setHours(0, 0, 0, 0);
          break;
        case 'month':
          start = new Date(now);
          start.setMonth(start.getMonth() - 1);
          start.setHours(0, 0, 0, 0);
          break;
        case 'year':
          start = new Date(now);
          start.setFullYear(start.getFullYear() - 1);
          start.setHours(0, 0, 0, 0);
          break;
        default:
          start = new Date(now);
          start.setMonth(start.getMonth() - 1);
          start.setHours(0, 0, 0, 0);
      }
    }

    return { start, end };
  }

  private async getAuthorizedPatientIds(user: any): Promise<number[] | undefined> {
    if (user.role === 'admin') {
      return undefined; // Admin can see all
    }

    if (user.role === 'provider') {
      // Get patients registered by this provider, patients with prescriptions from this provider, 
      // AND all patients from the provider's hospital
      const [registeredPatients, prescriptionPatients, hospitalPatients] = await Promise.all([
        this.prisma.patient.findMany({
          where: { registeredByUserId: user.id },
          select: { id: true },
        }),
        this.prisma.prescription.findMany({
          where: { providerId: user.id },
          select: { patientId: true },
          distinct: ['patientId'],
        }),
        user.hospitalId ? this.prisma.patient.findMany({
          where: { hospitalId: user.hospitalId },
          select: { id: true },
        }) : []
      ]);

      // Combine and deduplicate patient IDs
      const patientIds = new Set([
        ...registeredPatients.map(p => p.id),
        ...prescriptionPatients.map(p => p.patientId),
        ...hospitalPatients.map(p => p.id)
      ]);

      return Array.from(patientIds);
    }

    if (user.role === 'patient') {
      // Patient can only see their own data
      const patient = await this.prisma.patient.findUnique({
        where: { userId: user.id },
        select: { id: true },
      });
      return patient ? [patient.id] : [];
    }

    return [];
  }

  async getAdherenceReport(user: any, filters: any) {
    const { start, end } = this.getDateRange(filters.period, filters.startDate, filters.endDate);
    const authorizedPatientIds = await this.getAuthorizedPatientIds(user);

    const whereClause: any = {
      scheduledTime: { gte: start, lte: end },
    };

    if (authorizedPatientIds) {
      whereClause.patientId = { in: authorizedPatientIds };
    }

    if (filters.patientId) {
      if (authorizedPatientIds && !authorizedPatientIds.includes(filters.patientId)) {
        throw new ForbiddenException('Access denied to this patient data');
      }
      whereClause.patientId = filters.patientId;
    }

    if (filters.hospitalId && user.role === 'admin') {
      const patientIds = await this.prisma.patient.findMany({
        where: { hospitalId: filters.hospitalId },
        select: { id: true },
      });
      whereClause.patientId = { in: patientIds.map(p => p.id) };
    }

    const records = await this.prisma.reminder.findMany({
      where: whereClause,
      include: {
        patient: {
          select: { id: true, name: true, phone: true, hospital: { select: { name: true } } },
        },
        prescription: {
          select: { medication: true, dosage: true },
        },
      },
      orderBy: { scheduledTime: 'desc' },
    });

    const stats = {
      total: records.length,
      taken: records.filter(r => r.status === 'taken').length,
      missed: records.filter(r => r.status === 'missed').length,
      pending: records.filter(r => r.status === 'pending' || r.status === 'snoozed').length,
      adherenceRate: 0,
    };

    if (stats.total > 0) {
      stats.adherenceRate = Math.round((stats.taken / stats.total) * 100);
    }

    // Group records by patient and medication to count taken/missed/pending per
    const groupedRecords: Record<string, { taken: number; missed: number; pending: number; late: number; patientName: string; medicationName: string; hospitalName?: string }> = {};

    records.forEach(r => {
      const key = `${r.patientId}-${r.prescriptionId || 'no-prescription'}`;
      if (!groupedRecords[key]) {
        groupedRecords[key] = {
          taken: 0,
          missed: 0,
          pending: 0,
          late: 0,
          patientName: r.patient?.name || 'Unknown',
          medicationName: r.medication || r.prescription?.medication || 'N/A',
          hospitalName: r.patient?.hospital?.name
        };
      }

      if (r.status === 'taken') groupedRecords[key].taken++;
      else if (r.status === 'missed') groupedRecords[key].missed++;
      else if (r.status === 'pending' || r.status === 'snoozed') groupedRecords[key].pending++;
    });

    const summaryRecords = Object.values(groupedRecords).map(r => ({
      patientName: r.patientName,
      medicationName: r.medicationName,
      hospitalName: r.hospitalName,
      taken: r.taken,
      missed: r.missed,
      pending: r.pending,
      total: r.taken + r.missed + r.pending,
    }));

    return {
      period: { start, end },
      stats,
      records: summaryRecords,
    };
  }

  async getPrescriptionReport(user: any, filters: any) {
    const { start, end } = this.getDateRange(filters.period, filters.startDate, filters.endDate);
    const authorizedPatientIds = await this.getAuthorizedPatientIds(user);

    const whereClause: any = {
      createdAt: { gte: start, lte: end },
    };

    if (authorizedPatientIds) {
      whereClause.patientId = { in: authorizedPatientIds };
    }

    if (filters.patientId) {
      if (authorizedPatientIds && !authorizedPatientIds.includes(filters.patientId)) {
        throw new ForbiddenException('Access denied to this patient data');
      }
      whereClause.patientId = filters.patientId;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.hospitalId && user.role === 'admin') {
      const patientIds = await this.prisma.patient.findMany({
        where: { hospitalId: filters.hospitalId },
        select: { id: true },
      });
      whereClause.patientId = { in: patientIds.map(p => p.id) };
    }

    const prescriptions = await this.prisma.prescription.findMany({
      where: whereClause,
      include: {
        patient: {
          select: { id: true, name: true, phone: true, hospital: { select: { name: true } } },
        },
        provider: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const stats = {
      total: prescriptions.length,
      active: prescriptions.filter(p => p.status === 'active').length,
      completed: prescriptions.filter(p => p.status === 'completed').length,
      discontinued: prescriptions.filter(p => p.status === 'discontinued').length,
    };

    return {
      period: { start, end },
      stats,
      prescriptions,
    };
  }

  async getRemindersReport(user: any, filters: any) {
    const { start, end } = this.getDateRange(filters.period, filters.startDate, filters.endDate);
    const authorizedPatientIds = await this.getAuthorizedPatientIds(user);

    const whereClause: any = {
      scheduledTime: { gte: start, lte: end },
    };

    if (authorizedPatientIds) {
      whereClause.patientId = { in: authorizedPatientIds };
    }

    if (filters.patientId) {
      if (authorizedPatientIds && !authorizedPatientIds.includes(filters.patientId)) {
        throw new ForbiddenException('Access denied to this patient data');
      }
      whereClause.patientId = filters.patientId;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.hospitalId && user.role === 'admin') {
      const patientIds = await this.prisma.patient.findMany({
        where: { hospitalId: filters.hospitalId },
        select: { id: true },
      });
      whereClause.patientId = { in: patientIds.map(p => p.id) };
    }

    const reminders = await this.prisma.reminder.findMany({
      where: whereClause,
      include: {
        patient: {
          select: { id: true, name: true, phone: true, hospital: { select: { name: true } } },
        },
      },
      orderBy: { scheduledTime: 'desc' },
    });

    const stats = {
      total: reminders.length,
      pending: reminders.filter(r => r.status === 'pending').length,
      taken: reminders.filter(r => r.status === 'taken').length,
      missed: reminders.filter(r => r.status === 'missed').length,
      snoozed: reminders.filter(r => r.status === 'snoozed').length,
    };

    return {
      period: { start, end },
      stats,
      reminders,
    };
  }

  async getAppointmentsReport(user: any, filters: any) {
    const { start, end } = this.getDateRange(filters.period, filters.startDate, filters.endDate);
    const authorizedPatientIds = await this.getAuthorizedPatientIds(user);

    const whereClause: any = {
      dateTime: { gte: start, lte: end },
    };

    if (authorizedPatientIds) {
      whereClause.patientId = { in: authorizedPatientIds };
    }

    if (filters.patientId) {
      if (authorizedPatientIds && !authorizedPatientIds.includes(filters.patientId)) {
        throw new ForbiddenException('Access denied to this patient data');
      }
      whereClause.patientId = filters.patientId;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.type) {
      whereClause.type = filters.type;
    }

    if (filters.hospitalId) {
      whereClause.hospitalId = filters.hospitalId;
    }

    const appointments = await this.prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          select: { id: true, name: true, phone: true },
        },
        hospital: {
          select: { name: true, district: true },
        },
      },
      orderBy: { dateTime: 'desc' },
    });

    const stats = {
      total: appointments.length,
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      cancelled: appointments.filter(a => a.status === 'cancelled').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      regular: appointments.filter(a => a.type === 'regular').length,
      emergency: appointments.filter(a => a.type === 'emergency').length,
    };

    return {
      period: { start, end },
      stats,
      appointments,
    };
  }

  async getPatientsReport(user: any, filters: any) {
    const authorizedPatientIds = await this.getAuthorizedPatientIds(user);

    const whereClause: any = {};

    if (authorizedPatientIds) {
      whereClause.id = { in: authorizedPatientIds };
    }

    if (filters.hospitalId && user.role === 'admin') {
      whereClause.hospitalId = filters.hospitalId;
    }

    if (filters.riskLevel) {
      whereClause.riskLevel = filters.riskLevel;
    }

    const patients = await this.prisma.patient.findMany({
      where: whereClause,
      include: {
        hospital: {
          select: { name: true, district: true },
        },
        prescriptions: {
          where: { status: 'active' },
          select: { medication: true, dosage: true },
        },
      },
      orderBy: { registeredDate: 'desc' },
    });

    const activePatients = patients.filter(p => p.prescriptions.length > 0);

    const summary = {
      total: patients.length,
      active: activePatients.length,
      highRisk: patients.filter(p => p.riskLevel === 'high').length,
      avgAdherence: patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + p.adherenceRate, 0) / patients.length) : 0,
    };

    return {
      summary,
      patients,
    };
  }

  async getSummaryReport(user: any, filters: any) {
    const { start, end } = this.getDateRange(filters.period, filters.startDate, filters.endDate);
    const authorizedPatientIds = await this.getAuthorizedPatientIds(user);

    const whereClause: any = authorizedPatientIds ? { patientId: { in: authorizedPatientIds } } : {};

    const [
      totalPatients,
      activePrescriptions,
      totalReminders,
      adherenceRecords,
      appointments,
    ] = await Promise.all([
      this.prisma.patient.count({
        where: authorizedPatientIds ? { id: { in: authorizedPatientIds } } : {},
      }),
      this.prisma.prescription.count({
        where: { ...whereClause, status: 'active' },
      }),
      this.prisma.reminder.count({
        where: { ...whereClause, scheduledTime: { gte: start, lte: end } },
      }),
      this.prisma.adherenceRecord.findMany({
        where: { ...whereClause, scheduledTime: { gte: start, lte: end } },
        select: { status: true },
      }),
      this.prisma.appointment.findMany({
        where: { ...whereClause, dateTime: { gte: start, lte: end } },
        select: { status: true, type: true },
      }),
    ]);

    const adherenceRate = adherenceRecords.length > 0
      ? Math.round((adherenceRecords.filter(r => r.status === 'taken').length / adherenceRecords.length) * 100)
      : 0;

    return {
      period: { start, end },
      summary: {
        totalPatients,
        activePrescriptions,
        totalReminders,
        adherenceRate,
        appointments: {
          total: appointments.length,
          confirmed: appointments.filter(a => a.status === 'confirmed').length,
          pending: appointments.filter(a => a.status === 'pending').length,
          emergency: appointments.filter(a => a.type === 'emergency').length,
        },
        adherence: {
          taken: adherenceRecords.filter(r => r.status === 'taken').length,
          missed: adherenceRecords.filter(r => r.status === 'missed').length,
          late: adherenceRecords.filter(r => r.status === 'late').length,
        },
      },
    };
  }

  async exportToExcel(reportType: string, reportData: any, res: Response) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(reportType.charAt(0).toUpperCase() + reportType.slice(1));

    // Define headers and rows based on report type
    if (reportType === 'adherence') {
      worksheet.columns = [
        { header: 'Patient Name', key: 'patientName', width: 30 },
        { header: 'Medication', key: 'medicationName', width: 30 },
        { header: 'Taken', key: 'taken', width: 10 },
        { header: 'Missed', key: 'missed', width: 10 },
        { header: 'Pending', key: 'pending', width: 10 },
        { header: 'Adherence Rate', key: 'adherenceRate', width: 15 },
      ];

      reportData.records.forEach((r: any) => {
        const total = r.taken + r.missed + r.pending;
        const adherenceRate = total > 0 ? `${Math.round((r.taken / total) * 100)}%` : '0%';
        worksheet.addRow({
          patientName: r.patientName,
          medicationName: r.medicationName,
          taken: r.taken,
          missed: r.missed,
          pending: r.pending,
          adherenceRate,
        });
      });
    } else if (reportType === 'patients') {
      worksheet.columns = [
        { header: 'Patient Name', key: 'name', width: 30 },
        { header: 'Age', key: 'age', width: 10 },
        { header: 'Gender', key: 'gender', width: 10 },
        { header: 'Risk Level', key: 'riskLevel', width: 15 },
        { header: 'Adherence Rate', key: 'adherenceRate', width: 15 },
      ];

      reportData.patients.forEach((p: any) => {
        worksheet.addRow({
          name: p.name,
          age: p.age,
          gender: p.gender,
          riskLevel: p.riskLevel || 'Low',
          adherenceRate: `${p.adherenceRate}%`,
        });
      });
    } else if (reportType === 'prescriptions') {
      worksheet.columns = [
        { header: 'Patient Name', key: 'patientName', width: 30 },
        { header: 'Medication', key: 'medication', width: 30 },
        { header: 'Dosage', key: 'dosage', width: 20 },
        { header: 'Start Date', key: 'startDate', width: 15 },
        { header: 'End Date', key: 'endDate', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
      ];

      reportData.prescriptions.forEach((p: any) => {
        worksheet.addRow({
          patientName: p.patient?.name || 'Unknown',
          medication: p.medication,
          dosage: p.dosage,
          startDate: p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A',
          endDate: p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A',
          status: p.status,
        });
      });
    } else if (reportType === 'appointments') {
      worksheet.columns = [
        { header: 'Patient Name', key: 'patientName', width: 30 },
        { header: 'Date & Time', key: 'dateTime', width: 25 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Reason', key: 'reason', width: 30 },
        { header: 'Status', key: 'status', width: 15 },
      ];

      reportData.appointments.forEach((a: any) => {
        worksheet.addRow({
          patientName: a.patient?.name || 'Unknown',
          dateTime: a.dateTime ? new Date(a.dateTime).toLocaleString() : 'N/A',
          type: a.type,
          reason: a.reason,
          status: a.status,
        });
      });
    } else if (reportType === 'reminders') {
      worksheet.columns = [
        { header: 'Patient Name', key: 'patientName', width: 30 },
        { header: 'Medication', key: 'medication', width: 30 },
        { header: 'Scheduled Time', key: 'scheduledTime', width: 25 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
      ];

      reportData.reminders.forEach((r: any) => {
        worksheet.addRow({
          patientName: r.patient?.name || 'Unknown',
          medication: r.medication,
          scheduledTime: r.scheduledTime ? new Date(r.scheduledTime).toLocaleString() : 'N/A',
          type: r.type,
          status: r.status,
        });
      });
    }

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${reportType}-report-${Date.now()}.xlsx"`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  }

  async exportToPDF(reportType: string, reportData: any, res: Response) {
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${reportType}-report-${Date.now()}.pdf"`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Add title
    doc
      .fontSize(20)
      .text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, {
        align: 'center',
      })
      .moveDown();

    // Add date
    doc
      .fontSize(10)
      .text(`Generated on: ${new Date().toLocaleString()}`, {
        align: 'right',
      })
      .moveDown(2);

    // Add content based on report type
    if (reportType === 'adherence') {
      // Add summary stats
      doc
        .fontSize(14)
        .text('Summary Statistics', { underline: true })
        .moveDown();
      
      const stats = reportData.stats;
      doc.fontSize(12);
      doc.text(`Total: ${stats.total}`);
      doc.text(`Taken: ${stats.taken}`);
      doc.text(`Missed: ${stats.missed}`);
      doc.text(`Pending: ${stats.pending}`);
      doc.text(`Adherence Rate: ${stats.adherenceRate}%`);
      doc.moveDown(2);

      // Add table headers
      const tableTop = doc.y;
      const colWidths = [150, 150, 60, 60, 60, 80];
      const headers = ['Patient Name', 'Medication', 'Taken', 'Missed', 'Pending', 'Adherence Rate'];
      
      let x = 50;
      doc.fontSize(10).font('Helvetica-Bold');
      headers.forEach((header, i) => {
        doc.text(header, x, tableTop, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
      doc.moveDown();
      doc.font('Helvetica');

      // Add table rows
      reportData.records.forEach((r: any) => {
        if (doc.y > 700) {
          doc.addPage();
        }
        
        const total = r.taken + r.missed + r.pending;
        const adherenceRate = total > 0 ? `${Math.round((r.taken / total) * 100)}%` : '0%';
        const row = [
          r.patientName,
          r.medicationName,
          r.taken.toString(),
          r.missed.toString(),
          r.pending.toString(),
          adherenceRate,
        ];
        
        x = 50;
        row.forEach((cell, i) => {
          doc.text(cell, x, doc.y, { width: colWidths[i], align: 'left' });
          x += colWidths[i];
        });
        doc.moveDown();
      });
    } else if (reportType === 'patients') {
      doc
        .fontSize(14)
        .text('Summary Statistics', { underline: true })
        .moveDown();
      
      const summary = reportData.summary;
      doc.fontSize(12);
      doc.text(`Total Patients: ${summary.total}`);
      doc.text(`Active: ${summary.active}`);
      doc.text(`High Risk: ${summary.highRisk}`);
      doc.text(`Avg Adherence: ${summary.avgAdherence}%`);
      doc.moveDown(2);

      const tableTop = doc.y;
      const colWidths = [150, 60, 80, 100, 100];
      const headers = ['Patient Name', 'Age', 'Gender', 'Risk Level', 'Adherence Rate'];
      
      let x = 50;
      doc.fontSize(10).font('Helvetica-Bold');
      headers.forEach((header, i) => {
        doc.text(header, x, tableTop, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
      doc.moveDown();
      doc.font('Helvetica');

      reportData.patients.forEach((p: any) => {
        if (doc.y > 700) {
          doc.addPage();
        }
        
        const row = [
          p.name,
          p.age?.toString() || 'N/A',
          p.gender || 'N/A',
          p.riskLevel || 'Low',
          `${p.adherenceRate}%`,
        ];
        
        x = 50;
        row.forEach((cell, i) => {
          doc.text(cell, x, doc.y, { width: colWidths[i], align: 'left' });
          x += colWidths[i];
        });
        doc.moveDown();
      });
    } else if (reportType === 'prescriptions') {
      doc
        .fontSize(14)
        .text('Summary Statistics', { underline: true })
        .moveDown();
      
      const stats = reportData.stats;
      doc.fontSize(12);
      doc.text(`Total: ${stats.total}`);
      doc.text(`Active: ${stats.active}`);
      doc.text(`Completed: ${stats.completed}`);
      doc.text(`Discontinued: ${stats.discontinued}`);
      doc.moveDown(2);

      const tableTop = doc.y;
      const colWidths = [120, 120, 100, 90, 90, 80];
      const headers = ['Patient Name', 'Medication', 'Dosage', 'Start Date', 'End Date', 'Status'];
      
      let x = 50;
      doc.fontSize(10).font('Helvetica-Bold');
      headers.forEach((header, i) => {
        doc.text(header, x, tableTop, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
      doc.moveDown();
      doc.font('Helvetica');

      reportData.prescriptions.forEach((p: any) => {
        if (doc.y > 700) {
          doc.addPage();
        }
        
        const row = [
          p.patient?.name || 'Unknown',
          p.medication,
          p.dosage || 'N/A',
          p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A',
          p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A',
          p.status,
        ];
        
        x = 50;
        row.forEach((cell, i) => {
          doc.text(cell, x, doc.y, { width: colWidths[i], align: 'left' });
          x += colWidths[i];
        });
        doc.moveDown();
      });
    } else if (reportType === 'appointments') {
      doc
        .fontSize(14)
        .text('Summary Statistics', { underline: true })
        .moveDown();
      
      const stats = reportData.stats;
      doc.fontSize(12);
      doc.text(`Total: ${stats.total}`);
      doc.text(`Confirmed: ${stats.confirmed}`);
      doc.text(`Pending: ${stats.pending}`);
      doc.text(`Cancelled: ${stats.cancelled}`);
      doc.moveDown(2);

      const tableTop = doc.y;
      const colWidths = [120, 130, 80, 130, 80];
      const headers = ['Patient Name', 'Date & Time', 'Type', 'Reason', 'Status'];
      
      let x = 50;
      doc.fontSize(10).font('Helvetica-Bold');
      headers.forEach((header, i) => {
        doc.text(header, x, tableTop, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
      doc.moveDown();
      doc.font('Helvetica');

      reportData.appointments.forEach((a: any) => {
        if (doc.y > 700) {
          doc.addPage();
        }
        
        const row = [
          a.patient?.name || 'Unknown',
          a.dateTime ? new Date(a.dateTime).toLocaleString() : 'N/A',
          a.type,
          a.reason || 'N/A',
          a.status,
        ];
        
        x = 50;
        row.forEach((cell, i) => {
          doc.text(cell, x, doc.y, { width: colWidths[i], align: 'left' });
          x += colWidths[i];
        });
        doc.moveDown();
      });
    } else if (reportType === 'reminders') {
      doc
        .fontSize(14)
        .text('Summary Statistics', { underline: true })
        .moveDown();
      
      const stats = reportData.stats;
      doc.fontSize(12);
      doc.text(`Total: ${stats.total}`);
      doc.text(`Taken: ${stats.taken}`);
      doc.text(`Pending: ${stats.pending}`);
      doc.text(`Missed: ${stats.missed}`);
      doc.moveDown(2);

      const tableTop = doc.y;
      const colWidths = [120, 130, 140, 80, 80];
      const headers = ['Patient Name', 'Medication', 'Scheduled Time', 'Type', 'Status'];
      
      let x = 50;
      doc.fontSize(10).font('Helvetica-Bold');
      headers.forEach((header, i) => {
        doc.text(header, x, tableTop, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
      doc.moveDown();
      doc.font('Helvetica');

      reportData.reminders.forEach((r: any) => {
        if (doc.y > 700) {
          doc.addPage();
        }
        
        const row = [
          r.patient?.name || 'Unknown',
          r.medication || 'N/A',
          r.scheduledTime ? new Date(r.scheduledTime).toLocaleString() : 'N/A',
          r.type || 'N/A',
          r.status,
        ];
        
        x = 50;
        row.forEach((cell, i) => {
          doc.text(cell, x, doc.y, { width: colWidths[i], align: 'left' });
          x += colWidths[i];
        });
        doc.moveDown();
      });
    }

    // Finalize PDF
    doc.end();
  }
}
