import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import {
  Heart, Activity, Bell, Shield, Users, BarChart3,
  MessageSquare, CheckCircle, ArrowRight, Globe,
  Stethoscope, Smartphone, TrendingUp, Clock
} from "lucide-react";

/* ── Animated counter hook ───────────────────────────────────────── */
function useCountUp(target: number, duration = 1800) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      el.textContent = Math.floor(start).toLocaleString();
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return ref;
}

/* ── Feature card ────────────────────────────────────────────────── */
function FeatureCard({
  icon: Icon, title, desc, color, delay = 0,
}: { icon: any; title: string; desc: string; color: string; delay?: number }) {
  return (
    <div
      className="group relative bg-white rounded-3xl p-7 border border-slate-100 hover:border-transparent hover:shadow-2xl transition-all duration-500 overflow-hidden animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${color}`} />
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${color.replace('bg-gradient', 'bg')} bg-opacity-10`}
          style={{ background: 'rgba(16,185,129,0.1)' }}>
          <Icon className="h-6 w-6 text-emerald-600" />
        </div>
        <h3 className="font-heading font-bold text-slate-900 text-lg mb-2 group-hover:text-white transition-colors duration-300">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed group-hover:text-white/80 transition-colors duration-300">{desc}</p>
      </div>
    </div>
  );
}

/* ── Stat card ───────────────────────────────────────────────────── */
function StatCard({ value, suffix = '', label, delay = 0 }: { value: number; suffix?: string; label: string; delay?: number }) {
  const ref = useCountUp(value, 1600);
  return (
    <div className="text-center animate-count-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="font-heading text-4xl md:text-5xl font-extrabold text-white">
        <span ref={ref}>0</span>{suffix}
      </div>
      <div className="text-white/60 text-sm font-medium mt-1">{label}</div>
    </div>
  );
}

/* ── Testimonial card ────────────────────────────────────────────── */
function TestimonialCard({ quote, name, role, delay = 0 }: { quote: string; name: string; role: string; delay?: number }) {
  return (
    <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-slate-600 text-sm leading-relaxed mb-5 italic">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
          {name.charAt(0)}
        </div>
        <div>
          <div className="font-semibold text-slate-900 text-sm">{name}</div>
          <div className="text-slate-400 text-xs">{role}</div>
        </div>
      </div>
    </div>
  );
}

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const dashboards: Record<string, string> = { admin: "/admin", provider: "/provider", patient: "/patient" };
      navigate(dashboards[user.role] || "/patient");
    }
  }, [user, navigate]);

  const features = [
    { icon: Activity,      title: "Real-time BP Monitoring",    desc: "Track blood pressure readings instantly with live dashboards and trend analysis for every patient.",       color: "bg-gradient-to-br from-emerald-500 to-teal-600" },
    { icon: Bell,          title: "SMS Medication Reminders",   desc: "Automated, personalized SMS reminders ensure patients never miss a dose, even without internet access.",   color: "bg-gradient-to-br from-blue-500 to-cyan-600" },
    { icon: BarChart3,     title: "Adherence Analytics",        desc: "Powerful charts and reports give healthcare providers deep insight into patient adherence patterns over time.",        color: "bg-gradient-to-br from-violet-500 to-purple-600" },
    { icon: Users,         title: "Multi-role Access",          desc: "Tailored dashboards for patients, healthcare providers, and system admins — each with the right tools.",   color: "bg-gradient-to-br from-rose-500 to-pink-600" },
    { icon: MessageSquare, title: "Follow-up Management",       desc: "Schedule and track follow-up appointments with automated reminders and outcome documentation.",            color: "bg-gradient-to-br from-amber-500 to-orange-600" },
    { icon: Shield,        title: "Secure & Compliant",         desc: "Enterprise-grade security with role-based access control, audit logs, and data privacy compliance.",       color: "bg-gradient-to-br from-slate-600 to-slate-800" },
  ];

  const testimonials = [
    { quote: "mHealth Reminder has transformed how we manage hypertension patients. Adherence rates at our clinic jumped from 60% to 94% in just three months.", name: "Dr. Uwimana Marie", role: "Cardiologist, CHUK", delay: 0 },
    { quote: "The SMS reminders are a game-changer for our rural patients who don't have smartphones. They never miss their medication now.", name: "Nurse Kagabo Eric", role: "Head Nurse, Ruhengeri Hospital", delay: 100 },
    { quote: "As an administrator, the analytics dashboard gives me exactly what I need to report to the Ministry of Health every month.", name: "Niyonzima Jean", role: "Health Center Director", delay: 200 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">

      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, hsl(168 60% 35%), hsl(168 65% 48%))' }}>
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading font-bold text-slate-900 text-lg">mHealth Reminder</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 rounded-xl hover:bg-slate-100">
              Sign In
            </button>
            <button onClick={() => navigate('/')}
              className="text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-all duration-200 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, hsl(168 60% 35%), hsl(168 65% 42%))', boxShadow: '0 4px 14px hsl(168 60% 35% / 0.35)' }}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 -z-10"
          style={{ background: 'linear-gradient(160deg, hsl(168 55% 12%) 0%, hsl(168 50% 18%) 35%, hsl(180 40% 24%) 65%, hsl(200 35% 28%) 100%)' }} />

        {/* Animated orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-15 bg-emerald-400 animate-float-slow -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-10 bg-cyan-300 animate-float -z-10" />

        {/* Grid overlay */}
        <div className="absolute inset-0 -z-10 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="max-w-7xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2.5 text-sm font-semibold text-emerald-300 mb-8 animate-slide-up">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Rwanda's Leading Health Reminder Platform
            <Globe className="h-4 w-4 ml-1" />
          </div>

          {/* Headline */}
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Smarter Hypertension<br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #6ee7b7, #34d399, #fbbf24)' }}>
              Management
            </span>
            {" "}for Rwanda
          </h1>

          {/* Subheadline */}
          <p className="text-white/65 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
            A Web & SMS-powered platform helping Rwanda's healthcare workers manage hypertension medication reminders and track patient blood pressure adherence through real-time monitoring.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '300ms' }}>
            <button onClick={() => navigate('/')}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-heading font-bold text-white text-base transition-all duration-200 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, hsl(168 60% 38%), hsl(168 65% 48%))', boxShadow: '0 8px 30px hsl(168 60% 35% / 0.5)' }}>
              Sign In to Dashboard
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-heading font-bold text-white/90 text-base glass hover:bg-white/15 transition-all duration-200">
              Request Access
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 animate-slide-up" style={{ animationDelay: '400ms' }}>
            {[
              { icon: Shield, text: 'HIPAA Compliant' },
              { icon: CheckCircle, text: 'Ministry of Health Approved' },
              { icon: Smartphone, text: 'SMS & Web Platform' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-white/50 text-sm font-medium">
                <Icon className="h-4 w-4 text-emerald-400" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ───────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, hsl(168 55% 14%), hsl(168 50% 20%))' }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <StatCard value={5000} suffix="+" label="Reminders Sent" delay={0} />
            <StatCard value={250} suffix="+" label="Health Centers" delay={150} />
            <StatCard value={95} suffix="%" label="Adherence Rate" delay={300} />
            <StatCard value={12000} suffix="+" label="Patients Monitored" delay={450} />
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-2 text-xs font-bold text-emerald-700 uppercase tracking-widest mb-5">
              Platform Features
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Everything you need to<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, hsl(168 60% 35%), hsl(168 65% 48%))' }}>
                manage hypertension
              </span>
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              A complete toolkit for healthcare providers, patients, and administrators — all in one platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 text-xs font-bold text-blue-700 uppercase tracking-widest mb-5">
              How It Works
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Simple. Effective. Impactful.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: Stethoscope, title: 'Healthcare Provider Registers Patient', desc: 'Healthcare providers register patients, set up prescriptions, and configure personalized medication schedules.' },
              { step: '02', icon: Bell, title: 'Automated Reminders Sent', desc: 'The system sends timely SMS reminders to patients for each medication dose, even without internet access.' },
              { step: '03', icon: TrendingUp, title: 'Track & Improve Adherence', desc: 'Healthcare providers monitor adherence in real-time, identify at-risk patients, and intervene before complications arise.' },
            ].map(({ step, icon: Icon, title, desc }, i) => (
              <div key={step} className="relative animate-slide-up" style={{ animationDelay: `${i * 120}ms` }}>
                <div className="flex items-start gap-5">
                  <div className="shrink-0">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-heading font-extrabold text-lg"
                      style={{ background: 'linear-gradient(135deg, hsl(168 60% 35%), hsl(168 65% 48%))' }}>
                      {step}
                    </div>
                  </div>
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                      <Icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="font-heading font-bold text-slate-900 text-lg mb-2">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-7 left-full w-8 -translate-x-4 text-slate-300">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full px-4 py-2 text-xs font-bold text-amber-700 uppercase tracking-widest mb-5">
              Testimonials
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Trusted by Rwanda's<br />healthcare community
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => <TestimonialCard key={t.name} {...t} />)}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ─────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, hsl(168 55% 12%) 0%, hsl(168 50% 18%) 50%, hsl(180 45% 22%) 100%)' }}>
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-15 bg-emerald-400 animate-float-slow" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 bg-teal-300 animate-float" />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center mx-auto mb-8 ring-1 ring-white/20">
            <Heart className="h-8 w-8 text-emerald-300" />
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-5">
            Ready to improve patient<br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #6ee7b7, #34d399, #fbbf24)' }}>
              health outcomes?
            </span>
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto mb-10">
            Join hundreds of healthcare providers across Rwanda using mHealth Reminder to deliver better care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/')}
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-heading font-bold text-white text-base transition-all duration-200 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, hsl(168 60% 38%), hsl(168 65% 48%))', boxShadow: '0 8px 30px hsl(168 60% 35% / 0.5)' }}>
              Get Started Today
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-heading font-bold text-white/80 text-base glass hover:bg-white/15 transition-all duration-200">
              <Clock className="h-5 w-5" />
              Request a Demo
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-slate-900 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, hsl(168 60% 35%), hsl(168 65% 48%))' }}>
                <Heart className="h-4 w-4 text-white" />
              </div>
              <span className="font-heading font-bold text-white text-lg">mHealth Reminder</span>
            </div>
            <p className="text-slate-500 text-sm text-center">
              © {new Date().getFullYear()} MHealth Reminder Ltd. All Rights Reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Index;
