import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, MessageSquare, AlertTriangle, Search, Filter, CheckCircle } from 'lucide-react';
import { useSideEffects } from '@/hooks/use-api';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function ProviderSideEffects() {
  const { language, user } = useAuth();
  const providerId = user?.id ? Number(user.id) : undefined;
  const { data: allSideEffects = [], isLoading, refetch } = useSideEffects(undefined, providerId);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredEffects = useMemo(() => {
    return allSideEffects.filter((se: any) => {
      const matchesSearch = se.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
        se.effect?.toLowerCase().includes(search.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || se.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [allSideEffects, search, severityFilter]);

  const removeReport = async (id: number) => {
    if (!confirm('Are you sure you want to dismiss this report?')) return;
    try {
      await api.sideEffects.remove(id);
      toast.success(language === 'en' ? 'Report dismissed' : 'Raporo yakuritswe');
      refetch();
    } catch (error: any) {
      toast.error(language === 'en' ? 'Failed to dismiss report' : 'Ntabwo byashobotse gukuraho raporo');
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="page-header">{language === 'en' ? 'Medication Side Effects' : 'Ingaruka mbi z\'Imiti'}</h1>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Review side effects reported by patients'
              : 'Gusuzuma ingaruka mbi zatangajwe n\'abarwayi'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'en' ? 'Search by patient or effect...' : 'Shakisha umurwayi cyangwa ingaruka...'}
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={language === 'en' ? 'Severity' : 'Ubukana'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'en' ? 'All Severities' : 'Ubukana bwose'}</SelectItem>
              <SelectItem value="high">{language === 'en' ? 'High Severity' : 'Ubukana bwinshi'}</SelectItem>
              <SelectItem value="medium">{language === 'en' ? 'Medium Severity' : 'Ubukana hagati'}</SelectItem>
              <SelectItem value="low">{language === 'en' ? 'Low Severity' : 'Ubukana buke'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">{language === 'en' ? 'Loading reports...' : 'Gukurura raporo...'}</div>
        ) : (
          <div className="grid gap-4">
            {filteredEffects.length > 0 ? (
              filteredEffects.map((se: any) => (
                <Card key={se.id} className={se.severity === 'high' ? 'border-destructive/50' : ''}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex-1 flex gap-4">
                        <div className={`mt-1 p-2 rounded-full h-fit ${
                          se.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                          se.severity === 'medium' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'
                        }`}>
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg">{se.patient.name}</h3>
                            <span className="text-xs uppercase tracking-wide text-muted-foreground">{se.patient.phone}</span>
                          </div>
                          <div className="text-foreground font-medium flex items-center gap-2">
                            <span className="font-semibold">Effect:</span> {se.effect}
                          </div>
                          {se.prescription && (
                            <div className="text-sm text-primary flex items-center gap-2">
                              <Pill className="h-3.5 w-3.5" />
                              {se.prescription.medication} ({se.prescription.dosage})
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-dashed italic">
                            {se.notes || (language === 'en' ? 'No additional notes provided' : 'Nta notes zindi zatangajwe')}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between items-end gap-4 min-w-[150px]">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">{language === 'en' ? 'Reported On' : 'Byatangajwe ku'}</div>
                          <div className="text-sm font-medium">{new Date(se.reportedDate).toLocaleDateString()}</div>
                          <div className="text-[10px] text-muted-foreground">{new Date(se.reportedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => window.location.href = `/provider/sms?patient=${se.patient.id}`}>
                            <MessageSquare className="h-3.5 w-3.5" />
                            {language === 'en' ? 'Message' : 'Ohereza SMS'}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-success" onClick={() => removeReport(se.id)}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            {language === 'en' ? 'Resolve' : 'Kurangiza'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-12 text-center border-2 border-dashed rounded-xl">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium">{language === 'en' ? 'No reports to review' : 'Nta raporo yo gusuzuma'}</h3>
                <p className="text-muted-foreground">{language === 'en' ? 'Great! No active side effects reported by patients.' : 'Ni byiza! Nta ngaruka mbi zagaragajwe na barwayi.'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
