import { useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import {
  useReminders, usePrescriptions, useAdherenceRecords,
  useHealthGoals, useAppointments,
} from '@/hooks/use-api';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, XCircle, Clock, Pill, Target, Calendar,
  AlertTriangle, ChevronRight, TrendingUp, Bell,
  Heart, Activity, Zap, Building2,
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
  XAxis, YAxis, CartesianGrid,
} from 'recharts';

/* ─────────────────────────────────────────────────────────────────
   ADHERENCE RING
───────────────────────────────────────────────────────────────── */
function AdherenceRing({ pct }: { pct: number }) {
  const r    = 44;
  const sw   = 9;
  const size = (r + sw) * 2 + 4;
  const cx   = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const col  = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
  const bg   = pct >= 80 ? '#d1fae5' : pct >= 60 ? '#fef3c7' : '#fee2e2';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={bg}  strokeWidth={sw} />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={col} strokeWidth={sw}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)' }} />
      <text x={cx} y={cx - 5}  textAnchor="middle" fontSize="20" fontWeight="800"
        fill={col} fontFamily="Plus Jakarta Sans, sans-serif">{pct}%</text>
      <text x={cx} y={cx + 11} textAnchor="middle" fontSize="9"  fontWeight="600"
        fill="#94a3b8" fontFamily="Inter, sans-serif" letterSpacing="1">ADHERENCE</text>
    </svg>
  );
}

