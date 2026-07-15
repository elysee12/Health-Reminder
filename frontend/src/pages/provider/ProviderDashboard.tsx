import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import { usePatients, usePrescriptions, useReminders, useAdherenceRecords, useAppointments, useFollowUps } from '@/hooks/use-api';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, XCircle, AlertTriangle, Clock, TrendingUp, TrendingDown,
  Activity, ArrowRight, Pill, Bell, BarChart3, ChevronRight, Calendar, Stethoscope,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area,
} from 'recharts';

/* ── Reusable stat card ─────────────────────────────────────────── */
function StatCard({
  label, value, sub, icon: Icon, gradient, trend, delay = 0,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; gradient: string; trend?: 'up' | 'down' | 'neutral'; delay?: number;
}) {
  return (
    <div className="stat-card dash-in group cursor-default" style={{ animationDelay: `${delay}ms` }}>
      <div className={`absolute inset-x-0 top-0 h-0.5 rounded-t-2xl ${gradient}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
          <p className="text-3xl font-extrabold font-heading text-slate-900 leading-none">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1.5 font-medium">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${gradient} bg-opacity-10`}
          style={{ background: 'transparent' }}>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${gradient.replace('bg-gradient-to-r', 'bg-gradient-to-br')} opacity-15 absolute`} />
          <Icon className="h-5 w-5 relative z-10 text-slate-600" />
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-semibold ${
          trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400'
        }`}>
          {trend === 'up' ? <TrendingUp className="h-3.5 w-3.5" /> : trend === 'down' ? <TrendingDown className="h-3.5 w-3.5" /> : null}
          <span>{trend === 'up' ? '+12% this week' : trend === 'down' ? '-5% this week' : 'No change'}</span>
        </div>
      )}
    </div>
  );
}

