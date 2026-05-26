import { useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { usePatients, usePrescriptions } from '@/hooks/use-api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { LayoutDashboard, Pill, Bell, History, Target, MessageSquare, Calendar } from 'lucide-react';

export default function PatientPrescriptions() {
  const { user, t } = useAuth();
  const { data: prescriptions = [] } = usePrescriptions();

  const myPrescriptions = useMemo(() => 
    prescriptions.filter((p: any) => p.patientId === user?.id || p.patient?.userId === user?.id),
    [prescriptions, user]
  );

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <h1 className="page-header">{t('prescriptions')}</h1>
        <div className="space-y-4">
          {myPrescriptions.length > 0 ? myPrescriptions.map((rx: any) => (
            <Card key={rx.id}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-card-foreground">{t(rx.medication)}</h3>
                    <p className="text-muted-foreground">{t(rx.dosage)} — {t(rx.frequency)}</p>
                    <p className="text-sm text-muted-foreground mt-2">{new Date(rx.startDate).toLocaleDateString()} → {new Date(rx.endDate).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">Prescribed by {rx.provider?.name || rx.prescribedBy}</p>
                  </div>
                  <span className={rx.status === 'active' ? 'badge-success px-2 py-0.5 rounded text-xs' : 'badge-warning px-2 py-0.5 rounded text-xs'}>{t(rx.status)}</span>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-sm text-muted-foreground">{t('no_active_prescriptions')}</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
