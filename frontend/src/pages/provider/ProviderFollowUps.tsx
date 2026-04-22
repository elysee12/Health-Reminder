import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Pill, Bell, BarChart3, MessageSquare, Target, Calendar, UserCheck, AlertTriangle, Plus, Loader2, CheckCircle, Clock } from 'lucide-react';
import { useFollowUps, usePatients } from '@/hooks/use-api';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

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

export default function ProviderFollowUps() {
  const { user, language } = useAuth();
  const { data: followUps = [], isLoading, refetch } = useFollowUps(undefined, user?.id);
  const { data: patients = [] } = usePatients(user?.id);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formPatient, setFormPatient] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const handleSchedule = async () => {
    if (!formPatient || !formDate) {
      toast.error('Patient and date are required');
      return;
    }

    setLoading(true);
    try {
      await api.followUps.create({
        providerId: Number(user?.id),
        patientId: Number(formPatient),
        followUpDate: formDate,
        notes: formNotes,
        status: 'scheduled',
      });
      toast.success(language === 'en' ? 'Follow-up scheduled' : 'Gahunda yo gusurwa yashyizweho');
      setOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule follow-up');
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (id: number) => {
    try {
      await api.followUps.update(id, { status: 'completed' });
      toast.success(language === 'en' ? 'Follow-up marked as completed' : 'Gahunda yarangiye');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">{language === 'en' ? 'Patient Follow-ups' : 'Gukurikirana Abarwayi'}</h1>
            <p className="text-muted-foreground">{language === 'en' ? 'Schedule and manage patient progress checks' : 'Gushyiraho no gucunga gahunda zo gukurikirana abarwayi'}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {language === 'en' ? 'Schedule Follow-up' : 'Shyiraho Gahunda'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === 'en' ? 'Schedule Follow-up Visit' : 'Shyiraho Gahunda yo Gusurwa'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Select Patient' : 'Hitamo Umurwayi'}</Label>
                  <Select value={formPatient} onValueChange={setFormPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p: any) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Date & Time' : 'Itariki n\'Isaha'}</Label>
                  <Input type="datetime-local" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Follow-up Focus' : 'Icyo gukurikirana'}</Label>
                  <Input value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="e.g., BP check, Medication review" />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setOpen(false)}>{language === 'en' ? 'Cancel' : 'Reka'}</Button>
                <Button onClick={handleSchedule} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {language === 'en' ? 'Schedule' : 'Shyiraho'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">Loading follow-ups...</div>
        ) : (
          <div className="grid gap-4">
            {followUps.length > 0 ? (
              followUps.map((fu: any) => (
                <Card key={fu.id} className={fu.status === 'completed' ? 'opacity-70 grayscale bg-muted/20' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${fu.status === 'completed' ? 'bg-success/20 text-success' : 'bg-primary/10 text-primary'}`}>
                        {fu.status === 'completed' ? <CheckCircle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold">{fu.patient.name}</h3>
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                            fu.status === 'completed' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                          }`}>
                            {fu.status}
                          </span>
                        </div>
                        <div className="text-sm font-medium">{new Date(fu.followUpDate).toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground mt-1">{fu.notes}</div>
                      </div>
                      {fu.status === 'scheduled' && (
                        <Button size="sm" variant="outline" className="border-success text-success hover:bg-success/10" onClick={() => markComplete(fu.id)}>
                          Mark Done
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-12 text-center border-2 border-dashed rounded-xl">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">{language === 'en' ? 'No follow-ups scheduled' : 'Nta gahunda zo gusurwa zihari'}</h3>
                <p className="text-muted-foreground mb-6">{language === 'en' ? 'Keep track of your patients progress here.' : 'Kurikirana aho abarwayi bawe bageze hano.'}</p>
                <Button variant="outline" onClick={() => setOpen(true)}>{language === 'en' ? 'Schedule First Follow-up' : 'Shyiraho gahunda ya mbere'}</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
