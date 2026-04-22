import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { useHospitals } from '@/hooks/use-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Shield, Stethoscope, User, Globe, Eye, EyeOff, UserPlus, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import Footer from '@/components/Footer';

type UserRole = 'admin' | 'provider' | 'patient';

const roles: { role: UserRole; icon: typeof User; label: string; labelRw: string }[] = [
  { role: 'admin', icon: Shield, label: 'Admin', labelRw: 'Umuyobozi' },
  { role: 'provider', icon: Stethoscope, label: 'Provider', labelRw: 'Umuganga' },
  { role: 'patient', icon: User, label: 'Patient', labelRw: 'Umurwayi' },
];

type View = 'login' | 'forgot' | 'reset' | 'request';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState<View>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  // Request access fields
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [reqRole, setReqRole] = useState<UserRole>('provider');
  const [reqReason, setReqReason] = useState('');
  const [reqHospital, setReqHospital] = useState('');
  const [reqPassword, setReqPassword] = useState('');
  const [reqConfirmPassword, setReqConfirmPassword] = useState('');
  const [showReqPassword, setShowReqPassword] = useState(false);
  const [showReqConfirmPassword, setShowReqConfirmPassword] = useState(false);

  const { data: hospitals = [], isLoading: hospitalsLoading } = useHospitals();
  const { login, user, t, toggleLanguage, language, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const paths: Record<UserRole, string> = { patient: '/patient', provider: '/provider', admin: '/admin' };
      navigate(paths[user.role]);
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error(language === 'en' ? 'Email and password are required' : 'Imeyili n\'ijambo ry\'ibanga birakenewe');
      return;
    }

    try {
      await login({ email, password });
      toast.success(language === 'en' ? 'Login successful!' : 'Kwinjira byagenze neza!');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotEmail) {
      toast.error(language === 'en' ? 'Please enter your email' : 'Andika imeyili yawe');
      return;
    }

    try {
      await api.auth.requestPasswordReset({ email: forgotEmail });
      toast.success(
        language === 'en'
          ? 'OTP sent to your email. Please check your inbox.'
          : 'OTP yoherejwe kuri imeyili yawe. Reba agasanduku kawe.'
      );
      setResetEmail(forgotEmail);
      setResetOtp('');
      setResetPassword('');
      setResetConfirmPassword('');
      setForgotEmail('');
      setView('reset');
    } catch (error: any) {
      toast.error(error.message || 'Unable to send OTP');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetOtp || !resetPassword || !resetConfirmPassword) {
      toast.error(language === 'en' ? 'Please fill all fields' : 'Uzuza ibisabwa byose');
      return;
    }

    if (resetPassword !== resetConfirmPassword) {
      toast.error(language === 'en' ? 'Passwords do not match' : "Amagambo y'ibanga ntabwo ahura");
      return;
    }

    try {
      await api.auth.confirmPasswordReset({
        email: resetEmail,
        otp: resetOtp,
        newPassword: resetPassword,
      });

      toast.success(
        language === 'en'
          ? 'Your password has been reset. Please login with your new password.'
          : 'Ijambo ry’ibanga ryahinduwe. Nyamuneka winjire ukoresheje irishya.'
      );
      setView('login');
      setResetEmail('');
      setResetOtp('');
      setResetPassword('');
      setResetConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Unable to reset password');
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName || !reqEmail || !reqPhone || !reqReason || !reqPassword || !reqConfirmPassword || (reqRole === 'provider' && !reqHospital)) {
      toast.error(language === 'en' ? 'Please fill all required fields' : 'Uzuza imyanya yose ikenewe');
      return;
    }
    if (reqPassword !== reqConfirmPassword) {
      toast.error(language === 'en' ? 'Passwords do not match' : "Amagambo y'ibanga ntabwo ahura");
      return;
    }
    try {
      const newRequest = {
        name: reqName,
        email: reqEmail,
        phone: reqPhone,
        role: reqRole,
        reason: reqReason,
        password: reqPassword,
        status: 'pending' as const,
        hospitalId: reqRole === 'provider' && reqHospital ? Number(reqHospital) : undefined,
      };
      
      await api.accessRequests.create(newRequest);
      
      console.log('Saving access request:', newRequest);
      toast.success(language === 'en' ? 'Access request submitted! You will be notified once approved.' : "Icyifuzo cyawe cyoherejwe! Uzamenyeshwa uko kizemezwa.");
      setView('login');
      setReqName(''); setReqEmail(''); setReqPhone(''); setReqRole('provider'); setReqReason(''); setReqHospital(''); setReqPassword(''); setReqConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit request');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left branded panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-accent" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--sidebar-primary))]/20 flex items-center justify-center">
              <Heart className="h-5 w-5 text-[hsl(var(--sidebar-primary))]" />
            </div>
            <span className="font-heading font-bold text-lg">mHealth Reminder</span>
          </div>
          <h1 className="font-heading text-4xl font-extrabold leading-tight mb-6">
            {language === 'en' ? 'Hypertension Management & Medication Reminder System' : "Sisitemu yo Gucunga Umuvuduko w'Amaraso Munini n'Ibibutsa by'Imiti"}
          </h1>
          <p className="text-[hsl(var(--sidebar-foreground))]/80 text-lg leading-relaxed max-w-md">
            {language === 'en'
              ? "Web & SMS-powered platform helping Rwanda's healthcare workers manage hypertension medication reminders and track patient blood pressure adherence through real-time monitoring."
              : "Ubuyobozi bwa Sisitemu yo Gucunga Umuvuduko w'Amaraso Munini n'Ibibutsa by'Imiti yo mu Rwanda rufasha abakozi bo mu buzima bwo mu Rwanda gukurikirana ibibutsa by'imiti y'umuvuduko w'amaraso n'ubukurikire bw'abarwayi."}
          </p>
        </div>

        <div className="relative z-10 flex gap-12">
          <div>
            <div className="text-3xl font-heading font-extrabold">5,000+</div>
            <div className="text-sm text-[hsl(var(--sidebar-foreground))]/60 mt-1">
              {language === 'en' ? 'Reminders Sent' : 'Ibibutsa Byoherejwe'}
            </div>
          </div>
          <div>
            <div className="text-3xl font-heading font-extrabold">250+</div>
            <div className="text-sm text-[hsl(var(--sidebar-foreground))]/60 mt-1">
              {language === 'en' ? 'Health Centers' : 'Ibigo by\'Ubuvuzi'}
            </div>
          </div>
          <div>
            <div className="text-3xl font-heading font-extrabold">95%</div>
            <div className="text-sm text-[hsl(var(--sidebar-foreground))]/60 mt-1">
              {language === 'en' ? 'Adherence Rate' : 'Ubukurikire'}
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center justify-between lg:hidden mb-12">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="font-heading font-bold">mHealth</span>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleLanguage} className="gap-2">
              <Globe className="h-4 w-4" />
              {language === 'en' ? 'Kinyarwanda' : 'English'}
            </Button>
          </div>

          <div className="hidden lg:flex justify-end mb-4">
            <Button variant="ghost" size="sm" onClick={toggleLanguage} className="gap-2">
              <Globe className="h-4 w-4" />
              {language === 'en' ? 'Kinyarwanda' : 'English'}
            </Button>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-heading font-bold text-card-foreground">
              {view === 'login' ? t('login') : view === 'forgot' ? (language === 'en' ? 'Reset Password' : "Guhindura Ijambo ry'Ibanga") : (language === 'en' ? 'Request Access' : 'Gusaba Kwinjira')}
            </h2>
            <p className="text-muted-foreground mt-2">
              {view === 'login' 
                ? (language === 'en' ? 'Sign in to access your hypertension dashboard' : 'Yinjira urebe ikibaho cyawe cy\'umuvuduko w\'amaraso')
                : (language === 'en' ? 'Fill in the details below to proceed' : 'Uzuza ibisabwa hano munsi')}
            </p>
          </div>

          {view === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6 animate-fade-in">
              <div className="bg-muted/30 p-4 rounded-xl flex items-start gap-3 border border-border/50 mb-4">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {language === 'en' 
                    ? 'Enter your credentials to access your hypertension management dashboard. Demo passwords are "password123".' 
                    : 'Yinjiza imyirondoro yawe kugira ngo winjire mu kibaho cyawe. Ijambo ry\'ibanga rya demo ni "password123".'}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input id="email" type="email" placeholder="name@hospital.rw" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t('password')}</Label>
                    <button type="button" onClick={() => setView('forgot')} className="text-sm font-medium text-primary hover:underline">
                      {language === 'en' ? 'Forgot password?' : "Wibagiwe ijambo ry'ibanga?"}
                    </button>
                  </div>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                {t('login')}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {language === 'en' ? 'New to mHealth?' : 'Mushya muri mHealth?'}
                  </span>
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-12 border-2 gap-2"
                onClick={() => setView('request')}
              >
                <UserPlus className="h-5 w-5" />
                {language === 'en' ? 'Request Access' : 'Saba Kwinjira'}
              </Button>
            </form>
          ) : view === 'forgot' ? (
            <form onSubmit={handleForgotPassword} className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">{t('email')}</Label>
                <Input id="forgot-email" type="email" placeholder="name@hospital.rw" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-bold">
                {language === 'en' ? 'Send OTP' : 'Ohereza OTP'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setView('login')}>
                {language === 'en' ? 'Back to Login' : 'Subira aho Winjirira'}
              </Button>
            </form>
          ) : view === 'reset' ? (
            <form onSubmit={handleResetPassword} className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="reset-email">{language === 'en' ? 'Reset email' : 'Email yo gusubiramo'}</Label>
                <Input id="reset-email" type="email" value={resetEmail} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-otp">{language === 'en' ? 'OTP code' : 'Kode ya OTP'}</Label>
                <Input
                  id="reset-otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="123456"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-password">{t('password')}</Label>
                <div className="relative">
                  <Input id="reset-password" type={showResetPassword ? 'text' : 'password'} value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowResetPassword(!showResetPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-confirm-password">{language === 'en' ? 'Confirm Password' : "Emeza Ijambo ry'Ibanga"}</Label>
                <div className="relative">
                  <Input id="reset-confirm-password" type={showResetConfirmPassword ? 'text' : 'password'} value={resetConfirmPassword} onChange={(e) => setResetConfirmPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showResetConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-bold">
                {language === 'en' ? 'Reset Password' : 'Hindura Ijambo ry’Ibanga'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setView('login')}>
                {language === 'en' ? 'Back to Login' : 'Subira aho Winjirira'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRequestAccess} className="space-y-4 animate-fade-in">
              <div className="bg-primary/5 p-4 rounded-xl flex items-start gap-3 border border-primary/20 mb-2">
                <UserPlus className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {language === 'en' 
                    ? 'Fill in your professional details and set a password. Our administrators will review your request and approve access.' 
                    : 'Uzuza imyirondoro yawe y\'akazi kandi ushiremo ijambo ry\'ibanga. Abayobozi bacu bazasuzuma icyifuzo cyawe kandi bemere kwinjira.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="req-name" className="text-xs uppercase tracking-wider text-muted-foreground">{language === 'en' ? 'Full Name' : 'Amazina Yose'}</Label>
                  <Input id="req-name" value={reqName} onChange={(e) => setReqName(e.target.value)} required placeholder="Jean de Dieu" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="req-email" className="text-xs uppercase tracking-wider text-muted-foreground">{t('email')}</Label>
                  <Input id="req-email" type="email" value={reqEmail} onChange={(e) => setReqEmail(e.target.value)} required placeholder="jean@hospital.rw" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="req-phone" className="text-xs uppercase tracking-wider text-muted-foreground">{language === 'en' ? 'Phone Number' : 'Nimero ya Terefone'}</Label>
                  <Input id="req-phone" value={reqPhone} onChange={(e) => setReqPhone(e.target.value)} required placeholder="+250..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="req-role" className="text-xs uppercase tracking-wider text-muted-foreground">{language === 'en' ? 'Role' : 'Uruhare'}</Label>
                  <Select value={reqRole} onValueChange={(v: UserRole) => { setReqRole(v); if (v !== 'provider') setReqHospital(''); }}>
                    <SelectTrigger id="req-role" className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="provider">{t('provider')}</SelectItem>
                      <SelectItem value="patient">{t('patient')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {reqRole === 'provider' && (
                <div className="space-y-2">
                  <Label htmlFor="req-hospital" className="text-xs uppercase tracking-wider text-muted-foreground">{language === 'en' ? 'Hospital/Clinic Name' : 'Izina ry\'Ibitaro/Ivuriro'}</Label>
                  <Select value={reqHospital} onValueChange={(value) => setReqHospital(value)}>
                    <SelectTrigger id="req-hospital" className="bg-background mt-1.5">
                      <SelectValue placeholder={language === 'en' ? 'Select a hospital' : 'Hitamo ibitaro'} />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitals.map((hospital: any) => (
                        <SelectItem key={hospital.id} value={String(hospital.id)}>
                          {hospital.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="req-password" className="text-xs uppercase tracking-wider text-muted-foreground">{t('password')}</Label>
                <div className="relative">
                  <Input id="req-password" type={showReqPassword ? "text" : "password"} value={reqPassword} onChange={(e) => setReqPassword(e.target.value)} required placeholder="Set your password" />
                  <button type="button" onClick={() => setShowReqPassword(!showReqPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showReqPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="req-confirm-password" className="text-xs uppercase tracking-wider text-muted-foreground">{language === 'en' ? 'Confirm Password' : "Emeza Ijambo ry'Ibanga"}</Label>
                <div className="relative">
                  <Input id="req-confirm-password" type={showReqConfirmPassword ? "text" : "password"} value={reqConfirmPassword} onChange={(e) => setReqConfirmPassword(e.target.value)} required placeholder="Confirm your password" />
                  <button type="button" onClick={() => setShowReqConfirmPassword(!showReqConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showReqConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="req-reason" className="text-xs uppercase tracking-wider text-muted-foreground">{language === 'en' ? 'Reason for Access' : 'Impamvu yo gusaba kwinjira'}</Label>
                <Textarea id="req-reason" rows={3} value={reqReason} onChange={(e) => setReqReason(e.target.value)} required placeholder={language === 'en' ? 'I am a nurse at CHUK...' : 'Ndi umuforomo kuri CHUK...'} />
              </div>
              <Button type="submit" className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20">
                {language === 'en' ? 'Submit Request' : 'Ohereza Icyifuzo'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setView('login')}>
                {language === 'en' ? 'Back to Login' : 'Subira aho Winjirira'}
              </Button>
            </form>
          )}
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