/* ── Custom tooltip for charts ──────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-bold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-500 capitalize">{p.name}:</span>
          <span className="font-bold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function ProviderDashboard() {
  const { user, t, language } = useAuth();
  const navigate = useNavigate();

  const { data: patients = [],         isLoading: pL } = usePatients(user?.id);
  const { data: prescriptions = [],    isLoading: rxL } = usePrescriptions(user?.id);
  const { data: reminders = [],        isLoading: remL } = useReminders(user?.id);
  const { data: adherenceRecords = [], isLoading: adhL } = useAdherenceRecords(user?.id);
  const { data: appointments = [],     isLoading: apptL } = useAppointments(undefined, undefined, user?.id);
  const { data: followUps = [],        isLoading: fuL } = useFollowUps(undefined, user?.id);

  const activeRx        = prescriptions.filter((p: any) => p.status === 'active');
  const highRisk        = patients.filter((p: any) => p.adherenceRate < 70);

  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(d => ({ day: d, taken: 0, missed: 0 }));
    adherenceRecords.forEach((r: any) => {
      const d = days[new Date(r.scheduledTime).getDay()];
      const row = data.find(x => x.day === d);
      if (row) { if (r.status === 'taken') row.taken++; else if (r.status === 'missed') row.missed++; }
    });
    return data;
  }, [adherenceRecords]);

  const adherenceTrend = useMemo(() => {
    return weeklyData.map(d => ({
      day: d.day,
      rate: d.taken + d.missed > 0 ? Math.round((d.taken / (d.taken + d.missed)) * 100) : 0,
    }));
  }, [weeklyData]);

  if (pL || rxL || remL || adhL || apptL || fuL) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500 font-medium">{t('loading')}</p>
        </div>
      </div>
    </DashboardLayout>
  );

  const greeting = new Date().getHours() < 12 ? t('good_morning') : new Date().getHours() < 17 ? t('good_afternoon') : t('good_evening');

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">

        {/* ── Page header ─────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">{greeting}</p>
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('welcome')}, {user?.name?.split(' ').pop()}
              <span className="text-emerald-500">.</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">{t('provider_dashboard_subtitle')}</p>
          </div>
          
          {/* Hospital Information Card */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Date Card */}
            <div className="hidden md:flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
              <Activity className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-semibold text-slate-600">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            
            {/* Hospital Badge */}
            {user?.hospital && (
              <div className="flex items-center gap-3 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl px-4 py-2.5 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm shrink-0">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 leading-none">
                    {language === 'en' ? 'Assigned Hospital' : 'Ibitaro Washinzwe'}
                  </p>
                  <p className="text-sm font-extrabold text-slate-900 mt-1 leading-tight truncate">
                    {user.hospital.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Stat cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label={t('patients')}      value={patients.length}         icon={Users}         gradient="bg-gradient-to-r from-blue-500 to-cyan-500"    trend="up"      delay={0}   sub={`${activeRx.length} active Rx`} />
          <StatCard label="Total Appointments" value={appointments.length}     icon={Calendar}      gradient="bg-gradient-to-r from-amber-400 to-orange-500"  trend="neutral" delay={80}  sub="Scheduled for your patients" />
          <StatCard label="Total Follow-ups"   value={followUps.length}         icon={Stethoscope}   gradient="bg-gradient-to-r from-red-400 to-rose-500"      trend="down"    delay={160} sub="Active follow-up plans" />
          <StatCard label={t('high_risk')}     value={highRisk.length}         icon={AlertTriangle} gradient="bg-gradient-to-r from-violet-500 to-purple-600" trend="neutral" delay={240} sub={t('below_70_adherence')} />
        </div>

        {/* ── Charts row ──────────────────────────────────────── */}
        <div className="grid lg:grid-cols-5 gap-5">

          {/* Weekly adherence bar chart */}
          <div className="lg:col-span-3 dash-card">
            <div className="dash-card-header">
              <h3 className="dash-card-title">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                {t('weekly_adherence')}
              </h3>
              <span className="text-xs text-slate-400 font-medium">{t('last_7_days')}</span>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData} barGap={4} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                  <Bar dataKey="taken"  fill="#10b981" radius={[6, 6, 0, 0]} name={t('taken_label')} />
                  <Bar dataKey="missed" fill="#f87171" radius={[6, 6, 0, 0]} name={t('missed_label')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Adherence trend area chart */}
          <div className="lg:col-span-2 dash-card">
            <div className="dash-card-header">
              <h3 className="dash-card-title">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                {t('adherence_trend')}
              </h3>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={adherenceTrend}>
                  <defs>
                    <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2.5} fill="url(#aGrad)" name={t('adherence')} dot={{ fill: '#10b981', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── High-risk + Patient table ────────────────────────── */}
        <div className="grid lg:grid-cols-5 gap-5">

          {/* High-risk patients */}
          <div className="lg:col-span-2 dash-card">
            <div className="dash-card-header">
              <h3 className="dash-card-title">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                {t('high_risk_patients')}
              </h3>
              <span className="badge-warning">{highRisk.length} {t('patients_label')}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {highRisk.length > 0 ? highRisk.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                      {p.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{p.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{t('bp')}: {p.bloodPressure || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-extrabold font-heading ${p.adherenceRate < 50 ? 'text-red-500' : 'text-amber-500'}`}>
                      {p.adherenceRate}%
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">{t('adherence')}</p>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                    <AlertTriangle className="h-5 w-5 text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium">{t('no_high_risk_found')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Patient table */}
          <div className="lg:col-span-3 dash-card">
            <div className="dash-card-header">
              <h3 className="dash-card-title">
                <Users className="h-4 w-4 text-blue-500" />
                {t('hypertension_patients')}
              </h3>
              <button onClick={() => navigate('/provider/patients')}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                {t('view_all')} <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full dash-table">
                <thead>
                  <tr>
                    <th>{t('patient_name')}</th>
                    <th>{t('age_gender')}</th>
                    <th>{t('bp')}</th>
                    <th>{t('adherence')}</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.slice(0, 6).map((p: any) => (
                    <tr key={p.id} className="cursor-pointer" onClick={() => navigate('/provider/patients')}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-xs font-bold text-emerald-700 shrink-0">
                            {p.name?.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-800">{p.name}</span>
                        </div>
                      </td>
                      <td className="text-slate-500">{p.age} / {p.gender}</td>
                      <td>
                        <span className="font-semibold text-slate-800">{p.bloodPressure || 'N/A'}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[60px]">
                            <div className={`h-full rounded-full transition-all ${
                              p.adherenceRate > 80 ? 'bg-emerald-500' : p.adherenceRate > 60 ? 'bg-amber-400' : 'bg-red-400'
                            }`} style={{ width: `${p.adherenceRate}%` }} />
                          </div>
                          <span className={`text-xs font-bold w-9 text-right ${
                            p.adherenceRate > 80 ? 'text-emerald-600' : p.adherenceRate > 60 ? 'text-amber-600' : 'text-red-500'
                          }`}>{p.adherenceRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {patients.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-10 text-slate-400 italic">{t('no_patients_found')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Quick actions ────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t('patients'),      icon: Users,         path: '/provider/patients',      color: 'from-blue-500 to-cyan-500' },
            { label: t('prescriptions'), icon: Pill,          path: '/provider/prescriptions', color: 'from-emerald-500 to-teal-500' },
            { label: t('reminders'),     icon: Bell,          path: '/provider/reminders',     color: 'from-amber-400 to-orange-500' },
            { label: t('analytics'),     icon: BarChart3,     path: '/provider/analytics',     color: 'from-violet-500 to-purple-600' },
          ].map(({ label, icon: Icon, path, color }) => (
            <button key={path} onClick={() => navigate(path)}
              className="group flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-sm`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 ml-auto transition-colors" />
            </button>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
}
