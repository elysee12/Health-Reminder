import { useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { usePatients, usePrescriptions } from '@/hooks/use-api';
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

export default function PatientPrescriptions() {
  const { user, t } = useAuth();
  const { data: prescriptions = [] } = usePrescriptions();

  const myPrescriptions = useMemo(() => 
    prescriptions.filter((p: any) => p.patientId === user?.id || p.patient?.userId === user?.id),
    [prescriptions, user]
  );

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="animate-fade-in space-y-6">
        <h1 className="page-header">{t('prescriptions')}</h1>
        <div className="space-y-4">
          {myPrescriptions.length > 0 ? myPrescriptions.map((rx: any) => (
            <Card key={rx.id}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-card-foreground">{rx.medication}</h3>
                    <p className="text-muted-foreground">{rx.dosage} — {rx.frequency}</p>
                    <p className="text-sm text-muted-foreground mt-2">{rx.startDate} → {rx.endDate}</p>
                    <p className="text-sm text-muted-foreground">Prescribed by {rx.prescribedBy}</p>
                  </div>
                  <span className={rx.status === 'active' ? 'badge-success' : 'badge-warning'}>{rx.status}</span>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-sm text-muted-foreground">{t('no_prescriptions_found') || 'No prescriptions available.'}</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
