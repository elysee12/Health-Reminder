import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { useHospitals } from '@/hooks/use-api';
import { usePublicStats } from '@/hooks/use-api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Heart, User, Eye, EyeOff, UserPlus, Loader2, ArrowLeft,
  Activity, Bell, CheckCircle2, Globe, ChevronRight, Lock,
  Mail, Phone, Building2, FileText, Stethoscope, ShieldCheck,
  KeyRound, LogIn, Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

type UserRole = 'admin' | 'provider' | 'patient';
type View = 'login' | 'forgot' | 'reset' | 'request';

/* ─────────────────────────── tiny helpers ─────────────────────── */
const Orb = ({ className }: { className: string }) => (
  <div className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`} />
);

const StatPill = ({ value, label, delay = 0 }: { value: string; label: string; delay?: number }) => (
  <div className="glass rounded-2xl px-5 py-4 animate-count-up" style={{ animationDelay: `${delay}ms` }}>
    <div className="text-2xl font-heading font-extrabold text-white">{value}</div>
    <div className="text-xs text-white/60 mt-0.5 font-medium">{label}</div>
  </div>
);

/* ── Reusable field label ─────────────────────────────────────── */
const FL = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-semibold text-slate-600 mb-1.5 tracking-wide">{children}</label>
);

/* ── Icon-prefixed text / email / tel input ──────────────────── */
const IInput = ({
  id, type = 'text', value, onChange, placeholder, Icon,
  required = false, disabled = false,
}: {
  id?: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; Icon: React.ElementType; required?: boolean; disabled?: boolean;
}) => (
  <div className="relative">
    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
      <Icon className="h-[17px] w-[17px]" />
    </span>
    <input
      id={id} type={type} value={value} required={required} disabled={disabled}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-800
                 placeholder:text-slate-400 outline-none transition
                 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                 disabled:bg-slate-50 disabled:text-slate-400"
    />
  </div>
);

/* ── Password input ──────────────────────────────────────────── */
const PWInput = ({
  id, value, onChange, show, onToggle, placeholder,
}: {
  id: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; placeholder?: string;
}) => (
  <div className="relative">
    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
      <Lock className="h-[17px] w-[17px]" />
    </span>
    <input
      id={id} type={show ? 'text' : 'password'} value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || '••••••••'}
      className="w-full h-11 pl-10 pr-11 rounded-xl border border-slate-200 bg-white text-sm text-slate-800
                 placeholder:text-slate-400 outline-none transition
                 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
    />
    <button type="button" onClick={onToggle}
      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors">
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  </div>
);

/* ── Primary action button ───────────────────────────────────── */
const PrimaryBtn = ({
  loading = false, label, Icon = ChevronRight,
}: { loading?: boolean; label: string; Icon?: React.ElementType }) => (
  <button type="submit" disabled={loading}
    className="w-full h-11 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2
               transition-all duration-200 hover:opacity-90 active:scale-[0.99]
               disabled:opacity-60 disabled:cursor-not-allowed"
    style={{
      background: 'linear-gradient(135deg, hsl(168 60% 32%), hsl(168 65% 44%))',
    }}>
    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
    {label}
  </button>
);

/* ── Back link ───────────────────────────────────────────────── */
const BackBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button type="button" onClick={onClick}
    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-7">
    <ArrowLeft className="h-3.5 w-3.5" />{label}
  </button>
);

/* ═══════════════════════════ MAIN COMPONENT ═══════════════════════ */
export default function Login() {
  const [email, setEmail]                           = useState('');
  const [password, setPassword]                     = useState('');
  const [showPassword, setShowPassword]             = useState(false);
  const [view, setView]                             = useState<View>('login');
  const [forgotEmail, setForgotEmail]               = useState('');
  const [resetEmail, setResetEmail]                 = useState('');
  const [resetOtp, setResetOtp]                     = useState('');
  const [resetPassword, setResetPassword]           = useState('');
  const [resetConfirm, setResetConfirm]             = useState('');
  const [showResetPw, setShowResetPw]               = useState(false);
  const [showResetCpw, setShowResetCpw]             = useState(false);
  const [reqName, setReqName]                       = useState('');
  const [reqEmail, setReqEmail]                     = useState('');
  const [reqPhone, setReqPhone]                     = useState('');
  const [reqRole, setReqRole]                       = useState<UserRole>('provider');
  const [reqReason, setReqReason]                   = useState('');
  const [reqHospital, setReqHospital]               = useState('');
  const [reqPassword, setReqPassword]               = useState('');
  const [reqConfirm, setReqConfirm]                 = useState('');
  const [showReqPw, setShowReqPw]                   = useState(false);
  const [showReqCpw, setShowReqCpw]                 = useState(false);

  const { data: hospitals = [] } = useHospitals();
  const { login, user, t, language, toggleLanguage, isLoading } = useAuth();
  const navigate = useNavigate();

  const { reminderCount, hospitalCount, patientCount, userCount, isLoading: statsLoading } = usePublicStats();

  useEffect(() => {
    if (user) {
      const paths: Record<UserRole, string> = { patient: '/patient', provider: '/provider', admin: '/admin' };
      navigate(paths[user.role]);
    }
  }, [user, navigate]);

  /* handlers */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error(t('email_password_required')); return; }
    try { await login({ email, password }); toast.success(t('login_success')); }
    catch (err: any) { toast.error(err.message || 'Login failed'); }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) { toast.error(t('please_enter_email')); return; }
    try {
      await api.auth.requestPasswordReset({ email: forgotEmail });
      toast.success(t('otp_sent'));
      setResetEmail(forgotEmail); setForgotEmail(''); setView('reset');
    } catch (err: any) { toast.error(err.message || 'Unable to send OTP'); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp || !resetPassword || !resetConfirm) {
      toast.error(language === 'en' ? 'Please fill all fields' : 'Uzuza ibisabwa byose'); return;
    }
    if (resetPassword !== resetConfirm) {
      toast.error(language === 'en' ? 'Passwords do not match' : 'Amagambo y\'ibanga ntabwo ahura'); return;
    }
    try {
      await api.auth.confirmPasswordReset({ email: resetEmail, otp: resetOtp, newPassword: resetPassword });
      toast.success(language === 'en' ? 'Password reset successfully.' : 'Ijambo ry\'ibanga ryahinduwe.');
      setView('login');
    } catch (err: any) { toast.error(err.message || 'Unable to reset password'); }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!reqName.trim()) {
      toast.error(language === 'en' ? 'Please enter your full name' : 'Injiza amazina yawe yose');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!reqEmail.trim() || !emailRegex.test(reqEmail)) {
      toast.error(language === 'en' ? 'Please enter a valid email address' : 'Injiza imeyili yo kweza');
      return;
    }

    const phoneRegex = /^\+?\d{10,15}$/;
    if (!reqPhone.trim() || !phoneRegex.test(reqPhone.replace(/\s/g, ''))) {
      toast.error(language === 'en' ? 'Please enter a valid phone number' : 'Injiza telefoni yo kweza');
      return;
    }

    if (reqRole === 'provider' && !reqHospital) {
      toast.error(language === 'en' ? 'Please select a hospital' : 'Hitamo hospitali');
      return;
    }

    if (!reqReason.trim()) {
      toast.error(language === 'en' ? 'Please enter a reason for access' : 'Injiza icyo ushaka gukoresha');
      return;
    }

    if (reqPassword.length < 6) {
      toast.error(language === 'en' ? 'Password must be at least 6 characters long' : 'Ijambo ry\'ibanga rigomba kuba ubusa bwa 6');
      return;
    }

    if (reqPassword !== reqConfirm) {
      toast.error(language === 'en' ? 'Passwords do not match' : 'Amagambo y\'ibanga ntabwo ahura');
      return;
    }

    try {
      await api.accessRequests.create({
        name: reqName, email: reqEmail, phone: reqPhone, role: reqRole,
        reason: reqReason, password: reqPassword, status: 'pending' as const,
        hospitalId: reqRole === 'provider' && reqHospital ? Number(reqHospital) : undefined,
      });
      toast.success(t('request_sent'));
      setView('login');
      setReqName(''); setReqEmail(''); setReqPhone(''); setReqRole('provider');
      setReqReason(''); setReqHospital(''); setReqPassword(''); setReqConfirm('');
    } catch (err: any) { toast.error(err.message || 'Failed to submit request'); }
  };

  const RoleIcon = reqRole === 'provider' ? Stethoscope : reqRole === 'admin' ? ShieldCheck : User;

  const leftFeatures = [
    { Icon: Activity,     text: t('real_time_bp')   },
    { Icon: Bell,         text: t('sms_reminders')  },
    { Icon: CheckCircle2, text: t('adherence_95')   },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ══════════════ LEFT BRANDED PANEL ══════════════ */}
      <div className="hidden lg:flex lg:w-[48%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, hsl(168 55% 11%) 0%, hsl(168 50% 17%) 45%, hsl(180 44% 22%) 100%)' }}>
        <Orb className="w-96 h-96 -top-24 -left-24 bg-emerald-400 animate-float-slow" />
        <Orb className="w-72 h-72 bottom-28 -right-16 bg-teal-300 animate-float" />
        <Orb className="w-44 h-44 top-1/2 left-1/3 bg-cyan-400 animate-float-fast" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        {/* logo + lang toggle */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 ring-1 ring-white/20 flex items-center justify-center">
              <Heart className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <div className="font-heading font-bold text-white text-lg leading-none">mHealth</div>
              <div className="text-white/50 text-[11px] font-medium tracking-wide">Reminder</div>
            </div>
          </div>
          <button onClick={toggleLanguage}
            className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white transition-colors">
            <Globe className="h-3.5 w-3.5" />
            {language === 'en' ? 'RW' : 'EN'}
          </button>
        </div>

        {/* hero copy */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-semibold text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {t('rwanda_health_platform')}
          </div>
          <h1 className="font-heading text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
            {language === 'en'
              ? <><span className="text-emerald-300">Hypertension</span><br />Management<br />& Medication<br />Reminders</>
              : <><span className="text-emerald-300">Gucunga</span><br />Umuvuduko<br />w'Amaraso<br />n'Ibibutsa</>}
          </h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            {language === 'en'
              ? "Empowering Rwanda's healthcare workers with real-time monitoring, SMS reminders, and data-driven patient care."
              : "Gufasha abakozi bo mu buzima bwo mu Rwanda gukurikirana ibibutsa by'imiti y'umuvuduko w'amaraso."}
          </p>
          <div className="space-y-3">
            {leftFeatures.map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/75 text-sm font-medium">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Icon className="h-3.5 w-3.5 text-emerald-300" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* stats */}
        <div className="relative z-10 grid grid-cols-3 gap-3">
          <StatPill
            value={statsLoading ? '…' : userCount >= 1000 ? `${(userCount / 1000).toFixed(1)}k+` : `${userCount}+`}
            label={language === 'en' ? 'Total Users' : 'Abakoresha'}
            delay={0}
          />
          <StatPill
            value={statsLoading ? '…' : `${hospitalCount}+`}
            label={t('health_centers')}
            delay={100}
          />
          <StatPill
            value={statsLoading ? '…' : patientCount >= 1000 ? `${(patientCount / 1000).toFixed(1)}k+` : `${patientCount}+`}
            label={t('patients')}
            delay={200}
          />
        </div>
      </div>

      {/* ══════════════ RIGHT FORM PANEL ══════════════ */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">

        {/* mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-5 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading font-bold text-slate-900">mHealth Reminder</span>
          </div>
          <button onClick={toggleLanguage}
            className="flex items-center gap-1.5 border border-slate-200 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            <Globe className="h-3.5 w-3.5" />
            {language === 'en' ? 'RW' : 'EN'}
          </button>
        </div>

        {/* centred form area */}
        <div className="flex-1 flex items-center justify-center px-5 py-8">
          <div className="w-full max-w-[460px]">

            {/* ════════ LOGIN ════════ */}
            {view === 'login' && (
              <div className="animate-slide-up bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
                {/* header */}
                <div className="flex items-center gap-4 mb-7">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, hsl(168 60% 32%), hsl(168 65% 44%))' }}>
                    <LogIn className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl font-extrabold text-slate-900 leading-tight">
                      {language === 'en' ? 'Welcome back' : 'Murakaza neza'}
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                      {language === 'en' ? 'Sign in to your dashboard' : 'Yinjira mu kibaho cyawe'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {/* email */}
                  <div>
                    <FL>{t('email')}</FL>
                    <IInput id="email" type="email" value={email} onChange={setEmail}
                      placeholder="name@hospital.rw" Icon={Mail} required />
                  </div>

                  {/* password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <FL>{t('password')}</FL>
                      <button type="button" onClick={() => setView('forgot')}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                        {t('forgot_password')}?
                      </button>
                    </div>
                    <PWInput id="pw" value={password} onChange={setPassword}
                      show={showPassword} onToggle={() => setShowPassword(p => !p)} />
                  </div>

                  <div className="pt-1">
                    <PrimaryBtn loading={isLoading} label={t('login')} Icon={LogIn} />
                  </div>
                </form>

                {/* divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span className="text-xs text-slate-400 font-medium">
                    {language === 'en' ? 'New to mHealth?' : 'Mushya muri mHealth?'}
                  </span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <button type="button" onClick={() => setView('request')}
                  className="w-full h-11 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-700 text-sm font-semibold
                             flex items-center justify-center gap-2 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200">
                  <UserPlus className="h-4 w-4" />
                  {t('request_access')}
                </button>
              </div>
            )}

            {/* ════════ FORGOT PASSWORD ════════ */}
            {view === 'forgot' && (
              <div className="animate-slide-up bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
                <BackBtn onClick={() => setView('login')} label={t('back_to_login')} />

                <div className="flex items-center gap-4 mb-7">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                    <KeyRound className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl font-extrabold text-slate-900 leading-tight">
                      {language === 'en' ? 'Forgot password?' : 'Wibagiwe ijambo ry\'ibanga?'}
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                      {language === 'en' ? "We'll send a one-time code to your email." : "Tuzakoherereza kode imeyili yawe."}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <FL>{t('email')}</FL>
                    <IInput type="email" value={forgotEmail} onChange={setForgotEmail}
                      placeholder="name@hospital.rw" Icon={Mail} required />
                  </div>
                  <div className="pt-1">
                    <PrimaryBtn label={language === 'en' ? 'Send OTP Code' : 'Ohereza OTP'} Icon={Send} />
                  </div>
                </form>
              </div>
            )}

            {/* ════════ RESET PASSWORD ════════ */}
            {view === 'reset' && (
              <div className="animate-slide-up bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
                <BackBtn onClick={() => setView('login')} label={t('back_to_login')} />

                <div className="flex items-center gap-4 mb-7">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl font-extrabold text-slate-900 leading-tight">
                      {language === 'en' ? 'Reset password' : 'Hindura ijambo ry\'ibanga'}
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                      {language === 'en' ? `Code sent to ${resetEmail}` : `Kode yoherejwe kuri ${resetEmail}`}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleReset} className="space-y-4">
                  {/* OTP */}
                  <div>
                    <FL>OTP {language === 'en' ? 'Code' : 'Kode'}</FL>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                        <KeyRound className="h-[17px] w-[17px]" />
                      </span>
                      <input
                        type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6}
                        value={resetOtp} onChange={e => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="• • • • • •"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-800
                                   text-center tracking-[0.4em] font-bold placeholder:tracking-normal placeholder:font-normal
                                   placeholder:text-slate-400 outline-none transition
                                   focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 pl-1">
                      {language === 'en' ? 'Enter the 6-digit code from your email.' : 'Injiza kode y\'imibare 6 yo mu imeyili yawe.'}
                    </p>
                  </div>

                  <div>
                    <FL>{t('new_password')}</FL>
                    <PWInput id="rpw" value={resetPassword} onChange={setResetPassword}
                      show={showResetPw} onToggle={() => setShowResetPw(p => !p)} />
                  </div>

                  <div>
                    <FL>{t('confirm_new_password')}</FL>
                    <PWInput id="rcpw" value={resetConfirm} onChange={setResetConfirm}
                      show={showResetCpw} onToggle={() => setShowResetCpw(p => !p)} />
                  </div>

                  <div className="pt-1">
                    <PrimaryBtn label={t('submit')} Icon={CheckCircle2} />
                  </div>
                </form>
              </div>
            )}

            {/* ════════ REQUEST ACCESS ════════ */}
            {view === 'request' && (
              <div className="animate-slide-up bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
                <BackBtn onClick={() => setView('login')} label={t('back_to_login')} />

                {/* header */}
                <div className="flex items-center gap-4 mb-7">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, hsl(168 60% 32%), hsl(168 65% 44%))' }}>
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl font-extrabold text-slate-900 leading-tight">
                      {language === 'en' ? 'Request Access' : 'Saba Kwinjira'}
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                      {language === 'en'
                        ? 'Fill in your details. Admins will review and approve.'
                        : 'Uzuza amakuru yawe. Abayobozi bazasuzuma.'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleRequest} className="space-y-4">

                  {/* ── Personal info ── */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <User className="h-3.5 w-3.5" />
                      {language === 'en' ? 'Personal Information' : 'Amakuru Bwite'}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <FL>{t('full_name')}</FL>
                        <IInput value={reqName} onChange={setReqName}
                          placeholder="Jean de Dieu" Icon={User} required />
                      </div>
                      <div>
                        <FL>{t('email')}</FL>
                        <IInput type="email" value={reqEmail} onChange={setReqEmail}
                          placeholder="jean@hospital.rw" Icon={Mail} required />
                      </div>
                    </div>

                    <div>
                      <FL>{t('phone_number')}</FL>
                      <IInput type="tel" value={reqPhone} onChange={setReqPhone}
                        placeholder="+250 7XX XXX XXX" Icon={Phone} required />
                    </div>
                  </div>

                  {/* ── Role & hospital ── */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <RoleIcon className="h-3.5 w-3.5" />
                      {language === 'en' ? 'Role & Affiliation' : 'Uruhare & Aho Ukorera'}
                    </p>

                    <div>
                      <FL>{language === 'en' ? 'Role' : 'Uruhare'}</FL>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 z-10">
                          <RoleIcon className="h-[17px] w-[17px]" />
                        </span>
                        <Select value={reqRole} onValueChange={(v: UserRole) => { setReqRole(v); if (v !== 'provider') setReqHospital(''); }}>
                          <SelectTrigger className="w-full h-11 pl-10 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="provider">
                              <span className="flex items-center gap-2"><Stethoscope className="h-4 w-4 text-emerald-600" />{t('provider')}</span>
                            </SelectItem>
                            <SelectItem value="patient">
                              <span className="flex items-center gap-2"><User className="h-4 w-4 text-blue-500" />{t('patient')}</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {reqRole === 'provider' && (
                      <div>
                        <FL>{t('select_hospital')}</FL>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400 z-10">
                            <Building2 className="h-[17px] w-[17px]" />
                          </span>
                          <Select value={reqHospital} onValueChange={setReqHospital}>
                            <SelectTrigger className="w-full h-11 pl-10 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                              <SelectValue placeholder={t('select_hospital')} />
                            </SelectTrigger>
                            <SelectContent>
                              {hospitals.map((h: any) => (
                                <SelectItem key={h.id} value={String(h.id)}>
                                  <span className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400" />{h.name}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Password ── */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5" />
                      {language === 'en' ? 'Set Password' : 'Shyiraho Ijambo ry\'Ibanga'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <FL>{t('password')}</FL>
                        <PWInput id="req-pw" value={reqPassword} onChange={setReqPassword}
                          show={showReqPw} onToggle={() => setShowReqPw(p => !p)} />
                      </div>
                      <div>
                        <FL>{t('confirm_new_password')}</FL>
                        <PWInput id="req-cpw" value={reqConfirm} onChange={setReqConfirm}
                          show={showReqCpw} onToggle={() => setShowReqCpw(p => !p)} />
                      </div>
                    </div>
                  </div>

                  {/* ── Reason ── */}
                  <div>
                    <FL>{t('reason_for_access')}</FL>
                    <div className="relative">
                      <span className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                        <FileText className="h-[17px] w-[17px]" />
                      </span>
                      <textarea rows={3} value={reqReason} onChange={e => setReqReason(e.target.value)}
                        placeholder={language === 'en' ? 'e.g. I am a nurse at CHUK managing hypertension patients…' : 'Ndi umuforomo kuri CHUK…'}
                        className="w-full pl-10 pr-4 pt-2.5 pb-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800
                                   placeholder:text-slate-400 outline-none transition resize-none
                                   focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        required />
                    </div>
                  </div>

                  <div className="pt-1">
                    <PrimaryBtn label={t('submit')} Icon={Send} />
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>

        {/* footer */}
        <div className="px-6 py-4 text-center text-xs text-slate-400 border-t border-slate-100">
          © {new Date().getFullYear()} MHealth Reminder Ltd. ·{' '}
          <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a> ·{' '}
          <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
