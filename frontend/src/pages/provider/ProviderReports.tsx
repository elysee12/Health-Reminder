import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import { FileText, Download, Calendar, Filter, Users, Pill, Bell, UserCheck, TrendingUp, FileBarChart, CheckCircle, XCircle, Clock, AlertCircle, FileSpreadsheet, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { generateReport, exportReportToExcel, exportReportToPDF } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { usePatients } from '@/hooks/use-api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ProviderReports() {
  const { user, t } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  
  // Load patients for dropdown (provider's assigned patients only)
  const { data: patients = [], isLoading: patientsLoading } = usePatients(user?.id);
  
  // Form state
  const [reportType, setReportType] = useState('patients');
  const [timeRange, setTimeRange] = useState('year');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [patientFilter, setPatientFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('any');

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const filters: any = {
        period: timeRange,
      };

      if (timeRange === 'custom') {
        if (!customStartDate || !customEndDate) {
          toast({
            title: 'Error',
            description: 'Please select both start and end dates for custom range',
            variant: 'destructive',
          });
          setIsGenerating(false);
          return;
        }
        filters.startDate = customStartDate;
        filters.endDate = customEndDate;
      }

      if (patientFilter && patientFilter !== 'all') filters.patientId = parseInt(patientFilter);
      if (statusFilter && statusFilter !== 'any') filters.status = statusFilter;

      const data = await generateReport(reportType, filters);

      setReportData(data);

      toast({
        title: 'Report Generated Successfully',
        description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report has been generated successfully`,
      });
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate report',
        variant: 'destructive',
      });
      setReportData(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToExcel = async () => {
    if (!reportData) return;
    
    toast({
      title: 'Excel Export',
      description: 'Downloading Excel file...',
    });

    try {
      const filters: any = {
        period: timeRange,
      };

      if (timeRange === 'custom') {
        filters.startDate = customStartDate;
        filters.endDate = customEndDate;
      }

      if (patientFilter && patientFilter !== 'all') filters.patientId = parseInt(patientFilter);
      if (statusFilter && statusFilter !== 'any') filters.status = statusFilter;

      await exportReportToExcel(reportType, filters);

      toast({
        title: 'Excel Export Success',
        description: 'Excel file downloaded successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Excel Export Error',
        description: error.message || 'Failed to download Excel file',
        variant: 'destructive',
      });
    }
  };

  const exportToPDF = async () => {
    if (!reportData) return;

    toast({
      title: 'PDF Export',
      description: 'Downloading PDF file...',
    });

    try {
      const filters: any = {
        period: timeRange,
      };

      if (timeRange === 'custom') {
        filters.startDate = customStartDate;
        filters.endDate = customEndDate;
      }

      if (patientFilter && patientFilter !== 'all') filters.patientId = parseInt(patientFilter);
      if (statusFilter && statusFilter !== 'any') filters.status = statusFilter;

      await exportReportToPDF(reportType, filters);

      toast({
        title: 'PDF Export Success',
        description: 'PDF file downloaded successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'PDF Export Error',
        description: error.message || 'Failed to download PDF file',
        variant: 'destructive',
      });
    }
  };

  // Auto-generate report on page load
  useEffect(() => {
    handleGenerateReport();
  }, []);

  const reportTypes = [
    { value: 'summary', label: 'Summary Report', icon: FileBarChart, description: 'Overview of all metrics' },
    { value: 'adherence', label: 'Adherence Report', icon: TrendingUp, description: 'Patient medication adherence' },
    { value: 'prescriptions', label: 'Prescription Report', icon: Pill, description: 'Active and completed prescriptions' },
    { value: 'reminders', label: 'Reminders Report', icon: Bell, description: 'Scheduled and sent reminders' },
    { value: 'appointments', label: 'Appointments Report', icon: Calendar, description: 'Upcoming and completed appointments' },
    { value: 'patients', label: 'Patients Report', icon: Users, description: 'Patient demographics and status' },
  ];

  // Render functions (same as Admin but focused on provider's assigned patients)
  const renderAdherenceReport = () => {
    if (!reportData || !reportData.records) return null;

    const takenCount = reportData.stats?.taken || 0;
    const missedCount = reportData.stats?.missed || 0;
    const pendingCount = reportData.stats?.pending || 0;
    const totalDoses = takenCount + missedCount + pendingCount;
    const adherenceRate = totalDoses > 0 ? Math.round((takenCount / totalDoses) * 100) : 0;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Medication Adherence Report
          </CardTitle>
          <CardDescription>Patient medication adherence for your assigned patients</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Adherence Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-semibold text-emerald-600 uppercase">Taken</p>
              </div>
              <p className="text-2xl font-bold text-emerald-900">{takenCount}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <p className="text-xs font-semibold text-red-600 uppercase">Missed</p>
              </div>
              <p className="text-2xl font-bold text-red-900">{missedCount}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <p className="text-xs font-semibold text-amber-600 uppercase">Pending</p>
              </div>
              <p className="text-2xl font-bold text-amber-900">{pendingCount}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-semibold text-blue-600 uppercase">Adherence Rate</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">{adherenceRate}%</p>
            </div>
          </div>

          {/* Detailed Records */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-600" />
              Patient Adherence Details
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold">Patient Name</TableHead>
                    <TableHead className="font-bold">Medication</TableHead>
                    <TableHead className="font-bold text-center">Taken</TableHead>
                    <TableHead className="font-bold text-center">Missed</TableHead>
                    <TableHead className="font-bold text-center">Pending</TableHead>
                    <TableHead className="font-bold text-center">Adherence Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.records.slice(0, 50).map((record: any, index: number) => {
                    const patientTotal = (record.taken || 0) + (record.missed || 0) + (record.pending || 0);
                    const patientAdherence = patientTotal > 0 ? Math.round(((record.taken || 0) / patientTotal) * 100) : 0;
                    
                    return (
                      <TableRow key={index} className="hover:bg-slate-50">
                        <TableCell className="font-semibold">{record.patientName || 'Unknown'}</TableCell>
                        <TableCell className="text-slate-600">{record.medicationName || 'N/A'}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                            <CheckCircle className="h-3 w-3" />
                            {record.taken || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                            <XCircle className="h-3 w-3" />
                            {record.missed || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                            <Clock className="h-3 w-3" />
                            {record.pending || 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`text-sm font-bold ${
                            patientAdherence >= 80 ? 'text-emerald-600' :
                            patientAdherence >= 60 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {patientAdherence}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {reportData.records.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No adherence records found for the selected period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {reportData.records.length > 50 && (
              <p className="text-sm text-slate-500 mt-2 text-center">
                Showing first 50 records of {reportData.records.length} total records
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAppointmentsReport = () => {
    if (!reportData || !reportData.appointments) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Appointments Report
          </CardTitle>
          <CardDescription>Scheduled and completed appointments for your patients</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Appointment Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-semibold text-blue-600 uppercase">Total</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">{reportData.stats?.total || 0}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-semibold text-emerald-600 uppercase">Confirmed</p>
              </div>
              <p className="text-2xl font-bold text-emerald-900">{reportData.stats?.confirmed || 0}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <p className="text-xs font-semibold text-amber-600 uppercase">Pending</p>
              </div>
              <p className="text-2xl font-bold text-amber-900">{reportData.stats?.pending || 0}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <p className="text-xs font-semibold text-red-600 uppercase">Cancelled</p>
              </div>
              <p className="text-2xl font-bold text-red-900">{reportData.stats?.cancelled || 0}</p>
            </div>
          </div>

          {/* Appointments List */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-slate-600" />
              Appointment Details
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold">Patient Name</TableHead>
                    <TableHead className="font-bold">Date & Time</TableHead>
                    <TableHead className="font-bold">Type</TableHead>
                    <TableHead className="font-bold">Reason</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.appointments.slice(0, 50).map((appointment: any, index: number) => (
                    <TableRow key={index} className="hover:bg-slate-50">
                      <TableCell className="font-semibold">{appointment.patient?.name || 'Unknown'}</TableCell>
                      <TableCell className="text-slate-600">
                        {appointment.dateTime ? new Date(appointment.dateTime).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-slate-600">{appointment.type || 'General'}</TableCell>
                      <TableCell className="text-slate-600">{appointment.reason || 'N/A'}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          appointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                          appointment.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {appointment.status === 'confirmed' && <CheckCircle className="h-3 w-3" />}
                          {appointment.status === 'pending' && <Clock className="h-3 w-3" />}
                          {appointment.status === 'cancelled' && <XCircle className="h-3 w-3" />}
                          {appointment.status || 'Unknown'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reportData.appointments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        No appointments found for the selected period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {reportData.appointments.length > 50 && (
              <p className="text-sm text-slate-500 mt-2 text-center">
                Showing first 50 records of {reportData.appointments.length} total appointments
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPatientsReport = () => {
    if (!reportData || !reportData.patients) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Patients Report - Hypertension
          </CardTitle>
          <CardDescription>Your assigned patients under hypertension management</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Patient Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-semibold text-blue-600 uppercase">Total Patients</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">{reportData.summary?.total || 0}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-semibold text-emerald-600 uppercase">Active</p>
              </div>
              <p className="text-2xl font-bold text-emerald-900">{reportData.summary?.active || 0}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <p className="text-xs font-semibold text-amber-600 uppercase">High Risk</p>
              </div>
              <p className="text-2xl font-bold text-amber-900">{reportData.summary?.highRisk || 0}</p>
            </div>
            <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-violet-600" />
                <p className="text-xs font-semibold text-violet-600 uppercase">Avg Adherence</p>
              </div>
              <p className="text-2xl font-bold text-violet-900">{reportData.summary?.avgAdherence || 0}%</p>
            </div>
          </div>

          {/* Patients List */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-600" />
              Patient Details
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold">Patient Name</TableHead>
                    <TableHead className="font-bold text-center">Age</TableHead>
                    <TableHead className="font-bold text-center">Gender</TableHead>
                    <TableHead className="font-bold text-center">Risk Level</TableHead>
                    <TableHead className="font-bold text-center">Adherence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.patients.slice(0, 50).map((patient: any, index: number) => (
                    <TableRow key={index} className="hover:bg-slate-50">
                      <TableCell className="font-semibold">{patient.name || 'Unknown'}</TableCell>
                      <TableCell className="text-center">{patient.age || 'N/A'}</TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-800 rounded text-xs font-medium">
                          {patient.gender || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          patient.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                          patient.riskLevel === 'moderate' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {patient.riskLevel === 'high' && <AlertCircle className="h-3 w-3" />}
                          {patient.riskLevel || 'Low'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`text-sm font-bold ${
                          (patient.adherenceRate || 0) >= 80 ? 'text-emerald-600' :
                          (patient.adherenceRate || 0) >= 60 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {patient.adherenceRate || 0}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reportData.patients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No patients found for the selected period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {reportData.patients.length > 50 && (
              <p className="text-sm text-slate-500 mt-2 text-center">
                Showing first 50 records of {reportData.patients.length} total patients
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPrescriptionsReport = () => {
    if (!reportData || !reportData.prescriptions) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-emerald-500" />
            Prescriptions Report
          </CardTitle>
          <CardDescription>Prescriptions for your patients</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <FileBarChart className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-semibold text-blue-600 uppercase">Total</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">{reportData.stats?.total || 0}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-semibold text-emerald-600 uppercase">Active</p>
              </div>
              <p className="text-2xl font-bold text-emerald-900">{reportData.stats?.active || 0}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <p className="text-xs font-semibold text-amber-600 uppercase">Completed</p>
              </div>
              <p className="text-2xl font-bold text-amber-900">{reportData.stats?.completed || 0}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <p className="text-xs font-semibold text-red-600 uppercase">Discontinued</p>
              </div>
              <p className="text-2xl font-bold text-red-900">{reportData.stats?.discontinued || 0}</p>
            </div>
          </div>

          {/* Details */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Pill className="h-5 w-5 text-slate-600" />
              Prescription Details
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold">Patient Name</TableHead>
                    <TableHead className="font-bold">Medication</TableHead>
                    <TableHead className="font-bold">Dosage</TableHead>
                    <TableHead className="font-bold">Start Date</TableHead>
                    <TableHead className="font-bold">End Date</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.prescriptions.slice(0, 50).map((prescription: any, index: number) => (
                    <TableRow key={index} className="hover:bg-slate-50">
                      <TableCell className="font-semibold">{prescription.patient?.name || 'Unknown'}</TableCell>
                      <TableCell className="text-slate-600">{prescription.medication || 'N/A'}</TableCell>
                      <TableCell className="text-slate-600">{prescription.dosage || 'N/A'}</TableCell>
                      <TableCell className="text-slate-600">{prescription.startDate ? new Date(prescription.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell className="text-slate-600">{prescription.endDate ? new Date(prescription.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          prescription.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                          prescription.status === 'completed' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {prescription.status === 'active' && <CheckCircle className="h-3 w-3" />}
                          {prescription.status || 'Unknown'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reportData.prescriptions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        No prescriptions found for the selected period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {reportData.prescriptions.length > 50 && (
              <p className="text-sm text-slate-500 mt-2 text-center">
                Showing first 50 records of {reportData.prescriptions.length} total prescriptions
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRemindersReport = () => {
    if (!reportData || !reportData.reminders) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-500" />
            Reminders Report
          </CardTitle>
          <CardDescription>Reminders sent to your patients</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <FileBarChart className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-semibold text-blue-600 uppercase">Total</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">{reportData.stats?.total || 0}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-semibold text-emerald-600 uppercase">Taken</p>
              </div>
              <p className="text-2xl font-bold text-emerald-900">{reportData.stats?.taken || 0}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <p className="text-xs font-semibold text-amber-600 uppercase">Pending</p>
              </div>
              <p className="text-2xl font-bold text-amber-900">{reportData.stats?.pending || 0}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <p className="text-xs font-semibold text-red-600 uppercase">Missed</p>
              </div>
              <p className="text-2xl font-bold text-red-900">{reportData.stats?.missed || 0}</p>
            </div>
          </div>

          {/* Details */}
          <div>
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-slate-600" />
              Reminder Details
            </h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold">Patient Name</TableHead>
                    <TableHead className="font-bold">Medication</TableHead>
                    <TableHead className="font-bold">Scheduled Time</TableHead>
                    <TableHead className="font-bold">Type</TableHead>
                    <TableHead className="font-bold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.reminders.slice(0, 50).map((reminder: any, index: number) => (
                    <TableRow key={index} className="hover:bg-slate-50">
                      <TableCell className="font-semibold">{reminder.patient?.name || 'Unknown'}</TableCell>
                      <TableCell className="text-slate-600">{reminder.medication || 'N/A'}</TableCell>
                      <TableCell className="text-slate-600">{reminder.scheduledTime ? new Date(reminder.scheduledTime).toLocaleString() : 'N/A'}</TableCell>
                      <TableCell className="text-slate-600">{reminder.type || 'N/A'}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          reminder.status === 'taken' ? 'bg-emerald-100 text-emerald-800' :
                          reminder.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          reminder.status === 'missed' ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {reminder.status === 'taken' && <CheckCircle className="h-3 w-3" />}
                          {reminder.status === 'pending' && <Clock className="h-3 w-3" />}
                          {reminder.status === 'missed' && <XCircle className="h-3 w-3" />}
                          {reminder.status || 'Unknown'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {reportData.reminders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        No reminders found for the selected period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {reportData.reminders.length > 50 && (
              <p className="text-sm text-slate-500 mt-2 text-center">
                Showing first 50 records of {reportData.reminders.length} total reminders
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSummaryReport = () => {
    if (!reportData) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5 text-violet-500" />
            Summary Report
          </CardTitle>
          <CardDescription>Overview of all metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-semibold text-blue-600 uppercase">Total Patients</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">{reportData.summary?.totalPatients || 0}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-semibold text-emerald-600 uppercase">Active Prescriptions</p>
              </div>
              <p className="text-2xl font-bold text-emerald-900">{reportData.summary?.activePrescriptions || 0}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-4 w-4 text-amber-600" />
                <p className="text-xs font-semibold text-amber-600 uppercase">Total Reminders</p>
              </div>
              <p className="text-2xl font-bold text-amber-900">{reportData.summary?.totalReminders || 0}</p>
            </div>
            <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-violet-600" />
                <p className="text-xs font-semibold text-violet-600 uppercase">Adherence Rate</p>
              </div>
              <p className="text-2xl font-bold text-violet-900">{reportData.summary?.adherenceRate || 0}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-semibold text-emerald-600 uppercase">Doses Taken</p>
              </div>
              <p className="text-2xl font-bold text-emerald-900">{reportData.summary?.adherence?.taken || 0}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <p className="text-xs font-semibold text-red-600 uppercase">Doses Missed</p>
              </div>
              <p className="text-2xl font-bold text-red-900">{reportData.summary?.adherence?.missed || 0}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <p className="text-xs font-semibold text-amber-600 uppercase">Doses Late</p>
              </div>
              <p className="text-2xl font-bold text-amber-900">{reportData.summary?.adherence?.late || 0}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-semibold text-blue-600 uppercase">Total Appointments</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">{reportData.summary?.appointments?.total || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderReportResults = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'adherence':
        return renderAdherenceReport();
      case 'appointments':
        return renderAppointmentsReport();
      case 'patients':
        return renderPatientsReport();
      case 'prescriptions':
        return renderPrescriptionsReport();
      case 'reminders':
        return renderRemindersReport();
      case 'summary':
        return renderSummaryReport();
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('reports')}
              <span className="text-violet-500">.</span>
            </h1>
          </div>
          <p className="text-slate-500 text-sm">Generate comprehensive reports for your patients</p>
        </div>

        {/* Filters Card - Full Width at Top */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-violet-500" />
              Report Configuration
            </CardTitle>
            <CardDescription>Select report type and configure filters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Report Type */}
              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onValueChange={(val) => { setReportType(val); handleGenerateReport(); }}>
                  <SelectTrigger id="reportType">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Range */}
              <div className="space-y-2">
                <Label htmlFor="timeRange">Time Range</Label>
                <Select value={timeRange} onValueChange={(val) => { setTimeRange(val); handleGenerateReport(); }}>
                  <SelectTrigger id="timeRange">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Patient Filter */}
              <div className="space-y-2">
                <Label htmlFor="patientFilter">Patient (Optional)</Label>
                <Select value={patientFilter} onValueChange={(val) => { setPatientFilter(val); handleGenerateReport(); }}>
                  <SelectTrigger id="patientFilter">
                    <SelectValue placeholder="All patients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All patients</SelectItem>
                    {patients.map((patient: any) => (
                      <SelectItem key={patient.id} value={String(patient.id)}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter (conditional) */}
              {(reportType === 'prescriptions' || reportType === 'adherence') && (
                <div className="space-y-2">
                  <Label htmlFor="statusFilter">Status</Label>
                  <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); handleGenerateReport(); }}>
                    <SelectTrigger id="statusFilter">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">All Statuses</SelectItem>
                      {reportType === 'prescriptions' ? (
                        <>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="discontinued">Discontinued</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="taken">Taken</SelectItem>
                          <SelectItem value="missed">Missed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Custom Date Range (Full Width Row) */}
            {timeRange === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => { setCustomStartDate(e.target.value); handleGenerateReport(); }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => { setCustomEndDate(e.target.value); handleGenerateReport(); }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
              <Button 
                onClick={handleGenerateReport} 
                disabled={isGenerating}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>

              {reportData && (
                <>
                  <Button 
                    onClick={exportToExcel}
                    variant="outline"
                    className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export to Excel
                  </Button>
                  
                  <Button 
                    onClick={exportToPDF}
                    variant="outline"
                    className="border-red-500 text-red-700 hover:bg-red-50"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Export to PDF
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Report Results */}
        {renderReportResults()}

        {/* Loading State */}
        {isGenerating && !reportData && (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4" />
              <p className="text-slate-600">Loading report data...</p>
            </CardContent>
          </Card>
        )}

      </div>
    </DashboardLayout>
  );
}
