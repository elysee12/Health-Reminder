import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Pill, Bell, Clock, CheckCircle, XCircle, AlertCircle, History, Target, MessageSquare, Calendar, AlertTriangle, User, ChevronDown, ChevronRight } from 'lucide-react';
import { useReminders, usePrescriptions, useAdherenceRecords, useHealthGoals, useAppointments } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const sidebarItems = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, path: '/patient' },
  { label: 'Prescriptions', icon: <Pill className="h-4 w-4" />, path: '/patient/prescriptions' },
  { label: 'Reminders', icon: <Bell className="h-4 w-4" />, path: '/patient/reminders' },
  { label: 'Target Goals', icon: <Target className="h-4 w-4" />, path: '/patient/goals' },
  { label: 'Side Effects', icon: <MessageSquare className="h-4 w-4" />, path: '/patient/side-effects' },
  { label: 'Appointments', icon: <Calendar className="h-4 w-4" />, path: '/patient/appointments' },
  { label: 'History', icon: <History className="h-4 w-4" />, path: '/patient/history' },
];

export default function PatientDashboard() {
  const { user, t, language } = useAuth();
  
  const { data: allReminders = [], isLoading: remindersLoading, refetch: refetchReminders } = useReminders();
  const { data: allPrescriptions = [], isLoading: prescriptionsLoading } = usePrescriptions();
  const { data: allAdherenceRecords = [], isLoading: adherenceLoading } = useAdherenceRecords();
  const { data: goals = [] } = useHealthGoals(user?.id);
  const { data: appointments = [] } = useAppointments(user?.id);

  const [expandedRx, setExpandedRx] = useState<Record<number, boolean>>({});

  const toggleRx = (id: number) => {
    setExpandedRx(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const pendingGoals = goals.filter((g: any) => g.status === 'in_progress');
  const upcomingAppointments = appointments.filter((a: any) => new Date(a.dateTime) > new Date() && a.status !== 'cancelled');
  const emergencyAppts = upcomingAppointments.filter((a: any) => a.type === 'emergency');

  const patientReminders = useMemo(() => 
    allReminders.filter((r: any) => r.patientId === user?.id || r.patient?.userId === user?.id),
    [allReminders, user]
  );

  const activeRx = useMemo(() => 
    allPrescriptions.filter((p: any) => (p.patientId === user?.id || p.patient?.userId === user?.id) && p.status === 'active'),
    [allPrescriptions, user]
  );

  const prescriptionsWithReminders = useMemo(() => {
    return activeRx.map((rx: any) => ({
      ...rx,
      reminders: patientReminders.filter((r: any) => r.prescriptionId === rx.id)
    }));
  }, [activeRx, patientReminders]);

  const takenCount = patientReminders.filter((r: any) => r.status === 'taken').length;
  const missedCount = patientReminders.filter((r: any) => r.status === 'missed').length;
  const pendingCount = patientReminders.filter((r: any) => r.status === 'pending').length;

  const confirmMed = async (id: string) => {
    try {
      await api.reminders.update(id, { status: 'taken' });
      toast.success(language === 'en' ? 'Medication marked as taken' : 'Umuti wemejwe ko wafashwe');
      refetchReminders();
    } catch (error) {
      toast.error('Failed to update reminder');
    }
  };

  const stats = [
    { label: t('adherence_rate'), value: '87%', icon: CheckCircle, color: 'text-success' },
    { label: t('active_prescriptions'), value: activeRx.length, icon: Pill, color: 'text-primary' },
    { label: t('pending'), value: pendingCount, icon: Clock, color: 'text-warning' },
    { label: t('missed'), value: missedCount, icon: XCircle, color: 'text-destructive' },
  ];

  if (remindersLoading || prescriptionsLoading || adherenceLoading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="animate-fade-in space-y-4 md:space-y-6">
        <div className="px-1">
          <h1 className="text-xl md:text-3xl font-bold font-heading text-foreground">
            {t('welcome')}, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'en' ? "Today's Blood Pressure Medications" : "Imiti y'Umuvuduko w'Amaraso y'Uyu Munsi"}
          </p>
        </div>

        {emergencyAppts.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5 animate-pulse mx-1">
            <CardContent className="p-3 md:p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <div className="font-bold text-destructive text-sm md:text-base">
                    {language === 'en' ? 'Upcoming Emergency Appointment' : 'Gahunda Yihutirwa Irimbere'}
                  </div>
                  <div className="text-xs md:text-sm">
                    {new Date(emergencyAppts[0].dateTime).toLocaleString()} at {emergencyAppts[0].hospital.name}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 px-1">
          {stats.map((s) => (
            <div key={s.label} className="stat-card flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 p-3 md:p-4">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-muted flex items-center justify-center ${s.color} shrink-0`}>
                <s.icon className="h-4 w-4 md:h-5 md:h-5" />
              </div>
              <div>
                <div className="text-lg md:text-2xl font-bold font-heading text-card-foreground leading-none">{s.value}</div>
                <div className="text-[10px] md:text-sm text-muted-foreground mt-1 uppercase md:capitalize tracking-wider md:tracking-normal font-medium md:font-normal">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <Card className="border-none md:border shadow-sm md:shadow">
              <CardHeader className="pb-2 px-4 md:px-6">
                <CardTitle className="text-base md:text-lg font-heading flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  {t('medication_schedule')}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 md:px-6">
                <div className="space-y-3">
                  {prescriptionsWithReminders.length > 0 ? (
                    prescriptionsWithReminders.map((rx: any) => (
                      <div key={rx.id} className="space-y-2">
                        <div 
                          className="flex items-center justify-between p-3 md:p-4 rounded-xl border bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
                          onClick={() => toggleRx(rx.id)}
                        >
                          <div className="flex items-center gap-3">
                            {expandedRx[rx.id] ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                            <div>
                              <div className="font-bold text-sm md:text-base text-primary">{rx.medication}</div>
                              <div className="text-[10px] md:text-xs text-muted-foreground">{rx.dosage} · {rx.frequency}</div>
                            </div>
                          </div>
                          <div className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                            {rx.reminders.length}
                          </div>
                        </div>

                        {expandedRx[rx.id] && (
                          <div className="pl-4 md:pl-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
                            {rx.reminders.length > 0 ? rx.reminders.map((rem: any) => (
                              <div key={rem.id} className="flex items-center justify-between p-2.5 md:p-3 rounded-xl border bg-card shadow-sm">
                                <div className="flex items-center gap-3 md:gap-4">
                                  <div className="text-xs md:text-sm font-mono font-bold text-foreground">
                                    {new Date(rem.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  <div className="hidden sm:block text-[10px] uppercase font-black text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                    {rem.type}
                                  </div>
                                </div>
                                {rem.status === 'pending' ? (
                                  <Button size="sm" variant="outline" className="h-7 md:h-8 text-[10px] md:text-xs border-success text-success hover:bg-success/10 px-2 md:px-3" onClick={(e) => { e.stopPropagation(); confirmMed(rem.id); }}>
                                    {language === 'en' ? 'Take Now' : 'Fata Umuti'}
                                  </Button>
                                ) : (
                                  <div className={`flex items-center gap-1 text-[10px] md:text-xs font-black ${rem.status === 'taken' ? 'text-success' : 'text-destructive'}`}>
                                    {rem.status === 'taken' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                    {rem.status.toUpperCase()}
                                  </div>
                                )}
                              </div>
                            )) : (
                              <div className="text-[10px] md:text-xs text-muted-foreground italic p-2">{language === 'en' ? 'No reminders for today.' : 'Nta miburo y\'uyu munsi.'}</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground italic text-sm">
                      {language === 'en' ? 'No active prescriptions' : 'Nta miti yanditswe ihari'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
            <Card className="border-none md:border shadow-sm md:shadow">
              <CardHeader className="pb-2 px-4 md:px-6">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  {language === 'en' ? 'Active Goals' : 'Intego zihari'}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 md:px-6">
                <div className="space-y-3">
                  {pendingGoals.length > 0 ? (
                    pendingGoals.slice(0, 3).map((goal: any) => (
                      <div key={goal.id} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] md:text-xs">
                          <span className="font-bold">{goal.type}</span>
                          <span className="text-muted-foreground">Target: {goal.targetValue}</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] md:text-xs text-muted-foreground italic">No active goals</p>
                  )}
                  <Button variant="ghost" className="w-full text-[10px] md:text-xs h-8 text-primary font-bold mt-1" onClick={() => window.location.href='/patient/goals'}>
                    View All Goals
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none md:border shadow-sm md:shadow">
              <CardHeader className="pb-2 px-4 md:px-6">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {language === 'en' ? 'Next Visit' : 'Gahunda itaha'}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 md:px-6">
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="font-bold text-xs md:text-sm text-primary">{upcomingAppointments[0].hospital.name}</div>
                    <div className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {new Date(upcomingAppointments[0].dateTime).toLocaleDateString()} at {new Date(upcomingAppointments[0].dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-[8px] md:text-[10px] bg-primary/20 text-primary w-fit px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">
                      {upcomingAppointments[0].type}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] md:text-xs text-muted-foreground italic">No upcoming appointments</p>
                )}
                <Button variant="ghost" className="w-full text-[10px] md:text-xs h-8 mt-2 text-primary font-bold" onClick={() => window.location.href='/patient/appointments'}>
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
