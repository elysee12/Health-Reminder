import { useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useAdherenceRecords, usePatients } from '@/hooks/use-api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { LayoutDashboard, Pill, Bell, History, Target, MessageSquare, Calendar } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, path: '/patient' },
  { label: 'Prescriptions', icon: <Pill className="h-4 w-4" />, path: '/patient/prescriptions' },
  { label: 'Reminders', icon: <Bell className="h-4 w-4" />, path: '/patient/reminders' },
  { label: 'Target Goals', icon: <Target className="h-4 w-4" />, path: '/patient/goals' },
  { label: 'Side Effects', icon: <MessageSquare className="h-4 w-4" />, path: '/patient/side-effects' },
  { label: 'Appointments', icon: <Calendar className="h-4 w-4" />, path: '/patient/appointments' },
  { label: 'History', icon: <History className="h-4 w-4" />, path: '/patient/history' },
];

export default function PatientHistory() {
  const { user, t } = useAuth();
  const { data: adherenceRecords = [] } = useAdherenceRecords();

  const myRecords = useMemo(() => 
    adherenceRecords.filter((rec: any) => rec.patientId === user?.id || rec.patient?.userId === user?.id),
    [adherenceRecords, user]
  );

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="animate-fade-in space-y-6">
        <h1 className="page-header">{t('medication_history')}</h1>
        <div className="space-y-3">
          {myRecords.length > 0 ? myRecords.map((rec: any) => (
            <Card key={rec.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    rec.status === 'taken' ? 'bg-success/10 text-success' :
                    rec.status === 'missed' ? 'bg-destructive/10 text-destructive' :
                    'bg-warning/10 text-warning'
                  }`}>
                    {rec.status === 'taken' ? <CheckCircle className="h-5 w-5" /> :
                     rec.status === 'missed' ? <XCircle className="h-5 w-5" /> :
                     <AlertCircle className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="font-medium text-card-foreground">{rec.medication}</div>
                    <div className="text-sm text-muted-foreground">Scheduled: {rec.scheduledTime}</div>
                    {rec.confirmedTime && <div className="text-sm text-muted-foreground">Confirmed: {rec.confirmedTime}</div>}
                  </div>
                </div>
                <span className={
                  rec.status === 'taken' ? 'badge-success' :
                  rec.status === 'missed' ? 'badge-destructive' : 'badge-warning'
                }>{rec.status}</span>
              </CardContent>
            </Card>
          )) : (
            <div className="text-sm text-muted-foreground">{t('no_history_found') || 'No medication history available.'}</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
