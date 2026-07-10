import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import { FileText, Download, Calendar, Users, Pill, Bell, CheckCircle, XCircle, Clock, AlertCircle, FileSpreadsheet, FileDown, Building2, TrendingUp, FileBarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { generateReport, exportReportToExcel, exportReportToPDF } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useHospitals, usePatients } from '@/hooks/use-api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminReports() {
  const { user, t } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  
  // Load hospitals and patients for dropdowns
  const { data: hospitals = [], isLoading: hospitalsLoading } = useHospitals();
  const { data: patients = [], isLoading: patientsLoading } = usePatients();
  
  // Form state
  const [reportType, setReportType] = useState('patients');
  const [timeRange, setTimeRange] = useState('year');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('all');
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

      if (hospitalFilter && hospitalFilter !== 'all') filters.hospitalId = parseInt(hospitalFilter);
      if (patientFilter && patientFilter !== 'all') filters.patientId = parseInt(patientFilter);
      if (statusFilter && statusFilter !== 'any') filters.status = statusFilter;

      const data = await generateReport(reportType, filters);
      
      setReportData(data);

      toast({
        title: 'Report Generated Successfully',
        description: `Report data loaded successfully`,
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

  const exportToExcel = () => {
    if (!reportData) return;
    
    toast({
      title: 'Excel Export',
      description: 'Excel export functionality will be implemented with a backend endpoint',
    });
    
    // Future: Call API endpoint to generate Excel file
    // const response = await api.reports.exportExcel(reportType, filters);
    // downloadFile(response, `${reportType}-report.xlsx`);
  };

  const exportToPDF = () => {
    if (!reportData) return;
    
    toast({
      title: 'PDF Export',
      description: 'PDF export functionality will be implemented with a backend endpoint',
    });
    
    // Future: Call API endpoint to generate PDF file
    // const response = await api.reports.exportPDF(reportType, filters);
    // downloadFile(response, `${reportType}-report.pdf`);
  };

  // Auto-generate report on page load and when filters change
  useEffect(() => {
    handleGenerateReport();
  }, [reportType, timeRange, hospitalFilter, patientFilter, statusFilter, customStartDate, customEndDate]);

  const renderPrescriptionsReport = () => {
    if (!reportData || !reportData.prescriptions) return null;

    return (
      <>
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{reportData.stats?.total || 0}</div>
            <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
              <FileBarChart className="h-3 w-3" />
              Total
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{reportData.stats?.active || 0}</div>
            <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
              <CheckCircle className="h-3 w-3" />
              Active
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{reportData.stats?.completed || 0}</div>
            <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              Completed
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{reportData.stats?.discontinued || 0}</div>
            <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
              <XCircle className="h-3 w-3" />
              Discontinued
            </div>
          </div>
        </div>

        {/* Prescriptions Data Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100">
                  <TableHead className="font-bold">Patient Name</TableHead>
                  <TableHead className="font-bold">Hospital</TableHead>
                  <TableHead className="font-bold">Medication</TableHead>
                  <TableHead className="font-bold">Dosage</TableHead>
                  <TableHead className="font-bold">Start Date</TableHead>
                  <TableHead className="font-bold">End Date</TableHead>
                  <TableHead className="font-bold text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.prescriptions.map((prescription: any, index: number) => (
                  <TableRow key={index} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{prescription.patient?.name || 'Unknown'}</TableCell>
                    <TableCell>{prescription.patient?.hospital?.name || 'N/A'}</TableCell>
                    <TableCell>{prescription.medication || 'N/A'}</TableCell>
                    <TableCell>{prescription.dosage || 'N/A'}</TableCell>
                    <TableCell>{prescription.startDate ? new Date(prescription.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{prescription.endDate ? new Date(prescription.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                        prescription.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        prescription.status === 'completed' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {prescription.status || 'Unknown'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {reportData.prescriptions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      No prescriptions found for the selected filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </>
    );
  };

  const renderRemindersReport = () => {
    if (!reportData || !reportData.reminders) return null;

    return (
      <>
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{reportData.stats?.total || 0}</div>
            <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
              <FileBarChart className="h-3 w-3" />
              Total
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{reportData.stats?.taken || 0}</div>
            <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
              <CheckCircle className="h-3 w-3" />
              Taken
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{reportData.stats?.pending || 0}</div>
            <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              Pending
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{reportData.stats?.missed || 0}</div>
            <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
              <XCircle className="h-3 w-3" />
              Missed
            </div>
          </div>
        </div>

        {/* Reminders Data Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100">
                  <TableHead className="font-bold">Patient Name</TableHead>
                  <TableHead className="font-bold">Hospital</TableHead>
                  <TableHead className="font-bold">Medication</TableHead>
                  <TableHead className="font-bold">Scheduled Time</TableHead>
                  <TableHead className="font-bold">Type</TableHead>
                  <TableHead className="font-bold text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.reminders.map((reminder: any, index: number) => (
                  <TableRow key={index} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{reminder.patient?.name || 'Unknown'}</TableCell>
                    <TableCell>{reminder.patient?.hospital?.name || 'N/A'}</TableCell>
                    <TableCell>{reminder.medication || 'N/A'}</TableCell>
                    <TableCell>{reminder.scheduledTime ? new Date(reminder.scheduledTime).toLocaleString() : 'N/A'}</TableCell>
                    <TableCell>{reminder.type || 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                        reminder.status === 'taken' ? 'bg-emerald-100 text-emerald-800' :
                        reminder.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        reminder.status === 'missed' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {reminder.status || 'Unknown'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {reportData.reminders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No reminders found for the selected filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </>
    );
  };

  const renderSummaryReport = () => {
    if (!reportData) return null;

    return (
      <>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{reportData.summary?.totalPatients || 0}</div>
            <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
              <Users className="h-3 w-3" />
              Total Patients
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{reportData.summary?.activePrescriptions || 0}</div>
            <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
              <Pill className="h-3 w-3" />
              Active Prescriptions
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{reportData.summary?.totalReminders || 0}</div>
            <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
              <Bell className="h-3 w-3" />
              Total Reminders
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-violet-600">{reportData.summary?.adherenceRate || 0}%</div>
            <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              Adherence Rate
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">{reportData.summary?.adherence?.taken || 0}</div>
            <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
              <CheckCircle className="h-3 w-3" />
              Doses Taken
            </div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{reportData.summary?.adherence?.missed || 0}</div>
            <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
              <XCircle className="h-3 w-3" />
              Doses Missed
            </div>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">{reportData.summary?.adherence?.late || 0}</div>
            <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
              <Clock className="h-3 w-3" />
              Doses Late
            </div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{reportData.summary?.appointments?.total || 0}</div>
            <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
              <Calendar className="h-3 w-3" />
              Total Appointments
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="h-7 w-7 text-violet-500" />
              System Reports
            </h1>
            <p className="text-slate-500 text-sm mt-1">Generate and export comprehensive reports across all hospitals</p>
          </div>
        </div>

        {/* Filters Card - Always Visible at Top */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Report Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Report Type */}
              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onValueChange={(val) => setReportType(val)}>
                  <SelectTrigger id="reportType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adherence">Adherence Report</SelectItem>
                    <SelectItem value="patients">Patients Report</SelectItem>
                    <SelectItem value="prescriptions">Prescriptions Report</SelectItem>
                    <SelectItem value="appointments">Appointments Report</SelectItem>
                    <SelectItem value="reminders">Reminders Report</SelectItem>
                    <SelectItem value="summary">System Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Time Range */}
              <div className="space-y-2">
                <Label htmlFor="timeRange">Time Range</Label>
                <Select value={timeRange} onValueChange={(val) => setTimeRange(val)}>
                  <SelectTrigger id="timeRange">
                    <SelectValue />
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

              {/* Hospital Filter */}
              <div className="space-y-2">
                <Label htmlFor="hospitalFilter">Hospital (Optional)</Label>
                <Select value={hospitalFilter} onValueChange={(val) => setHospitalFilter(val)}>
                  <SelectTrigger id="hospitalFilter">
                    <SelectValue placeholder="All hospitals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All hospitals</SelectItem>
                    {hospitals.map((hospital: any) => (
                      <SelectItem key={hospital.id} value={String(hospital.id)}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Patient Filter */}
              <div className="space-y-2">
                <Label htmlFor="patientFilter">Patient (Optional)</Label>
                <Select value={patientFilter} onValueChange={(val) => setPatientFilter(val)}>
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
            </div>

            {/* Custom Date Range */}
            {timeRange === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Status Filter */}
            {(reportType === 'prescriptions' || reportType === 'adherence' || reportType === 'appointments') && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="statusFilter">Status Filter</Label>
                  <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
                    <SelectTrigger id="statusFilter">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">All Statuses</SelectItem>
                      {reportType === 'prescriptions' && (
                        <>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="discontinued">Discontinued</SelectItem>
                        </>
                      )}
                      {reportType === 'adherence' && (
                        <>
                          <SelectItem value="taken">Taken</SelectItem>
                          <SelectItem value="missed">Missed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </>
                      )}
                      {reportType === 'appointments' && (
                        <>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
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
                    <FileText className="h-4 w-4 mr-2" />
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

        {/* Report Results Table */}
        {reportData && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-violet-500" />
                  {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report Results
                </CardTitle>
                <div className="text-sm text-slate-500">
                  {reportData.records?.length || reportData.patients?.length || reportData.prescriptions?.length || reportData.reminders?.length || reportData.appointments?.length || 0} records found
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {reportType === 'adherence' && reportData.records && (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">{reportData.stats?.taken || 0}</div>
                      <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
                        <CheckCircle className="h-3 w-3" />
                        Taken
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{reportData.stats?.missed || 0}</div>
                      <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
                        <XCircle className="h-3 w-3" />
                        Missed
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">{reportData.stats?.pending || 0}</div>
                      <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {((reportData.stats?.taken || 0) + (reportData.stats?.missed || 0) + (reportData.stats?.pending || 0)) > 0 
                          ? Math.round((reportData.stats?.taken || 0) / ((reportData.stats?.taken || 0) + (reportData.stats?.missed || 0) + (reportData.stats?.pending || 0)) * 100) 
                          : 0}%
                      </div>
                      <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
                        <Pill className="h-3 w-3" />
                        Adherence Rate
                      </div>
                    </div>
                  </div>

                  {/* Adherence Data Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-100">
                            <TableHead className="font-bold">Patient Name</TableHead>
                            <TableHead className="font-bold">Hospital</TableHead>
                            <TableHead className="font-bold">Medication</TableHead>
                            <TableHead className="font-bold text-center">Taken</TableHead>
                            <TableHead className="font-bold text-center">Missed</TableHead>
                            <TableHead className="font-bold text-center">Pending</TableHead>
                            <TableHead className="font-bold text-center">Adherence %</TableHead>
                            <TableHead className="font-bold text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData.records.map((record: any, index: number) => {
                            const total = (record.taken || 0) + (record.missed || 0) + (record.pending || 0);
                            const adherence = total > 0 ? Math.round(((record.taken || 0) / total) * 100) : 0;
                            
                            return (
                              <TableRow key={index} className="hover:bg-slate-50">
                                <TableCell className="font-medium">{record.patientName || 'Unknown'}</TableCell>
                                <TableCell>{record.hospitalName || 'N/A'}</TableCell>
                                <TableCell>{record.medicationName || 'N/A'}</TableCell>
                                <TableCell className="text-center">
                                  <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-bold">
                                    {record.taken || 0}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold">
                                    {record.missed || 0}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-bold">
                                    {record.pending || 0}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className={`font-bold ${
                                    adherence >= 80 ? 'text-emerald-600' :
                                    adherence >= 60 ? 'text-amber-600' : 'text-red-600'
                                  }`}>
                                    {adherence}%
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                                    adherence >= 80 ? 'bg-emerald-100 text-emerald-800' :
                                    adherence >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {adherence >= 80 ? 'Good' : adherence >= 60 ? 'Moderate' : 'Poor'}
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {reportData.records.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                                No adherence records found for the selected filters
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}

              {reportType === 'patients' && reportData.patients && (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{reportData.summary?.total || 0}</div>
                      <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
                        <Users className="h-3 w-3" />
                        Total Patients
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">{reportData.summary?.active || 0}</div>
                      <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{reportData.summary?.highRisk || 0}</div>
                      <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        High Risk
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-violet-600">{reportData.summary?.avgAdherence || 0}%</div>
                      <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
                        <Pill className="h-3 w-3" />
                        Avg Adherence
                      </div>
                    </div>
                  </div>

                  {/* Patients Data Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-100">
                            <TableHead className="font-bold">Patient Name</TableHead>
                            <TableHead className="font-bold">Hospital</TableHead>
                            <TableHead className="font-bold text-center">Age</TableHead>
                            <TableHead className="font-bold text-center">Gender</TableHead>
                            <TableHead className="font-bold text-center">Risk Level</TableHead>
                            <TableHead className="font-bold text-center">Adherence</TableHead>
                            <TableHead className="font-bold text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData.patients.map((patient: any, index: number) => (
                            <TableRow key={index} className="hover:bg-slate-50">
                              <TableCell className="font-medium">{patient.name || 'Unknown'}</TableCell>
                              <TableCell>{patient.hospital?.name || patient.hospitalName || 'N/A'}</TableCell>
                              <TableCell className="text-center">{patient.age || 'N/A'}</TableCell>
                              <TableCell className="text-center">
                                <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-800 rounded text-xs font-medium">
                                  {patient.gender || 'N/A'}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                                  patient.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                                  patient.riskLevel === 'moderate' ? 'bg-amber-100 text-amber-800' :
                                  'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {patient.riskLevel || 'Low'}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className={`font-bold ${
                                  (patient.adherenceRate || 0) >= 80 ? 'text-emerald-600' :
                                  (patient.adherenceRate || 0) >= 60 ? 'text-amber-600' : 'text-red-600'
                                }`}>
                                  {patient.adherenceRate || 0}%
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                                  patient.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                                  'bg-slate-100 text-slate-800'
                                }`}>
                                  {patient.status || 'Active'}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                          {reportData.patients.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                                No patients found for the selected filters
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}

              {reportType === 'appointments' && reportData.appointments && (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{reportData.stats?.total || 0}</div>
                      <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        Total
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">{reportData.stats?.confirmed || 0}</div>
                      <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
                        <CheckCircle className="h-3 w-3" />
                        Confirmed
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-600">{reportData.stats?.pending || 0}</div>
                      <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        Pending
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{reportData.stats?.cancelled || 0}</div>
                      <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
                        <XCircle className="h-3 w-3" />
                        Cancelled
                      </div>
                    </div>
                  </div>

                  {/* Appointments Data Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-100">
                            <TableHead className="font-bold">Patient Name</TableHead>
                            <TableHead className="font-bold">Hospital</TableHead>
                            <TableHead className="font-bold">Date & Time</TableHead>
                            <TableHead className="font-bold">Type</TableHead>
                            <TableHead className="font-bold">Reason</TableHead>
                            <TableHead className="font-bold text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportData.appointments.map((appointment: any, index: number) => (
                            <TableRow key={index} className="hover:bg-slate-50">
                              <TableCell className="font-medium">{appointment.patient?.name || 'Unknown'}</TableCell>
                              <TableCell>{appointment.hospital?.name || 'N/A'}</TableCell>
                              <TableCell>{appointment.dateTime ? new Date(appointment.dateTime).toLocaleString() : 'N/A'}</TableCell>
                              <TableCell>{appointment.type || 'General'}</TableCell>
                              <TableCell className="max-w-xs truncate">{appointment.reason || 'N/A'}</TableCell>
                              <TableCell className="text-center">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                                  appointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                  appointment.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                  appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-slate-100 text-slate-800'
                                }`}>
                                  {appointment.status || 'Unknown'}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                          {reportData.appointments.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                No appointments found for the selected filters
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </>
              )}

              {reportType === 'prescriptions' && renderPrescriptionsReport()}
              {reportType === 'reminders' && renderRemindersReport()}
              {reportType === 'summary' && renderSummaryReport()}
            </CardContent>
          </Card>
        )}

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
