import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useReminders, usePrescriptions } from '@/hooks/use-api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Pill, Bell, Clock, History, Target, MessageSquare, Calendar, CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function PatientReminders() {
  const { user, t, language } = useAuth();
  const queryClient = useQueryClient();
  const { data: reminders = [] } = useReminders();
  const { data: prescriptions = [] } = usePrescriptions();
  const [expandedRx, setExpandedRx] = useState<Record<number, boolean>>({});

  const toggleRx = (id: number) => {
    setExpandedRx(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const patientPrescriptions = useMemo(() =>
    prescriptions.filter((p: any) => p.patientId === user?.id || p.patient?.userId === user?.id),
    [prescriptions, user]
  );

  const patientReminders = useMemo(() =>
    reminders.filter((r: any) => r.patientId === user?.id || r.patient?.userId === user?.id),
    [reminders, user]
  );

  const prescriptionsWithReminders = useMemo(() => {
    return patientPrescriptions.map((rx: any) => ({
      ...rx,
      reminders: patientReminders.filter((r: any) => r.prescriptionId === rx.id)
    }));
  }, [patientPrescriptions, patientReminders]);

  const confirmMed = async (id: number) => {
    try {
      await api.reminders.update(id, { status: 'taken' });
      toast.success(t('medication_marked_taken'));
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    } catch (error) {
      toast.error(t('failed_to_update'));
    }
  };

  const hasReminders = prescriptionsWithReminders.some((rx: any) => rx.reminders.length > 0);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="page-header">{t('reminders')}</h1>
          <p className="text-muted-foreground">{t('view_manage_reminders')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              {t('your_prescriptions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prescriptionsWithReminders.length > 0 ? (
                prescriptionsWithReminders.map((rx: any) => (
                  <div key={rx.id} className="space-y-2">
                    <div 
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                        expandedRx[rx.id] ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 hover:bg-muted/50'
                      }`}
                      onClick={() => toggleRx(rx.id)}
                    >
                      <div className="flex items-center gap-3">
                        {expandedRx[rx.id] ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        <div>
                          <div className="font-bold text-primary">{t(rx.medication)}</div>
                          <div className="text-xs text-muted-foreground">{t(rx.dosage)} · {t(rx.frequency)}</div>
                        </div>
                      </div>
                      {rx.reminders.length > 0 && (
                        <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                          {rx.reminders.length} {t('reminders')}
                        </div>
                      )}
                    </div>

                    {expandedRx[rx.id] && (
                      <div className="pl-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
                        {rx.reminders.length > 0 ? (
                          rx.reminders.map((rem: any) => (
                            <div key={rem.id} className="flex items-center justify-between p-4 rounded-lg border bg-card shadow-sm">
                              <div className="flex items-center gap-4 flex-1">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  rem.status === 'taken' ? 'bg-success/10 text-success' :
                                  rem.status === 'missed' ? 'bg-destructive/10 text-destructive' :
                                  'bg-primary/10 text-primary'
                                }`}>
                                  {rem.status === 'taken' ? <CheckCircle className="h-5 w-5" /> :
                                   rem.status === 'missed' ? <XCircle className="h-5 w-5" /> :
                                   <Clock className="h-5 w-5" />}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-card-foreground text-sm">{new Date(rem.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                  <div className="text-xs text-muted-foreground">{t(rem.type)?.toUpperCase()} · {new Date(rem.scheduledTime).toLocaleDateString()}</div>
                                </div>
                              </div>
                              {rem.status === 'pending' && (
                                <Button size="sm" variant="outline" className="h-8 border-success text-success hover:bg-success/10" onClick={(e) => { e.stopPropagation(); confirmMed(rem.id); }}>
                                  {t('take_now')}
                                </Button>
                              )}
                              {rem.status !== 'pending' && (
                                <div className={`text-xs font-bold px-2 py-1 rounded-full ${rem.status === 'taken' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                                  {t(rem.status).toUpperCase()}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-muted-foreground italic p-2">{t('no_reminders')}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground italic">
                  {t('no_active_prescriptions')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!hasReminders && prescriptionsWithReminders.length > 0 && (
          <Card className="border-muted bg-muted/30">
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              {t('no_reminders_scheduled')}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
