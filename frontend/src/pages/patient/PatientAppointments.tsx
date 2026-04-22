import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Pill, Bell, History, Target, MessageSquare, Calendar, Plus, Loader2, MapPin, AlertCircle } from 'lucide-react';
import { useAppointments, useHospitals } from '@/hooks/use-api';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

const sidebarItems = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, path: '/patient' },
  { label: 'Prescriptions', icon: <Pill className="h-4 w-4" />, path: '/patient/prescriptions' },
  { label: 'Reminders', icon: <Bell className="h-4 w-4" />, path: '/patient/reminders' },
  { label: 'Target Goals', icon: <Target className="h-4 w-4" />, path: '/patient/goals' },
  { label: 'Side Effects', icon: <MessageSquare className="h-4 w-4" />, path: '/patient/side-effects' },
  { label: 'Appointments', icon: <Calendar className="h-4 w-4" />, path: '/patient/appointments' },
  { label: 'History', icon: <History className="h-4 w-4" />, path: '/patient/history' },
];

export default function PatientAppointments() {
  const { user, language } = useAuth();
  const { data: appointments = [], isLoading, refetch } = useAppointments(user?.id);
  const { data: hospitals = [] } = useHospitals();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formHospital, setFormHospital] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formType, setFormType] = useState('regular');
  const [formReason, setFormReason] = useState('');

  const handleBook = async () => {
    if (!formHospital || !formDate || !formReason) {
      toast.error('Hospital, date, and reason are required');
      return;
    }

    setLoading(true);
    try {
      await api.appointments.create({
        patientId: user?.id,
        hospitalId: +formHospital,
        dateTime: formDate,
        type: formType,
        reason: formReason,
        status: 'pending',
      });
      toast.success(language === 'en' ? 'Appointment booked successfully' : 'Gufata gahunda byagenze neza');
      setOpen(false);
      refetch();
    } catch (error) {
      toast.error('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">{language === 'en' ? 'Appointments' : 'Gufata Gahunda'}</h1>
            <p className="text-muted-foreground">{language === 'en' ? 'Manage your hospital visits and book emergency appointments' : 'Gucunga gahunda zo kwa muganga no gufata gahunda zihutirwa'}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                <AlertCircle className="h-4 w-4" />
                {language === 'en' ? 'Emergency Booking' : 'Gahunda Yihutirwa'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === 'en' ? 'Book Emergency Appointment' : 'Fata Gahunda Yihutirwa'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Select Hospital' : 'Hitamo Ibitaro'}</Label>
                  <Select value={formHospital} onValueChange={setFormHospital}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitals.map((h: any) => (
                        <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Preferred Date & Time' : 'Itariki n\'Isaha wifuza'}</Label>
                  <Input type="datetime-local" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Reason for Emergency' : 'Impamvu yihutirwa'}</Label>
                  <Input value={formReason} onChange={(e) => setFormReason(e.target.value)} placeholder="e.g., Severe headache, Chest pain" />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setOpen(false)}>{language === 'en' ? 'Cancel' : 'Reka'}</Button>
                <Button onClick={handleBook} disabled={loading} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {language === 'en' ? 'Book Now' : 'Fata gahunda'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">Loading appointments...</div>
        ) : (
          <div className="grid gap-4">
            {appointments.length > 0 ? (
              appointments.map((app: any) => (
                <Card key={app.id} className={app.type === 'emergency' ? 'border-destructive/50 bg-destructive/5' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${app.type === 'emergency' ? 'bg-destructive/20 text-destructive' : 'bg-primary/10 text-primary'}`}>
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold flex items-center gap-2">
                            {app.hospital.name}
                            {app.type === 'emergency' && <span className="text-[10px] uppercase tracking-wider font-bold bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded">Emergency</span>}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded border ${
                            app.status === 'confirmed' ? 'bg-success/10 text-success border-success' : 
                            app.status === 'pending' ? 'bg-primary/10 text-primary border-primary' : 'bg-muted text-muted-foreground border-muted'
                          }`}>
                            {app.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {app.hospital.address}
                        </div>
                        <div className="text-sm font-medium">{new Date(app.dateTime).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mt-2 italic">Reason: {app.reason}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-12 text-center border-2 border-dashed rounded-xl">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">{language === 'en' ? 'No appointments yet' : 'Nta gahunda ufite'}</h3>
                <p className="text-muted-foreground mb-6">{language === 'en' ? 'Book regular follow-ups or emergency visits here.' : 'Fata gahunda zo gusurwa cyangwa izihutirwa hano.'}</p>
                <Button variant="outline" onClick={() => setOpen(true)}>{language === 'en' ? 'Book New Appointment' : 'Fata Gahunda nshya'}</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
