import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Plus, Loader2, Search } from 'lucide-react';
import { useHealthGoals, usePatients } from '@/hooks/use-api';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';



export default function ProviderGoals() {
  const { language, user } = useAuth();
  const { data: allGoals = [], isLoading: goalsLoading, refetch } = useHealthGoals(undefined, user?.id);
  const { data: patients = [] } = usePatients(user?.id);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formPatient, setFormPatient] = useState('');
  const [formType, setFormType] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');

  const filteredGoals = useMemo(() => {
    return allGoals.filter((g: any) => {
      const matchesSearch = g.patient?.name?.toLowerCase().includes(search.toLowerCase()) || 
                           g.type.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || g.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allGoals, search, statusFilter]);

  const handleCreate = async () => {
    if (!formPatient || !formType || !formTarget || !formStartDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.healthGoals.create({
        patientId: +formPatient,
        type: formType,
        targetValue: formTarget,
        startDate: formStartDate,
        endDate: formEndDate || undefined,
        status: 'in_progress',
      });
      toast.success(language === 'en' ? 'Goal set successfully' : 'Intego yashyizweho neza');
      setOpen(false);
      refetch();
      // Reset form
      setFormPatient(''); setFormType(''); setFormTarget(''); setFormStartDate(''); setFormEndDate('');
    } catch (error) {
      toast.error('Failed to set goal');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.healthGoals.update(id, { status });
      toast.success('Status updated');
      refetch();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">{language === 'en' ? 'Patient Health Goals' : 'Intego z\'Abarwayi'}</h1>
            <p className="text-muted-foreground">{language === 'en' ? 'Monitor and set clinical targets for your patients' : 'Gukurikirana no gushyiraho intego z\'ubuvuzi ku barwayi bawe'}</p>
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
                <DialogTitle>{language === 'en' ? 'Set Patient Health Goal' : 'Shyiraho Intego y\'Umurwayi'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Select Patient' : 'Hitamo Umurwayi'}</Label>
                  <Select value={formPatient} onValueChange={setFormPatient}>
                    <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                    <SelectContent>
                      {patients.map((p: any) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Goal Type' : 'Ubwoko bw\'intego'}</Label>
                  <Input value={formType} onChange={(e) => setFormType(e.target.value)} placeholder="e.g., Blood Pressure, Weight" />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'en' ? 'Target Value' : 'Icyo wifuza kugeraho'}</Label>
                  <Input value={formTarget} onChange={(e) => setFormTarget(e.target.value)} placeholder="e.g., < 130/80 mmHg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Start Date' : 'Itariki itangiriraho'}</Label>
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

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={language === 'en' ? "Search by patient or goal..." : "Shakisha umurwayi cyangwa intego..."} 
              className="pl-10" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="achieved">Achieved</SelectItem>
              <SelectItem value="not_achieved">Not Achieved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {goalsLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading goals data...</div>
        ) : (
          <div className="grid gap-4">
            {filteredGoals.length > 0 ? (
              filteredGoals.map((goal: any) => (
                <Card key={goal.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg">{goal.patient.name}</h3>
                              <Badge variant={goal.status === 'achieved' ? 'success' : 'outline'} className="capitalize">
                                {goal.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-primary font-medium">
                              <Target className="h-4 w-4" />
                              {goal.type}: {goal.targetValue}
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <div>Started: {new Date(goal.startDate).toLocaleDateString()}</div>
                            {goal.endDate && <div>Target: {new Date(goal.endDate).toLocaleDateString()}</div>}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Current Status</span>
                            <span className="font-bold">{goal.currentValue || 'No data yet'}</span>
                          </div>
                          <Progress value={goal.status === 'achieved' ? 100 : 45} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="flex md:flex-col justify-end gap-2">
                        {goal.status === 'in_progress' && (
                          <>
                            <Button size="sm" variant="outline" className="text-success border-success hover:bg-success/10" onClick={() => updateStatus(goal.id, 'achieved')}>
                              Mark Achieved
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => updateStatus(goal.id, 'not_achieved')}>
                              Mark Failed
                            </Button>
                          </>
                        )}
                        {goal.status !== 'in_progress' && (
                          <Button size="sm" variant="ghost" onClick={() => updateStatus(goal.id, 'in_progress')}>
                            Re-open Goal
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-12 text-center border-2 border-dashed rounded-xl">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No matching goals found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
