import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Pill, Bell, BarChart3, MessageSquare, Target, Calendar, UserCheck, AlertTriangle, Plus, Loader2, Search, Filter, CheckCircle } from 'lucide-react';
import { useAppointments, usePatients, useHospitals } from '@/hooks/use-api';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

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

export default function ProviderAppointments() {
  const { language, user } = useAuth();
  const { data: appointments = [], isLoading, refetch } = useAppointments(undefined, undefined, user?.id);
  const { data: patients = [] } = usePatients(user?.id);
  const { data: hospitals = [] } = useHospitals();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formPatient, setFormPatient] = useState('');
  const [formHospital, setFormHospital] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formType, setFormType] = useState('regular');
  const [formReason, setFormReason] = useState('');

  const filteredAppointments = useMemo(() => {
    return appointments.filter((app: any) => {
      const matchesSearch =
        app.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
        app.hospital?.name?.toLowerCase().includes(search.toLowerCase()) ||
        app.reason?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesType = typeFilter === 'all' || app.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [appointments, search, statusFilter, typeFilter]);

  const handleCreate = async () => {
    if (!formPatient || !formHospital || !formDate || !formReason) {
      toast.error(language === 'en' ? 'Please fill all required fields' : 'Wuzuza imyanya yose ikenewe');
      return;
    }

    setLoading(true);
    try {
      await api.appointments.create({
        patientId: +formPatient,
        hospitalId: +formHospital,
        dateTime: formDate,
        type: formType,
        reason: formReason,
        status: 'pending',
      });
      toast.success(language === 'en' ? 'Appointment scheduled' : 'Gahunda yashyizweho');
      setOpen(false);
      refetch();
      setFormPatient('');
      setFormHospital('');
      setFormDate('');
      setFormType('regular');
      setFormReason('');
    } catch (error: any) {
      toast.error(error?.message || (language === 'en' ? 'Failed to schedule appointment' : 'Ntiyashoboye gushyirwaho gahunda'));
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.appointments.update(id, { status });
      toast.success(language === 'en' ? 'Appointment status updated' : 'Uruhare rwahinduwe');
      refetch();
    } catch (error: any) {
      toast.error(error?.message || (language === 'en' ? 'Failed to update status' : 'Ntiyashoboye guhindura uko bihagaze'));
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">{language === 'en' ? 'Appointments' : 'Gahunda'}</h1>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Review and manage appointment bookings for your patients'
                : 'Reba kandi ucunge gahunda z’abarwayi bawe'}
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {language === 'en' ? 'New Appointment' : 'Gahunda nshya'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === 'en' ? 'Schedule Appointment' : 'Shyiraho gahunda'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Patient' : 'Umurwayi'}</Label>
                  <Select value={formPatient} onValueChange={setFormPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'en' ? 'Select patient' : 'Hitamo umurwayi'} />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p: any) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Hospital' : 'Ibitaro'}</Label>
                  <Select value={formHospital} onValueChange={setFormHospital}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'en' ? 'Select hospital' : 'Hitamo ibitaro'} />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitals.map((h: any) => (
                        <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Date & Time' : 'Itariki n\'Isaha'}</Label>
                    <Input type="datetime-local" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Type' : 'Ubwoko'}</Label>
                    <Select value={formType} onValueChange={setFormType}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'en' ? 'Select type' : 'Hitamo ubwoko'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">{language === 'en' ? 'Regular' : 'Gisanzwe'}</SelectItem>
                        <SelectItem value="emergency">{language === 'en' ? 'Emergency' : 'Yihutirwa'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Reason' : 'Impamvu'}</Label>
                  <Input value={formReason} onChange={(e) => setFormReason(e.target.value)} placeholder={language === 'en' ? 'e.g., Medication review' : 'Urugero: Gusuzuma imiti'} />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setOpen(false)}>{language === 'en' ? 'Cancel' : 'Reka'}</Button>
                <Button onClick={handleCreate} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {language === 'en' ? 'Schedule' : 'Shyiraho'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'en' ? 'Search appointments...' : 'Shakisha gahunda...'}
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={language === 'en' ? 'Status' : 'Imiterere'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'en' ? 'All Statuses' : 'Imiterere yose'}</SelectItem>
              <SelectItem value="pending">{language === 'en' ? 'Pending' : 'Bitegereje'}</SelectItem>
              <SelectItem value="confirmed">{language === 'en' ? 'Confirmed' : 'Yemejwe'}</SelectItem>
              <SelectItem value="cancelled">{language === 'en' ? 'Cancelled' : 'Yahagaze'}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={language === 'en' ? 'Type' : 'Ubwoko'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'en' ? 'All Types' : 'Ubwoko bwose'}</SelectItem>
              <SelectItem value="regular">{language === 'en' ? 'Regular' : 'Gisanzwe'}</SelectItem>
              <SelectItem value="emergency">{language === 'en' ? 'Emergency' : 'Yihutirwa'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">{language === 'en' ? 'Loading appointments...' : 'Gukurura gahunda...'}</div>
        ) : (
          <div className="grid gap-4">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((app: any) => (
                <Card key={app.id} className={app.type === 'emergency' ? 'border-destructive/50 bg-destructive/5' : ''}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-lg">{app.patient?.name || 'Unknown patient'}</h3>
                            <div className="text-sm text-muted-foreground">{app.hospital?.name || 'Unknown hospital'}</div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded uppercase tracking-wide ${
                            app.status === 'confirmed' ? 'bg-success/10 text-success' :
                            app.status === 'pending' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <div className="mt-3 text-sm text-muted-foreground">
                          <div>{new Date(app.dateTime).toLocaleString()}</div>
                          <div className="mt-1">{app.reason}</div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2">
                        <div className="text-sm font-medium text-muted-foreground">{app.type === 'emergency' ? (language === 'en' ? 'Emergency visit' : 'Gusura yihutirwa') : (language === 'en' ? 'Regular visit' : 'Gusura isanzwe')}</div>
                        <div className="flex gap-2">
                          {app.status !== 'confirmed' && (
                            <Button size="sm" variant="outline" className="text-success border-success hover:bg-success/10" onClick={() => updateStatus(app.id, 'confirmed')}>
                              Confirm
                            </Button>
                          )}
                          {app.status !== 'cancelled' && (
                            <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => updateStatus(app.id, 'cancelled')}>
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-12 text-center border-2 border-dashed rounded-xl">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">{language === 'en' ? 'No appointments yet' : 'Nta gahunda ihari'}</h3>
                <p className="text-muted-foreground">{language === 'en' ? 'Schedule appointments for the patients you are managing.' : 'Shyiraho gahunda ku barwayi ubakurikirana.'}</p>
                <Button variant="outline" onClick={() => setOpen(true)}>{language === 'en' ? 'Schedule Appointment' : 'Shyiraho gahunda'}</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
