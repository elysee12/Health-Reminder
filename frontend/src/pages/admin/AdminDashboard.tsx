import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import { useUsers, useHospitals, usePatients } from '@/hooks/use-api';
import { useNavigate } from 'react-router-dom';
import {
  Users, Building2, ShieldCheck, UserPlus, AlertTriangle,
  CheckCircle, Clock, ArrowRight, TrendingUp, Activity,
  Stethoscope, User, ChevronRight, Settings, Network,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

/* ── Stat card ──────────────────────────────────────────────────── */
function StatCard({
  label, value, icon: Icon, gradient, sub, onClick, delay = 0,
}: {
  label: string; value: string | number; icon: React.ElementType;
  gradient: string; sub?: string; onClick?: () => void; delay?: number;
}) {
  return (
    <div
      onClick={onClick}
      className={`stat-card dash-in ${onClick ? 'cursor-pointer' : ''}`}
      style={{ animationDelay: `${delay}ms` }}>
      <div className={`absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r ${gradient}`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {onClick && <ChevronRight className="h-4 w-4 text-slate-300 mt-1" />}
      </div>
      <p className="text-3xl font-extrabold font-heading text-slate-900 leading-none">{value}</p>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

/* ── Role badge ─────────────────────────────────────────────────── */
function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { cls: string; Icon: React.ElementType }> = {
    admin:    { cls: 'badge-info',    Icon: ShieldCheck  },
    provider: { cls: 'badge-success', Icon: Stethoscope  },
    patient:  { cls: 'badge-neutral', Icon: User         },
  };
  const { cls, Icon } = map[role] || map.patient;
  return (
    <span className={cls}>
      <Icon className="h-3 w-3" />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

/* ── Status badge ───────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  if (status === 'active')  return <span className="badge-success"><CheckCircle className="h-3 w-3" />Active</span>;
  if (status === 'pending') return <span className="badge-warning"><Clock className="h-3 w-3" />Pending</span>;
  return <span className="badge-neutral">{status}</span>;
}

export default function AdminDashboard() {
  const { user, t, language } = useAuth();
  const navigate = useNavigate();

  const { data: users = [],     isLoading: uL } = useUsers();
  const { data: hospitals = [], isLoading: hL } = useHospitals();
  const { data: patients = [],  isLoading: pL } = usePatients();

  const activeUsers   = users.filter((u: any) => u.status === 'active').length;
  const pendingReqs   = users.filter((u: any) => u.status === 'pending').length;
  const highRisk      = patients.filter((p: any) => p.riskLevel === 'high').length;

  const roleData = [
    { name: 'Providers', value: users.filter((u: any) => u.role === 'provider').length, color: '#10b981' },
    { name: 'Patients',  value: users.filter((u: any) => u.role === 'patient').length,  color: '#3b82f6' },
    { name: 'Admins',    value: users.filter((u: any) => u.role === 'admin').length,    color: '#8b5cf6' },
  ];

  if (uL || hL || pL) return (
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

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">{greeting}</p>
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('welcome')}, {user?.name?.split(' ')[0]}<span className="text-emerald-500">.</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">{t('admin_dashboard_subtitle')}</p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 shadow-sm">
            <Activity className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-600">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* ── Pending requests banner ──────────────────────────── */}
        {pendingReqs > 0 && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 dash-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <UserPlus className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-800 text-sm">
                  {pendingReqs} {t('pending_requests_banner')}
                </p>
                <p className="text-xs text-amber-600 mt-0.5">{t('review_approve_reject')}</p>
              </div>
            </div>
            <button onClick={() => navigate('/admin/users')}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-200 px-4 py-2 rounded-xl transition-colors">
              {t('review')} <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* ── Stat cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label={t('total_users')}    value={users.length}    icon={Users}         gradient="from-blue-500 to-cyan-500"      delay={0}   sub={`${activeUsers} active`} />
          <StatCard label={t('hospitals')}      value={hospitals.length} icon={Building2}    gradient="from-emerald-500 to-teal-500"   delay={60}  />
          <StatCard label={t('active_users')}   value={activeUsers}     icon={CheckCircle}   gradient="from-green-500 to-emerald-500"  delay={120} />
          <StatCard label={t('pending_requests')} value={pendingReqs}   icon={Clock}         gradient="from-amber-400 to-orange-500"   delay={180} onClick={() => navigate('/admin/users')} sub={t('click_to_review')} />
          <StatCard label={t('high_risk_bp')}   value={highRisk}        icon={AlertTriangle} gradient="from-red-400 to-rose-500"       delay={240} />
        </div>

        {/* ── Users table + Role chart ─────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Users table */}
          <div className="lg:col-span-2 dash-card">
            <div className="dash-card-header">
              <h3 className="dash-card-title"><Users className="h-4 w-4 text-blue-500" />{t('users')}</h3>
              <button onClick={() => navigate('/admin/users')}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                {t('manage_users')} <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full dash-table">
                <thead>
                  <tr>
                    <th>{t('user')}</th>
                    <th>{t('role')}</th>
                    <th>{t('status')}</th>
                    <th>{t('hospitals')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 7).map((u: any) => (
                    <tr key={u.id} className="cursor-pointer" onClick={() => navigate('/admin/users')}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                            {u.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm leading-tight">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><RoleBadge role={u.role} /></td>
                      <td><StatusBadge status={u.status} /></td>
                      <td className="text-slate-500 text-xs">{u.hospital?.name || '—'}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-10 text-slate-400 italic">No users found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Role distribution pie */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3 className="dash-card-title"><TrendingUp className="h-4 w-4 text-violet-500" />{t('user_distribution')}</h3>
              </div>
              <div className="p-4 flex flex-col items-center">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={roleData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                      paddingAngle={3} dataKey="value">
                      {roleData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any, n: any) => [v, n]} contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-1">
                  {roleData.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      {d.name}: <span className="font-bold text-slate-800">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="dash-card">
              <div className="dash-card-header">
                <h3 className="dash-card-title"><Settings className="h-4 w-4 text-slate-500" />{t('quick_actions')}</h3>
              </div>
              <div className="p-3 space-y-1.5">
                {[
                  { label: t('users'),            icon: Users,     path: '/admin/users',            color: 'from-blue-500 to-cyan-500' },
                  { label: t('hospitals'),         icon: Building2, path: '/admin/hospitals',        color: 'from-emerald-500 to-teal-500' },
                  { label: t('interoperability'),  icon: Network,   path: '/admin/interoperability', color: 'from-violet-500 to-purple-600' },
                  { label: t('settings'),          icon: Settings,  path: '/admin/settings',         color: 'from-slate-500 to-slate-600' },
                ].map(({ label, icon: Icon, path, color }) => (
                  <button key={path} onClick={() => navigate(path)}
                    className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 flex-1 text-left">{label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
