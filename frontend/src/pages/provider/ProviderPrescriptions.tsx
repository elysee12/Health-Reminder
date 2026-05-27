import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { usePatients, usePrescriptions } from '@/hooks/use-api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { LayoutDashboard, Users, Pill, Bell, BarChart3, MessageSquare, Plus, Pencil, Trash2, Target, Calendar, UserCheck, AlertTriangle } from 'lucide-react';

export default function ProviderPrescriptions() {
  const queryClient = useQueryClient();
  const { t, language, user } = useAuth();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString(language === 'en' ? 'en-US' : 'fr-FR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const { data: rxList = [], isLoading } = usePrescriptions(user?.id);
  const { data: patients = [] } = usePatients(user?.id);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const [formPatient, setFormPatient] = useState('');
  const [formMedication, setFormMedication] = useState('');
  const [formDosage, setFormDosage] = useState('');
  const [formFrequency, setFormFrequency] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'completed' | 'discontinued'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formReminderType, setFormReminderType] = useState('web');
  const [formReminderTimes, setFormReminderTimes] = useState<string[]>(['08:00']);

  const resetForm = () => { setFormPatient(''); setFormMedication(''); setFormDosage(''); setFormFrequency(''); setFormStartDate(''); setFormEndDate(''); setFormStatus('active'); setFormReminderType('web'); setFormReminderTimes(['08:00']); };

  const handleAdd = async () => {
    const filteredTimes = formReminderTimes.filter(t => t.trim() !== '');
    if (!formPatient || !formMedication || !formDosage || !formFrequency || !formStartDate || !formEndDate || filteredTimes.length === 0) {
      toast.error(language === 'en' ? 'Please fill all fields, including at least one reminder time.' : 'Uzuza imyanya yose, harimo nibura igihe kimwe cyo kwibutsa.');
      return;
    }

    try {
      await api.prescriptions.create({
        patientId: Number(formPatient),
        medication: formMedication,
        dosage: formDosage,
        frequency: formFrequency,
        startDate: formStartDate,
        endDate: formEndDate,
        status: formStatus,
        providerId: user?.id ? Number(user.id) : undefined,
        reminderType: formReminderType,
        reminderTimes: filteredTimes,
      });
      await queryClient.invalidateQueries(['prescriptions']);
      resetForm(); setAddOpen(false);
      toast.success(language === 'en' ? 'Prescription added successfully' : 'Imiti yanditswe neza');
    } catch (error: any) {
      toast.error(error.message || (language === 'en' ? 'Unable to add prescription' : 'Ntabashije kongera imiti'));
    }
  };

  const openEdit = (rx: any) => {
    setSelected(rx);
    setFormPatient(String(rx.patientId));
    setFormMedication(rx.medication);
    setFormDosage(rx.dosage);
    setFormFrequency(rx.frequency);
    
    // Format for datetime-local: YYYY-MM-DDTHH:mm
    const formatForInput = (dateStr: string) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setFormStartDate(formatForInput(rx.startDate));
    setFormEndDate(formatForInput(rx.endDate));
    setFormStatus(rx.status);
    setFormReminderType(rx.reminderType || 'web');
    setFormReminderTimes(rx.reminderTimes || ['08:00']);
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selected) return;
    const filteredTimes = formReminderTimes.filter(t => t.trim() !== '');
    if (!formPatient || !formMedication || !formDosage || !formFrequency || !formStartDate || !formEndDate || filteredTimes.length === 0) {
      toast.error(language === 'en' ? 'Please fill all fields, including at least one reminder time.' : 'Uzuza imyanya yose, harimo nibura igihe kimwe cyo kwibutsa.');
      return;
    }

    try {
      await api.prescriptions.update(selected.id, {
        patientId: Number(formPatient),
        medication: formMedication,
        dosage: formDosage,
        frequency: formFrequency,
        startDate: formStartDate,
        endDate: formEndDate,
        status: formStatus,
        providerId: user?.id ? Number(user.id) : undefined,
        reminderType: formReminderType,
        reminderTimes: filteredTimes,
      });
      await queryClient.invalidateQueries(['prescriptions']);
      resetForm(); setEditOpen(false); setSelected(null);
      toast.success(language === 'en' ? 'Prescription updated' : 'Imiti yahinduwe neza');
    } catch (error: any) {
      toast.error(error.message || (language === 'en' ? 'Unable to update prescription' : 'Ntabashije guhindura imiti'));
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await api.prescriptions.remove(selected.id);
      await queryClient.invalidateQueries(['prescriptions']);
      setDeleteOpen(false); setSelected(null);
      toast.success(language === 'en' ? 'Prescription deleted' : 'Imiti yasibwe');
    } catch (error: any) {
      toast.error(error.message || (language === 'en' ? 'Unable to delete prescription' : 'Ntabashije gusiba imiti'));
    }
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...formReminderTimes];
    newTimes[index] = value;
    setFormReminderTimes(newTimes);
  };

  const addTimeField = () => {
    setFormReminderTimes([...formReminderTimes, '']);
  };

  const removeTimeField = (index: number) => {
    const newTimes = formReminderTimes.filter((_, i) => i !== index);
    setFormReminderTimes(newTimes);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-header">{t('prescriptions')}</h1>
          <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />{language === 'en' ? 'Add Prescription' : 'Ongeraho Imiti'}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="font-heading">{language === 'en' ? 'Add New Prescription' : 'Ongeraho Imiti Mishya'}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>{language === 'en' ? 'Patient' : 'Umurwayi'}</Label>
                  <Select value={formPatient} onValueChange={setFormPatient}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder={language === 'en' ? 'Select patient' : 'Hitamo umurwayi'} /></SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => <SelectItem key={p.id} value={`${p.id}`}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {formPatient && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === 'en' ? 'Reminders will be sent to: ' : 'Ibikubutsa bizoherezwa kuri: '}
                      <span className="font-medium">{patients.find(p => `${p.id}` === formPatient)?.phone}</span>
                    </p>
                  )}
                </div>
                <div><Label>{language === 'en' ? 'Medication' : 'Umuti'}</Label><Input value={formMedication} onChange={(e) => setFormMedication(e.target.value)} placeholder="e.g. Amlodipine, Lisinopril, Losartan" className="mt-1.5" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>{language === 'en' ? 'Dosage' : 'Igipimo'}</Label><Input value={formDosage} onChange={(e) => setFormDosage(e.target.value)} placeholder="e.g. 500mg" className="mt-1.5" /></div>
                  <div><Label>{language === 'en' ? 'Frequency' : 'Inshuro'}</Label><Input value={formFrequency} onChange={(e) => setFormFrequency(e.target.value)} placeholder="e.g. Twice daily" className="mt-1.5" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>{language === 'en' ? 'Start Date' : 'Itariki yo Gutangira'}</Label><Input type="datetime-local" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} className="mt-1.5" /></div>
                  <div><Label>{language === 'en' ? 'End Date' : 'Itariki yo Kurangira'}</Label><Input type="datetime-local" value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} className="mt-1.5" /></div>
                </div>
                <div>
                  <Label>{language === 'en' ? 'Status' : 'Imimerere'}</Label>
                  <Select value={formStatus} onValueChange={(v) => setFormStatus(v as any)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{language === 'en' ? 'Active' : 'Irakora'}</SelectItem>
                      <SelectItem value="completed">{language === 'en' ? 'Completed' : 'Yarangiye'}</SelectItem>
                      <SelectItem value="discontinued">{language === 'en' ? 'Discontinued' : 'Yahagaritswe'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>{language === 'en' ? 'Reminder Type' : 'Ubwoko bw\'Ikibutsa'}</Label>
                    <Select value={formReminderType} onValueChange={setFormReminderType}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web">Web/App Notification</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="both">Both (Web + SMS)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{language === 'en' ? 'Reminder Times' : 'Ibihe byo Kwibutsa'}</Label>
                    {formReminderTimes.map((time, index) => (
                      <div key={index} className="flex gap-2 mt-1.5">
                        <Input type="time" value={time} onChange={(e) => handleTimeChange(index, e.target.value)} />
                        {formReminderTimes.length > 1 && (
                          <Button variant="outline" size="icon" onClick={() => removeTimeField(index)}><Trash2 className="h-4 w-4" /></Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="mt-2 w-full" onClick={addTimeField}><Plus className="h-4 w-4 mr-2" />Add Time</Button>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild><Button variant="outline">{language === 'en' ? 'Cancel' : 'Hagarika'}</Button></DialogClose>
                <Button onClick={handleAdd}>{language === 'en' ? 'Add Prescription' : 'Ongeraho'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-center py-3 px-4 font-medium text-muted-foreground w-12">{language === 'en' ? 'No' : 'Umubare'}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">{language === 'en' ? 'Patient' : 'Umurwayi'}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">{language === 'en' ? 'Medication' : 'Umuti'}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">{language === 'en' ? 'Dosage' : 'Igipimo'}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">{language === 'en' ? 'Frequency' : 'Inshuro'}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">{language === 'en' ? 'Duration' : 'Igihe'}</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">{language === 'en' ? 'Status' : 'Imimerere'}</th>
                <th className="text-right py-3 px-4 font-medium text-muted-foreground">{language === 'en' ? 'Actions' : 'Ibikorwa'}</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                // Group prescriptions by patient
                const grouped: { [key: number]: any[] } = {};
                const patientOrder: number[] = [];
                
                rxList.forEach((rx) => {
                  const patientId = rx.patientId;
                  if (!grouped[patientId]) {
                    grouped[patientId] = [];
                    patientOrder.push(patientId);
                  }
                  grouped[patientId].push(rx);
                });

                // Build rows with patient rowspan info
                let rowNumber = 1;
                return patientOrder.flatMap((patientId, patientIndex) => {
                  const prescriptions = grouped[patientId];
                  return prescriptions.map((rx, presIndex) => (
                    <tr key={rx.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="py-3 px-4 text-center font-medium text-card-foreground">{rowNumber++}</td>
                      {presIndex === 0 ? (
                        <td className="py-3 px-4 font-medium text-card-foreground" rowSpan={prescriptions.length}>
                          {rx.patient?.name}
                        </td>
                      ) : null}
                      <td className="py-3 px-4 text-card-foreground">{rx.medication}</td>
                      <td className="py-3 px-4 text-muted-foreground">{rx.dosage}</td>
                      <td className="py-3 px-4 text-muted-foreground">{rx.frequency}</td>
                      <td className="py-3 px-4 text-muted-foreground font-medium min-w-[200px]">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-primary/60" />
                            <span>{formatDate(rx.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 flex justify-center">
                              <span className="text-[10px] text-muted-foreground/40">to</span>
                            </div>
                            <span>{formatDate(rx.endDate)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={rx.status === 'active' ? 'badge-success' : rx.status === 'completed' ? 'badge-warning' : 'badge-destructive'}>{t(rx.status)}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(rx)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { setSelected(rx); setDeleteOpen(true); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ));
                });
              })()}
            </tbody>
          </table>
        </div>

        <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) { resetForm(); setSelected(null); } }}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-heading">{language === 'en' ? 'Edit Prescription' : 'Hindura Imiti'}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>{language === 'en' ? 'Patient' : 'Umurwayi'}</Label>
                <Select value={formPatient} onValueChange={setFormPatient}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder={language === 'en' ? 'Select patient' : 'Hitamo umurwayi'} /></SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>{language === 'en' ? 'Medication' : 'Umuti'}</Label><Input value={formMedication} onChange={(e) => setFormMedication(e.target.value)} placeholder="e.g. Amlodipine, Lisinopril, Losartan" className="mt-1.5" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{language === 'en' ? 'Dosage' : 'Igipimo'}</Label><Input value={formDosage} onChange={(e) => setFormDosage(e.target.value)} placeholder="e.g. 500mg" className="mt-1.5" /></div>
                <div><Label>{language === 'en' ? 'Frequency' : 'Inshuro'}</Label><Input value={formFrequency} onChange={(e) => setFormFrequency(e.target.value)} placeholder="e.g. Twice daily" className="mt-1.5" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>{language === 'en' ? 'Start Date' : 'Itariki yo Gutangira'}</Label><Input type="datetime-local" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} className="mt-1.5" /></div>
                <div><Label>{language === 'en' ? 'End Date' : 'Itariki yo Kurangira'}</Label><Input type="datetime-local" value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} className="mt-1.5" /></div>
              </div>
              <div>
                <Label>{language === 'en' ? 'Status' : 'Imimerere'}</Label>
                <Select value={formStatus} onValueChange={(v) => setFormStatus(v as any)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{language === 'en' ? 'Active' : 'Irakora'}</SelectItem>
                    <SelectItem value="completed">{language === 'en' ? 'Completed' : 'Yarangiye'}</SelectItem>
                    <SelectItem value="discontinued">{language === 'en' ? 'Discontinued' : 'Yahagaritswe'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{language === 'en' ? 'Reminder Type' : 'Ubwoko bw\'Ikibutsa'}</Label>
                  <Select value={formReminderType} onValueChange={setFormReminderType}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">Web/App Notification</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="both">Both (Web + SMS)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{language === 'en' ? 'Reminder Times' : 'Ibihe byo Kwibutsa'}</Label>
                  {formReminderTimes.map((time, index) => (
                    <div key={index} className="flex gap-2 mt-1.5">
                      <Input type="time" value={time} onChange={(e) => handleTimeChange(index, e.target.value)} />
                      {formReminderTimes.length > 1 && (
                        <Button variant="outline" size="icon" onClick={() => removeTimeField(index)}><Trash2 className="h-4 w-4" /></Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="mt-2 w-full" onClick={addTimeField}><Plus className="h-4 w-4 mr-2" />Add Time</Button>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild><Button variant="outline">{language === 'en' ? 'Cancel' : 'Hagarika'}</Button></DialogClose>
              <Button onClick={handleEdit}>{language === 'en' ? 'Save Changes' : 'Bika Impinduka'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-heading">{language === 'en' ? 'Delete Prescription' : 'Siba Imiti'}</DialogTitle></DialogHeader>
            <p className="text-muted-foreground">{language === 'en' ? `Delete prescription for "${selected?.patient?.name} - ${selected?.medication}"?` : `Siba imiti ya "${selected?.patient?.name} - ${selected?.medication}"?`}</p>
            <DialogFooter className="mt-4">
              <DialogClose asChild><Button variant="outline">{language === 'en' ? 'Cancel' : 'Hagarika'}</Button></DialogClose>
              <Button variant="destructive" onClick={handleDelete}>{language === 'en' ? 'Delete' : 'Siba'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