/* ═══════════════════════════ MAIN COMPONENT ═══════════════════════ */
export default function PatientDashboard() {
  const { user, t, language } = useAuth();
  const navigate = useNavigate();

  const { data: allReminders = [],        isLoading: remL, refetch } = useReminders();
  const { data: allPrescriptions = [],    isLoading: rxL  }          = usePrescriptions();
  const { data: allAdherenceRecords = [], isLoading: adhL }          = useAdherenceRecords();
  const { data: goals = [] }                                          = useHealthGoals(user?.id);
  const { data: appointments = [] }                                   = useAppointments(user?.id);

  const [expandedRx, setExpandedRx] = useState<Record<number, boolean>>({});

  const patientReminders = useMemo(() =>
    allReminders.filter((r: any) => r.patientId === user?.id || r.patient?.userId === user?.id),
    [allReminders, user]);

  const activeRx = useMemo(() =>
    allPrescriptions.filter((p: any) =>
      (p.patientId === user?.id || p.patient?.userId === user?.id) && p.status === 'active'),
    [allPrescriptions, user]);

  const rxWithReminders = useMemo(() =>
    activeRx.map((rx: any) => ({
      ...rx,
      reminders: patientReminders.filter((r: any) => r.prescriptionId === rx.id),
    })), [activeRx, patientReminders]);

  const takenCount   = patientReminders.filter((r: any) => r.status === 'taken').length;
  const missedCount  = patientReminders.filter((r: any) => r.status === 'missed').length;
  const pendingCount = patientReminders.filter((r: any) => r.status === 'pending').length;
  const adherencePct = takenCount + missedCount > 0
    ? Math.round((takenCount / (takenCount + missedCount)) * 100) : 87;

  const pendingGoals = goals.filter((g: any) => g.status === 'in_progress');
  const upcoming     = appointments.filter((a: any) =>
    new Date(a.dateTime) > new Date() && a.status !== 'cancelled');
  const emergency    = upcoming.filter((a: any) => a.type === 'emergency');
  const nextAppt     = upcoming[0];

  const weeklyTrend = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => {
      const recs  = allAdherenceRecords.filter((r: any) =>
        days[new Date(r.scheduledTime).getDay()] === day);
      const taken = recs.filter((r: any) => r.status === 'taken').length;
      return { day, rate: recs.length > 0 ? Math.round((taken / recs.length) * 100) : 0 };
    });
  }, [allAdherenceRecords]);

  const confirmMed = async (id: string) => {
    try {
      await api.reminders.update(id, { status: 'taken' });
      toast.success(t('medication_marked_taken'));
      refetch();
    } catch { toast.error(t('failed_to_update')); }
  };

  if (remL || rxL || adhL) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <Heart className="absolute inset-0 m-auto h-5 w-5 text-emerald-500" />
        </div>
        <p className="text-sm text-slate-500 font-semibold">{t('loading')}</p>
      </div>
    </DashboardLayout>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? '🌅 Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌙 Good evening';
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <DashboardLayout>
      {/* Single column, full-width on mobile. Max-width constrained on desktop. */}
      <div className="w-full max-w-lg mx-auto lg:max-w-none space-y-4">

        {/* ══════════════════════════════════════════════
            HERO BANNER
        ══════════════════════════════════════════════ */}
        <div className="relative rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(145deg,hsl(168 55% 12%) 0%,hsl(168 50% 19%) 55%,hsl(180 44% 25%) 100%)' }}>

          {/* decorative blobs */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-teal-300/10 blur-2xl pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.035]"
            style={{ backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '22px 22px' }} />

          {/* top row: greeting + ring */}
          <div className="relative z-10 flex items-center justify-between px-5 pt-6 pb-4 gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-emerald-300 text-[11px] font-bold tracking-widest uppercase mb-1">{greeting}</p>
              <h1 className="font-heading text-[26px] font-extrabold text-white leading-tight tracking-tight truncate">
                {firstName}<span className="text-emerald-400">.</span>
              </h1>
              <p className="text-white/55 text-sm mt-1 leading-snug">{t('today_bp_meds')}</p>
              <div className="inline-flex items-center gap-1.5 mt-3 bg-white/10 rounded-full px-3 py-1.5">
                <Activity className="h-3 w-3 text-emerald-300" />
                <span className="text-white/75 text-[11px] font-semibold">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
            <div className="shrink-0">
              <AdherenceRing pct={adherencePct} />
            </div>
          </div>

          {/* bottom strip: taken / pending / missed */}
          <div className="relative z-10 grid grid-cols-3 divide-x divide-white/10 border-t border-white/10">
            {[
              { label: 'Taken',   value: takenCount,   color: 'text-emerald-300' },
              { label: 'Pending', value: pendingCount, color: 'text-amber-300'   },
              { label: 'Missed',  value: missedCount,  color: 'text-red-300'     },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col items-center py-3">
                <span className={`text-2xl font-extrabold font-heading leading-none ${color}`}>{value}</span>
                <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-0.5">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            EMERGENCY ALERT
        ══════════════════════════════════════════════ */}
        {emergency.length > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-red-700 text-sm">{t('upcoming_emergency')}</p>
              <p className="text-xs text-red-500 mt-0.5 truncate">
                {new Date(emergency[0].dateTime).toLocaleString()} · {emergency[0].hospital?.name}
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            QUICK NAV ROW  — 4 clean text links
        ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Pill,     label: t('prescriptions'), path: '/patient/prescriptions', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
            { icon: Bell,     label: t('reminders'),     path: '/patient/reminders',     color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200',   badge: pendingCount },
            { icon: Target,   label: 'Goals',            path: '/patient/goals',         color: 'text-violet-600',  bg: 'bg-violet-50 border-violet-200'  },
            { icon: Calendar, label: 'Visits',           path: '/patient/appointments',  color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200',     badge: upcoming.length },
          ].map(({ icon: Icon, label, path, color, bg, badge }) => (
            <button key={path} onClick={() => navigate(path)}
              className={`relative flex flex-col items-center gap-1.5 py-3.5 rounded-2xl border ${bg} active:scale-95 transition-transform`}>
              <Icon className={`h-5 w-5 ${color}`} />
              <span className={`text-[10px] font-bold ${color} leading-none`}>{label}</span>
              {!!badge && badge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════
            MEDICATION SCHEDULE
        ══════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <span className="font-heading font-bold text-slate-800 text-base">{t('medication_schedule')}</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              {activeRx.length} active
            </span>
          </div>

          {/* list */}
          <div className="divide-y divide-slate-50">
            {rxWithReminders.length > 0 ? rxWithReminders.map((rx: any) => (
              <div key={rx.id}>
                {/* prescription row — full-width tap */}
                <button
                  className="w-full flex items-center justify-between px-4 py-4 bg-slate-50/60 active:bg-slate-100 transition-colors text-left"
                  onClick={() => setExpandedRx(p => ({ ...p, [rx.id]: !p[rx.id] }))}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-sm">
                      <Pill className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{t(rx.medication)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{t(rx.dosage)} · {t(rx.frequency)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs font-bold bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                      {rx.reminders.length}
                    </span>
                    <div className={`transition-transform duration-200 ${expandedRx[rx.id] ? 'rotate-90' : ''}`}>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </button>

                {/* reminder rows */}
                {expandedRx[rx.id] && (
                  <div className="bg-white divide-y divide-slate-50">
                    {rx.reminders.length > 0 ? rx.reminders.map((rem: any) => (
                      <div key={rem.id} className="flex items-center justify-between px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            rem.status === 'taken'  ? 'bg-emerald-500' :
                            rem.status === 'missed' ? 'bg-red-400'     : 'bg-amber-400 animate-pulse'
                          }`} />
                          <div>
                            <p className="text-sm font-bold font-mono text-slate-800">
                              {new Date(rem.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{t(rem.type)}</p>
                          </div>
                        </div>
                        {rem.status === 'pending' ? (
                          <button
                            onClick={e => { e.stopPropagation(); confirmMed(rem.id); }}
                            className="flex items-center gap-1.5 text-xs font-bold text-white
                                       bg-gradient-to-r from-emerald-500 to-teal-500
                                       px-4 py-2 rounded-xl shadow-sm active:scale-95 transition-transform">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {t('take_now')}
                          </button>
                        ) : (
                          <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl ${
                            rem.status === 'taken'
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                              : 'text-red-600 bg-red-50 border border-red-200'
                          }`}>
                            {rem.status === 'taken' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                            {t(rem.status).toUpperCase()}
                          </span>
                        )}
                      </div>
                    )) : (
                      <p className="text-xs text-slate-400 italic px-4 py-4 text-center">{t('no_reminders')}</p>
                    )}
                  </div>
                )}
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <div className="w-14 h-14 rounded-3xl bg-slate-100 flex items-center justify-center mb-3">
                  <Pill className="h-6 w-6 text-slate-300" />
                </div>
                <p className="text-sm font-semibold">{t('no_active_prescriptions')}</p>
                <p className="text-xs text-slate-300 mt-1">Your medications will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            WEEKLY TREND CHART
        ══════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="font-heading font-bold text-slate-800 text-base">Weekly Trend</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              adherencePct >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
              adherencePct >= 60 ? 'text-amber-700 bg-amber-50 border-amber-200' :
                                   'text-red-700 bg-red-50 border-red-200'
            }`}>{adherencePct}% avg</span>
          </div>
          <div className="px-2 pb-4 pt-3">
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={weeklyTrend} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                <Tooltip
                  formatter={(v: any) => [`${v}%`, 'Adherence']}
                  contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2.5}
                  fill="url(#wGrad)"
                  dot={{ fill: '#8b5cf6', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            NEXT APPOINTMENT
        ══════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <span className="font-heading font-bold text-slate-800 text-base">{t('next_visit')}</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {nextAppt ? (
              <div className="rounded-2xl overflow-hidden border border-blue-100">
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <div className="p-4 bg-gradient-to-br from-blue-50/60 to-cyan-50/40 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-blue-900 text-sm truncate">{nextAppt.hospital?.name}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-blue-600 font-medium">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      {new Date(nextAppt.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' · '}
                      {new Date(nextAppt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                      {nextAppt.type}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5 text-slate-300" />
                </div>
                <p className="text-xs font-semibold">No upcoming appointments</p>
              </div>
            )}
            <button
              onClick={() => navigate('/patient/appointments')}
              className="w-full flex items-center justify-center gap-2 text-sm font-bold text-white
                         bg-gradient-to-r from-blue-500 to-cyan-500
                         py-3.5 rounded-2xl shadow-sm active:scale-95 transition-transform">
              <Bell className="h-4 w-4" />
              Book Appointment
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            ACTIVE GOALS
        ══════════════════════════════════════════════ */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Target className="h-4 w-4 text-white" />
              </div>
              <span className="font-heading font-bold text-slate-800 text-base">{t('active_goals')}</span>
            </div>
            <button onClick={() => navigate('/patient/goals')}
              className="flex items-center gap-0.5 text-xs font-bold text-violet-600">
              {t('view_all')} <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            {pendingGoals.length > 0 ? pendingGoals.slice(0, 3).map((goal: any, i: number) => {
              const colors = ['from-violet-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-blue-500 to-cyan-500'];
              return (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors[i % 3]}`} />
                      <span className="text-sm font-semibold text-slate-700">{t(goal.type)}</span>
                    </div>
                    <span className="text-xs text-slate-400">{t('target')}: {goal.targetValue}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${colors[i % 3]} rounded-full`} style={{ width: '45%' }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 text-right font-medium">45% complete</p>
                </div>
              );
            }) : (
              <div className="flex flex-col items-center py-6 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-slate-300" />
                </div>
                <p className="text-xs font-semibold">{t('no_active_goals')}</p>
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            MOTIVATIONAL TIP
        ══════════════════════════════════════════════ */}
        <div className="relative rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg,hsl(38 90% 50%) 0%,hsl(25 95% 56%) 100%)' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4 px-5 py-5">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-heading font-extrabold text-white text-sm">
                {language === 'en' ? 'Keep it up!' : 'Komeza!'}
              </p>
              <p className="text-white/80 text-xs mt-1 leading-relaxed">
                {language === 'en'
                  ? "Taking your medication consistently helps control your blood pressure. You're doing great!"
                  : "Gufata imiti yawe buri gihe bifasha kugenzura umuvuduko w'amaraso. Urakora neza!"}
              </p>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
