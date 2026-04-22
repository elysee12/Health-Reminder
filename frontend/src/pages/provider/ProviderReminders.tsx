import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { usePatients, useReminders, usePrescriptions } from '@/hooks/use-api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Pill, Bell, BarChart3, MessageSquare, Plus, CheckCircle, Clock, XCircle, Target, Calendar, UserCheck, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

const sidebarItems = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, path: '/provider' },
  { label: 'Patients', icon: <Users className="h-4 w-4" />, path: '/provider/patients' },
  { label: 'Prescriptions', icon: <Pill className="h-4 w-4" />, path: '/provider/prescriptions' },
  { label: 'Reminders', icon: <Bell className="h-4 w-4" />, path: '/provider/reminders' },
  { label: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, path: '/provider/analytics' },
  { label: 'Follow-ups', icon: <UserCheck className="h-4 w-4" />, path: '/provider/follow-ups' },
  { label: 'Patient Goals', icon: <Target className="h-4 w-4" />, path: '/provider/goals' },
  { label: 'Side Effects', icon: <AlertTriangle className="h-4 w-4" />, path: '/provider/side-effects' },
  { label: 'Appointments', icon: <Calendar className="h-4 w-4" />, path: '/provider/appointments' },
  { label: 'SMS Management', icon: <MessageSquare className="h-4 w-4" />, path: '/provider/sms' },
];

export default function ProviderReminders() {
  const { t, user, language } = useAuth();
  const queryClient = useQueryClient();
  const { data: reminders = [], isLoading: remindersLoading } = useReminders(user?.id);
  const { data: patients = [], isLoading: patientsLoading } = usePatients(user?.id);
  const { data: prescriptions = [], isLoading: prescriptionsLoading } = usePrescriptions(user?.id);

  const [expandedRx, setExpandedRx] = useState<Record<number, boolean>>({});

  const toggleRx = (id: number) => {
    setExpandedRx(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const groupedData = useMemo(() => {
    return patients.map((patient: any) => {
      const patientRx = prescriptions.filter((rx: any) => rx.patientId === patient.id);
      const rxWithReminders = patientRx.map((rx: any) => ({
        ...rx,
        reminders: reminders.filter((rem: any) => rem.prescriptionId === rx.id)
      })).filter((rx: any) => rx.reminders.length > 0);

      return { ...patient, prescriptions: rxWithReminders };
    }).filter((p: any) => p.prescriptions.length > 0);
  }, [patients, prescriptions, reminders]);

  const updateReminderStatus = async (id: number, status: 'taken' | 'missed' | 'snoozed') => {
    try {
      await api.reminders.update(id, { status });
      toast.success(language === 'en' ? `Reminder marked as ${status}` : `Ikibutsa cyashyizweho: ${status}`);
      queryClient.invalidateQueries(['reminders']);
    } catch (error: any) {
      toast.error(error.message || (language === 'en' ? 'Failed to update reminder status' : 'Kunanirwa guhindura imiterere y\'ikibutsa'));
    }
  };

  if (remindersLoading || patientsLoading || prescriptionsLoading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="p-8 text-center">Loading reminders...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-header">Reminder Monitoring</h1>
          <Badge variant="outline" className="px-3 py-1">
            {reminders.length} Total Reminders
          </Badge>
        </div>

        <div className="space-y-6">
          {groupedData.length > 0 ? groupedData.map((patient: any) => (
            <div key={patient.id} className="space-y-3">
              <div className="flex items-center gap-3 border-b pb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-lg">{patient.name}</h2>
                  <p className="text-xs text-muted-foreground">{patient.phone} • {patient.email}</p>
                </div>
              </div>

              <div className="grid gap-4 pl-4 border-l-2 border-muted ml-4">
                {patient.prescriptions.map((rx: any) => (
                  <Card key={rx.id} className="overflow-hidden border-muted/60 shadow-sm">
                    <CardHeader 
                      className="p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors flex flex-row items-center justify-between"
                      onClick={() => toggleRx(rx.id)}
                    >
                      <div className="flex items-center gap-3">
                        {expandedRx[rx.id] ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        <div>
                          <CardTitle className="text-base font-bold text-primary">{rx.medication}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">Dosage: {rx.dosage} • Frequency: {rx.frequency}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {rx.reminders.length} Reminders
                      </Badge>
                    </CardHeader>
                    
                    {expandedRx[rx.id] && (
                      <CardContent className="p-0 border-t">
                        <div className="divide-y">
                          {rx.reminders.map((rem: any) => (
                            <div key={rem.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                  rem.status === 'taken' ? 'bg-success/10 text-success' :
                                  rem.status === 'missed' ? 'bg-destructive/10 text-destructive' :
                                  'bg-primary/10 text-primary'
                                }`}>
                                  {rem.status === 'taken' ? <CheckCircle className="h-4 w-4" /> :
                                   rem.status === 'missed' ? <XCircle className="h-4 w-4" /> :
                                   <Clock className="h-4 w-4" />}
                                </div>
                                <div>
                                  <div className="text-sm font-medium flex items-center gap-2">
                                    {new Date(rem.scheduledTime).toLocaleString()}
                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${rem.type === 'sms' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                      {rem.type}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">Status: <span className="capitalize">{rem.status}</span></p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {rem.status === 'pending' && (
                                  <>
                                    <Button size="sm" variant="ghost" className="h-8 text-success hover:text-success hover:bg-success/10 border border-success/20" onClick={() => updateReminderStatus(rem.id, 'taken')}>
                                      {language === 'en' ? 'Taken' : 'Yafashwe'}
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20" onClick={() => updateReminderStatus(rem.id, 'missed')}>
                                      {language === 'en' ? 'Missed' : 'Yaburiwe'}
                                    </Button>
                                  </>
                                )}
                                {rem.status !== 'pending' && (
                                  <Badge className={
                                    rem.status === 'taken' ? 'bg-success/10 text-success border-success/20 hover:bg-success/10' :
                                    rem.status === 'missed' ? 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10' :
                                    'bg-warning/10 text-warning border-warning/20 hover:bg-warning/10'
                                  } variant="outline">
                                    {rem.status}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )) : (
            <div className="p-12 text-center border-2 border-dashed rounded-xl">
              <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No active reminders found</h3>
              <p className="text-sm text-muted-foreground/60">Create prescriptions to generate patient reminders.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
