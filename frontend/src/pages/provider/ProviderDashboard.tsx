import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Users, Pill, Bell, BarChart3, MessageSquare, CheckCircle, XCircle, AlertTriangle, Activity, Target, Calendar, UserCheck, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { usePatients, usePrescriptions, useReminders, useAdherenceRecords } from '@/hooks/use-api';
import { useMemo } from 'react';

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

export default function ProviderDashboard() {
  const { user, t, language } = useAuth();
  
  const { data: patients = [], isLoading: patientsLoading } = usePatients(user?.id);
  const { data: prescriptions = [], isLoading: prescriptionsLoading } = usePrescriptions(user?.id);
  const { data: reminders = [], isLoading: remindersLoading } = useReminders(user?.id);
  const { data: adherenceRecords = [], isLoading: adherenceLoading } = useAdherenceRecords(user?.id);

  const activeRx = prescriptions.filter((p: any) => p.status === 'active');
  const missedReminders = reminders.filter((r: any) => r.status === 'missed');
  const highRiskPatients = patients.filter((p: any) => p.adherenceRate < 70);

  const weeklyAdherenceData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(day => ({ day, taken: 0, missed: 0 }));
    
    adherenceRecords.forEach((record: any) => {
      const date = new Date(record.scheduledTime);
      const dayName = days[date.getDay()];
      const dayData = data.find(d => d.day === dayName);
      if (dayData) {
        if (record.status === 'taken') dayData.taken++;
        else if (record.status === 'missed') dayData.missed++;
      }
    });
    
    return data;
  }, [adherenceRecords]);

  const stats = [
    { label: t('patients'), value: patients.length, icon: Users, color: 'text-primary' },
    { label: t('active_prescriptions'), value: activeRx.length, icon: Pill, color: 'text-info' },
    { label: 'Missed Today', value: missedReminders.length, icon: XCircle, color: 'text-destructive' },
    { label: 'High Risk', value: highRiskPatients.length, icon: AlertTriangle, color: 'text-warning' },
  ];

  if (patientsLoading || prescriptionsLoading || remindersLoading || adherenceLoading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="p-8 text-center">Loading dashboard data...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="page-header">{t('welcome')}, {user?.name?.split(' ').pop()}!</h1>
          <p className="text-muted-foreground">{language === 'en' ? 'Hypertension Management Dashboard' : "Ikibaho cyo Gucunga Umuvuduko w'Amaraso"}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="stat-card flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold font-heading text-card-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">{language === 'en' ? 'Weekly BP Medication Adherence' : "Ubukurikire bw'Imiti y'Umuvuduko Buri Cyumweru"}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyAdherenceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="taken" fill="hsl(var(--success))" radius={[4,4,0,0]} />
                  <Bar dataKey="missed" fill="hsl(var(--destructive))" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                {language === 'en' ? 'High-Risk BP Patients' : "Abarwayi b'Umuvuduko Munini"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {highRiskPatients.length > 0 ? (
                  highRiskPatients.map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <div className="font-medium text-card-foreground">{p.name}</div>
                        <div className="text-sm text-muted-foreground">{p.phone} · BP: {p.bloodPressure || 'N/A'}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${p.adherenceRate < 50 ? 'text-destructive' : 'text-warning'}`}>{p.adherenceRate}%</div>
                        <div className="text-xs text-muted-foreground">adherence</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">No high-risk patients found.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading">{language === 'en' ? 'Hypertension Patients' : "Abarwayi b'Umuvuduko"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">{language === 'en' ? 'Patient' : 'Umurwayi'}</th>
                    <th className="p-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">{language === 'en' ? 'Age/Gender' : 'Imyaka/Igitsina'}</th>
                    <th className="p-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">{language === 'en' ? 'BP' : 'Umuvuduko'}</th>
                    <th className="p-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">{language === 'en' ? 'Adherence' : 'Ubukurikire'}</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.slice(0, 5).map((p: any) => (
                    <tr key={p.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3 text-muted-foreground">{p.age} / {p.gender}</td>
                      <td className="p-3 font-medium text-card-foreground">{p.bloodPressure || 'N/A'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${p.adherenceRate > 80 ? 'bg-success' : p.adherenceRate > 60 ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${p.adherenceRate}%` }} />
                          </div>
                          <span className="text-xs font-medium w-8">{p.adherenceRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
