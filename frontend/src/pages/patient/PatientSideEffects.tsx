import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Pill, Bell, History, Target, MessageSquare, Calendar, AlertTriangle, Plus, Loader2 } from 'lucide-react';
import { useSideEffects } from '@/hooks/use-api';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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

export default function PatientSideEffects() {
  const { user, language } = useAuth();
  const { data: sideEffects = [], isLoading, refetch } = useSideEffects(user?.id);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formEffect, setFormEffect] = useState('');
  const [formSeverity, setFormSeverity] = useState('low');
  const [formStartDate, setFormStartDate] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const handleSubmit = async () => {
    if (!formEffect || !formSeverity || !formStartDate) {
      toast.error('Effect, severity, and start date are required');
      return;
    }

    setLoading(true);
    try {
      await api.sideEffects.create({
        patientId: user?.id,
        effect: formEffect,
        severity: formSeverity,
        startDate: formStartDate,
        notes: formNotes,
      });
      toast.success(language === 'en' ? 'Side effect reported' : 'Ingaruka mbi yemejwe');
      setOpen(false);
      setFormEffect('');
      setFormSeverity('low');
      setFormStartDate('');
      setFormNotes('');
      refetch();
    } catch (error) {
      toast.error('Failed to report side effect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">{language === 'en' ? 'Report Side Effects' : 'Ingaruka mbi z\'Imiti'}</h1>
            <p className="text-muted-foreground">{language === 'en' ? 'Tell us how you are feeling after your medication' : 'Tubwire uko wumva umeze nyuma yo gufata imiti'}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {language === 'en' ? 'Report Side Effect' : 'Tangaza Ingaruka'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === 'en' ? 'Report Side Effect' : 'Tangaza Ingaruka'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Effect Description' : 'Ibisobanuro by\'Ingaruka'}</Label>
                  <Input value={formEffect} onChange={(e) => setFormEffect(e.target.value)} placeholder="e.g., Headache, Dizziness" />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Severity' : 'Ubukana'}</Label>
                  <Select value={formSeverity} onValueChange={setFormSeverity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'When did it start?' : 'Iyo byaratangira ryari?'}</Label>
                  <Input 
                    type="date" 
                    value={formStartDate} 
                    onChange={(e) => setFormStartDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Notes' : 'Ibindi'}</Label>
                  <Textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Additional information about the side effect..." />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setOpen(false)}>{language === 'en' ? 'Cancel' : 'Reka'}</Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {language === 'en' ? 'Submit' : 'Ohereza'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">Loading reports...</div>
        ) : (
          <div className="grid gap-4">
            {sideEffects.length > 0 ? (
              sideEffects.map((se: any) => (
                <Card key={se.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${
                        se.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                        se.severity === 'medium' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                      }`}>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-bold">{se.effect}</h3>
                          <span className="text-xs text-muted-foreground">Started: {new Date(se.startDate).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{se.notes}</p>
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded border ${
                            se.severity === 'high' ? 'border-destructive text-destructive' :
                            se.severity === 'medium' ? 'border-warning text-warning' : 'border-primary text-primary'
                          }`}>
                            Severity: {se.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-12 text-center border-2 border-dashed rounded-xl">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">{language === 'en' ? 'No side effects reported' : 'Nta ngaruka mbi zatangajwe'}</h3>
                <p className="text-muted-foreground">{language === 'en' ? 'If you feel unwell, please report any side effects here.' : 'Niba wumva utameze neza, tangaza ingaruka zaba zikomoka ku muti hano.'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
