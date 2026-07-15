import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { LayoutDashboard, Pill, Bell, History, Target, MessageSquare, Calendar, Plus, Loader2 } from 'lucide-react';
import { useHealthGoals } from '@/hooks/use-api';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function PatientGoals() {
  const { user, t, language } = useAuth();
  const { data: goals = [], isLoading, refetch } = useHealthGoals(user?.id);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formType, setFormType] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');

  const handleCreate = async () => {
    if (!formType || !formTarget || !formStartDate) {
      toast.error(language === 'en' ? 'Please fill in all required fields' : 'Wuzuza imyanya yose ikenewe');
      return;
    }

    if (!user?.id) {
      toast.error(language === 'en' ? 'Unable to identify patient' : 'Ntabashije kumenya umurwayi');
      return;
    }

    setLoading(true);
    try {
      await api.healthGoals.create({
        patientId: user.id,
        type: formType,
        targetValue: formTarget,
        startDate: formStartDate,
        endDate: formEndDate || undefined,
        status: 'in_progress',
      });
      toast.success(language === 'en' ? 'Goal set successfully' : 'Intego yashyizweho neza');
      setOpen(false);
      refetch();
      setFormType('');
      setFormTarget('');
      setFormStartDate('');
      setFormEndDate('');
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to set goal' : 'Ntabashije gushyiraho intego');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">{language === 'en' ? 'Health Goals' : 'Intego z\'Ubuzima'}</h1>
            <p className="text-muted-foreground">{language === 'en' ? 'Track your hypertension management targets' : 'Kurikirana intego zawe zo gucunga umuvuduko w\'amaraso'}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {language === 'en' ? 'Set New Goal' : 'Shyiraho Intego nshya'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === 'en' ? 'Set New Health Goal' : 'Shyiraho Intego nshya y\'Ubuzima'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Goal Type' : 'Ubwoko bw\'intego'}</Label>
                  <Input
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    placeholder={language === 'en' ? 'e.g., Blood Pressure' : 'nko: Umuvuduko w\'amaraso'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Target Value' : 'Icyo wifuza kugeraho'}</Label>
                  <Input
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    placeholder={language === 'en' ? 'e.g., 130/80 mmHg' : 'nko: 130/80 mmHg'}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Start Date' : 'Itariki yo gutangira'}</Label>
                    <Input type="date" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Target Date' : 'Itariki yo kubigeraho'}</Label>
                    <Input type="date" value={formEndDate} onChange={(e) => setFormEndDate(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setOpen(false)}>{language === 'en' ? 'Cancel' : 'Reka'}</Button>
                <Button onClick={handleCreate} disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {language === 'en' ? 'Set Goal' : 'Shyiraho Intego'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">Loading goals...</div>
        ) : (
          <div className="grid gap-6">
            {goals.length > 0 ? (
              goals.map((goal: any) => (
                <Card key={goal.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-heading flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        {goal.type}
                      </CardTitle>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        goal.status === 'achieved' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
                      }`}>
                        {goal.status.replace('_', ' ')}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress to {goal.targetValue}</span>
                        <span className="font-medium">{goal.currentValue || 'N/A'}</span>
                      </div>
                      <Progress value={goal.status === 'achieved' ? 100 : 45} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Started: {new Date(goal.startDate).toLocaleDateString()}</span>
                        {goal.endDate && <span>Target: {new Date(goal.endDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-12 text-center border-2 border-dashed rounded-xl">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">{language === 'en' ? 'No goals set yet' : 'Nta ntego zashyizweho'}</h3>
                <p className="text-muted-foreground mb-6">{language === 'en' ? 'Work with your healthcare provider to set health targets.' : 'Fatanya n\'umuganga w\'ubuzima rusange wawe gushyiraho intego z\'ubuzima.'}</p>
                <Button variant="outline">{language === 'en' ? 'Learn More' : 'Menya byinshi'}</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
