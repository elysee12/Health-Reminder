import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { usePatients, useSmsLogs } from '@/hooks/use-api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutDashboard, Users, Pill, Bell, BarChart3, MessageSquare, Send, CheckCircle, Clock, XCircle, Info, Target, Calendar, UserCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

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

const SMS_SUPPORT_FOOTER = '\n---\nFor support: Call +250 788 000 100 | SMS: +250 722 000 200 | Email: support@mhealth.rw';

const smsTemplates = {
  reminder: `Muraho {patient_name}! Igihe cyo gufata {medication} ({dosage}) kirageze. Mwifurize ubuzima bwiza!${SMS_SUPPORT_FOOTER}`,
  missed: `{patient_name}, twabonye ko utafashe {medication} ku gihe. Nyamuneka ufate umuti wawe vuba bishoboka.${SMS_SUPPORT_FOOTER}`,
  appointment: `Muraho {patient_name}! Wibutse gusura muganga wawe ku itariki {date} saa {time}.${SMS_SUPPORT_FOOTER}`,
  bp_check: `{patient_name}, ni igihe cyo gupima umuvuduko w'amaraso. Nyamuneka andika ibisubizo byawe.${SMS_SUPPORT_FOOTER}`,
};

export default function ProviderSMS() {
  const { t, language, user } = useAuth();
  const queryClient = useQueryClient();
  const { data: patients = [] } = usePatients(user?.id);
  const { data: logs = [] } = useSmsLogs(user?.id);
  const [sendOpen, setSendOpen] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sendType, setSendType] = useState<'patient' | 'custom' | 'all'>('patient');
  const [template, setTemplate] = useState<string>('custom');

  // Auto-refresh logs if there are pending messages
  useEffect(() => {
    const hasPending = (logs ?? []).some((s: any) => s.status === 'pending');
    if (hasPending) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries(['sms-logs']);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [logs, queryClient]);

  const broadcastMutation = useMutation({
    mutationFn: api.smsLogs.broadcast,
    onSuccess: () => {
      queryClient.invalidateQueries(['sms-logs']);
      toast.success(language === 'en' ? 'SMS sent successfully' : 'SMS yoherejwe neza');
    },
    onError: (error: any) => {
      toast.error(error?.message || (language === 'en' ? 'Failed to send SMS' : 'Ntiyohereje SMS'));
    }
  });

  const sendablePatients = patients.filter(
    (p: any) => p.communicationMethod === 'sms' || p.communicationMethod === 'both',
  );

  const deliveredCount = (logs ?? []).filter((s: any) => s.status === 'delivered').length;
  const failedCount = (logs ?? []).filter((s: any) => s.status === 'failed').length;

  const applyTemplate = (key: string) => {
    setTemplate(key);
    if (key !== 'custom') {
      setMessage(smsTemplates[key as keyof typeof smsTemplates] || '');
    } else {
      setMessage('');
    }
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error(language === 'en' ? 'Please enter a message' : 'Andika ubutumwa');
      return;
    }

    const msgWithFooter = message.includes('support') ? message : message + SMS_SUPPORT_FOOTER;

    try {
      if (sendType === 'all') {
        if (!sendablePatients.length) {
          toast.error(language === 'en' ? 'No SMS-enabled patients found' : 'Nta barwayi bafite SMS babonetse');
          return;
        }

        await broadcastMutation.mutateAsync({
          message: msgWithFooter,
        });
      } else if (sendType === 'patient' && recipient) {
        const pat = patients.find((p: any) => `${p.id}` === recipient);
        if (!pat) {
          toast.error('Patient not found');
          return;
        }

        await broadcastMutation.mutateAsync({
          patientId: pat.id,
          message: msgWithFooter,
        });
      } else if (sendType === 'custom' && customPhone) {
        await broadcastMutation.mutateAsync({
          phone: customPhone,
          message: msgWithFooter,
        });
      } else {
        toast.error(language === 'en' ? 'Please select a recipient' : 'Hitamo uwo wohereza');
        return;
      }
    } catch (error: any) {
      // Error is handled by mutation
    } finally {
      setMessage('');
      setRecipient('');
      setCustomPhone('');
      setSendOpen(false);
      setTemplate('custom');
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-header">{t('sms_management')}</h1>
          <Dialog open={sendOpen} onOpenChange={setSendOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Send className="h-4 w-4" />{language === 'en' ? 'Send SMS' : 'Ohereza SMS'}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle className="font-heading">{language === 'en' ? 'Send SMS' : 'Ohereza SMS'}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>{language === 'en' ? 'Send To' : 'Ohereza Kuri'}</Label>
                  <Select value={sendType} onValueChange={(v) => {
                    setSendType(v as any);
                    if (v === 'all') applyTemplate('custom');
                  }}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">{language === 'en' ? 'Select Patient' : 'Hitamo Umurwayi'}</SelectItem>
                      <SelectItem value="custom">{language === 'en' ? 'Custom Number' : 'Numero Yihariye'}</SelectItem>
                      <SelectItem value="all">{language === 'en' ? 'All SMS Patients' : 'Abarwayi Bose ba SMS'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {sendType === 'patient' && (
                  <div>
                    <Label>{language === 'en' ? 'Patient' : 'Umurwayi'}</Label>
                    <Select value={recipient} onValueChange={setRecipient}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder={language === 'en' ? 'Select patient...' : 'Hitamo umurwayi...'} /></SelectTrigger>
                      <SelectContent>
                        {sendablePatients.map((p: any) => (
                          <SelectItem key={p.id} value={`${p.id}`}>{p.name} ({p.phone})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {sendType === 'custom' && (
                  <div>
                    <Label>{language === 'en' ? 'Phone Number' : 'Numero ya Telefoni'}</Label>
                    <Input value={customPhone} onChange={(e) => setCustomPhone(e.target.value)} placeholder="+250788..." className="mt-1.5" />
                  </div>
                )}
                {sendType === 'all' && (
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {language === 'en'
                      ? `This will send to ${sendablePatients.length} patients with SMS enabled.`
                      : `Ibi bizohereza ku barwayi ${sendablePatients.length} bafite SMS.`}
                  </p>
                )}
                <div>
                  <Label>{language === 'en' ? 'Template' : 'Icyitegererezo'}</Label>
                  <Select value={template} onValueChange={applyTemplate}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">{language === 'en' ? 'Custom Message' : 'Ubutumwa Bwihariye'}</SelectItem>
                      {sendType !== 'all' && (
                        <>
                          <SelectItem value="reminder">{language === 'en' ? 'Medication Reminder' : 'Ikibutsa cy\'Imiti'}</SelectItem>
                          <SelectItem value="missed">{language === 'en' ? 'Missed Dose Alert' : 'Imiti Yaburiwe'}</SelectItem>
                          <SelectItem value="bp_check">{language === 'en' ? 'BP Check Reminder' : "Ikibutsa cyo Gupima Umuvuduko"}</SelectItem>
                          <SelectItem value="appointment">{language === 'en' ? 'Appointment Reminder' : 'Ikibutsa cy\'Ikiruhuko'}</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{language === 'en' ? 'Message' : 'Ubutumwa'}</Label>
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={language === 'en' ? 'Type your message...' : 'Andika ubutumwa bwawe...'} className="mt-1.5" rows={5} />
                  <p className="text-xs text-muted-foreground mt-1">{message.length}/320 {language === 'en' ? 'characters' : 'inyuguti'}</p>
                </div>
                <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg">
                  <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    {language === 'en'
                      ? 'Support contact details are automatically appended to all outgoing SMS messages.'
                      : "Amakuru y'ubufasha ashyirwa mu butumwa bwose bwa SMS bwoherezwa."}
                  </p>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild><Button variant="outline">{language === 'en' ? 'Cancel' : 'Hagarika'}</Button></DialogClose>
                <Button onClick={handleSend} className="gap-2"><Send className="h-4 w-4" />{language === 'en' ? 'Send' : 'Ohereza'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="stat-card"><div className="text-2xl font-bold font-heading text-card-foreground">{(logs ?? []).length}</div><div className="text-sm text-muted-foreground">{language === 'en' ? 'Total Sent' : 'Byose Byoherejwe'}</div></div>
          <div className="stat-card"><div className="text-2xl font-bold font-heading text-success">{deliveredCount}</div><div className="text-sm text-muted-foreground">{language === 'en' ? 'Delivered' : 'Byageze'}</div></div>
          <div className="stat-card"><div className="text-2xl font-bold font-heading text-destructive">{failedCount}</div><div className="text-sm text-muted-foreground">{language === 'en' ? 'Failed' : 'Byanze'}</div></div>
        </div>

        <Card>
          <CardHeader><CardTitle className="font-heading">{language === 'en' ? 'SMS Log' : 'Amakuru ya SMS'}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(logs ?? []).map((sms: any) => (
                <div key={sms.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      sms.status === 'delivered' ? 'bg-success/10 text-success' :
                      sms.status === 'failed' ? 'bg-destructive/10 text-destructive' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {sms.status === 'delivered' ? <CheckCircle className="h-4 w-4" /> :
                       sms.status === 'failed' ? <XCircle className="h-4 w-4" /> :
                       <Clock className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-card-foreground">{sms.patient?.name ?? sms.phone}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-md">{(sms.message ?? '').split('\n')[0]}</div>
                      <div className="text-xs text-muted-foreground mt-1">{sms.phone} · {sms.time || (sms.createdAt ? new Date(sms.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '')}</div>
                    </div>
                  </div>
                  <span className={
                    sms.status === 'delivered' ? 'badge-success' :
                    sms.status === 'failed' ? 'badge-destructive' : 'badge-warning'
                  }>{sms.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
