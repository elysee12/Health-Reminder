import { useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { usePatients, useAdherenceRecords } from '@/hooks/use-api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Users, Pill, Bell, BarChart3, MessageSquare, Target, Calendar, UserCheck, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';



const COLORS = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

export default function ProviderAnalytics() {
  const { t, user, language } = useAuth();
  const { data: patients = [], isLoading: patientsLoading } = usePatients(user?.id);
  const { data: adherenceRecords = [], isLoading: adherenceLoading } = useAdherenceRecords(user?.id);

  const weeklyAdherenceData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map((day) => ({ day, taken: 0, missed: 0 }));

    adherenceRecords.forEach((record: any) => {
      const date = new Date(record.scheduledTime);
      const dayName = days[date.getDay()];
      const row = data.find((d) => d.day === dayName);
      if (!row) return;
      if (record.status === 'taken') row.taken += 1;
      else if (record.status === 'missed') row.missed += 1;
    });

    return data;
  }, [adherenceRecords]);

  const adherenceGroups = useMemo(() => [
    { name: 'Good (≥80%)', value: patients.filter((p: any) => p.adherenceRate >= 80).length },
    { name: 'Moderate (60-79%)', value: patients.filter((p: any) => p.adherenceRate >= 60 && p.adherenceRate < 80).length },
    { name: 'Low (<60%)', value: patients.filter((p: any) => p.adherenceRate < 60).length },
  ], [patients]);

  if (patientsLoading || adherenceLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">Loading analytics...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <h1 className="page-header">Adherence {t('reports')}</h1>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="font-heading">Weekly Adherence Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyAdherenceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="taken" fill="hsl(var(--success))" radius={[4,4,0,0]} />
                  <Bar dataKey="missed" fill="hsl(var(--destructive))" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-heading">Patient Adherence Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={adherenceGroups} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                    {adherenceGroups.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="font-heading">Patient Adherence Rates</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patients.sort((a, b) => a.adherenceRate - b.adherenceRate).map((p) => (
                <div key={p.id} className="flex items-center gap-4">
                  <div className="w-36 font-medium text-card-foreground truncate">{p.name}</div>
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${p.adherenceRate >= 80 ? 'bg-success' : p.adherenceRate >= 60 ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${p.adherenceRate}%` }} />
                  </div>
                  <div className="w-12 text-right font-semibold text-muted-foreground">{p.adherenceRate}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
