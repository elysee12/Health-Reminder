import { ReactNode, useState, useMemo } from 'react';
import AppSidebar from './AppSidebar';
import Footer from './Footer';
import {
  Menu, Heart, LayoutDashboard, Pill, Bell, Target, MessageSquare,
  Calendar, History, Users, BarChart3, UserCheck, AlertTriangle,
  Building2, Network, Settings, FileText,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarItems?: { label: string; icon: ReactNode; path: string }[];
}

export default function DashboardLayout({ children, sidebarItems: initialSidebarItems }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, t } = useAuth();

  const sidebarItems = useMemo(() => {
    if (initialSidebarItems) return initialSidebarItems;
    const role = user?.role || 'patient';

    if (role === 'admin') return [
      { label: t('dashboard'),        icon: <LayoutDashboard className="h-4 w-4" />, path: '/admin' },
      { label: t('users'),            icon: <Users className="h-4 w-4" />,           path: '/admin/users' },
      { label: t('hospitals'),        icon: <Building2 className="h-4 w-4" />,       path: '/admin/hospitals' },
      { label: t('reports'),          icon: <FileText className="h-4 w-4" />,        path: '/admin/reports' },
      { label: t('interoperability'), icon: <Network className="h-4 w-4" />,         path: '/admin/interoperability' },
      { label: t('settings'),         icon: <Settings className="h-4 w-4" />,        path: '/admin/settings' },
    ];

    if (role === 'provider') return [
      { label: t('dashboard'),     icon: <LayoutDashboard className="h-4 w-4" />, path: '/provider' },
      { label: t('patients'),      icon: <Users className="h-4 w-4" />,           path: '/provider/patients' },
      { label: t('prescriptions'), icon: <Pill className="h-4 w-4" />,            path: '/provider/prescriptions' },
      { label: t('reminders'),     icon: <Bell className="h-4 w-4" />,            path: '/provider/reminders' },
      { label: t('analytics'),     icon: <BarChart3 className="h-4 w-4" />,       path: '/provider/analytics' },
      { label: t('reports'),       icon: <FileText className="h-4 w-4" />,        path: '/provider/reports' },
      { label: t('follow_ups'),    icon: <UserCheck className="h-4 w-4" />,       path: '/provider/follow-ups' },
      { label: t('patient_goals'), icon: <Target className="h-4 w-4" />,          path: '/provider/goals' },
      { label: t('side_effects'),  icon: <AlertTriangle className="h-4 w-4" />,   path: '/provider/side-effects' },
      { label: t('appointments'),  icon: <Calendar className="h-4 w-4" />,        path: '/provider/appointments' },
      { label: t('sms_mgmt'),      icon: <MessageSquare className="h-4 w-4" />,   path: '/provider/sms' },
    ];

    return [
      { label: t('dashboard'),     icon: <LayoutDashboard className="h-4 w-4" />, path: '/patient' },
      { label: t('prescriptions'), icon: <Pill className="h-4 w-4" />,            path: '/patient/prescriptions' },
      { label: t('reminders'),     icon: <Bell className="h-4 w-4" />,            path: '/patient/reminders' },
      { label: t('target_goals'),  icon: <Target className="h-4 w-4" />,          path: '/patient/goals' },
      { label: t('side_effects'),  icon: <MessageSquare className="h-4 w-4" />,   path: '/patient/side-effects' },
      { label: t('appointments'),  icon: <Calendar className="h-4 w-4" />,        path: '/patient/appointments' },
    ];
  }, [user?.role, t, initialSidebarItems]);

  return (
    /*
     * ROOT: full viewport, no overflow-x, no flex that could push sidebar
     * into mobile view. The sidebar only exists in the DOM on lg+ via
     * the hidden/block classes — on mobile it lives exclusively inside
     * the Sheet (portal), so it can NEVER overlap the page content.
     */
    <div className="min-h-screen w-full bg-slate-50 overflow-x-hidden">

      {/* ══════════════════════════════════════════════════
          DESKTOP LAYOUT  (lg and above)
          Sidebar is fixed on the left; content has left padding.
      ══════════════════════════════════════════════════ */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 z-50">
        <AppSidebar items={sidebarItems} />
      </div>

      {/* ══════════════════════════════════════════════════
          MOBILE + DESKTOP CONTENT COLUMN
      ══════════════════════════════════════════════════ */}
      <div className="lg:pl-64 flex flex-col min-h-screen">

        {/* ── Mobile-only top bar ── */}
        <header className="lg:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-4
                           bg-white border-b border-slate-100 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,hsl(168 60% 32%),hsl(168 65% 46%))' }}>
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading font-bold text-slate-900 text-sm">mHealth Reminder</span>
          </div>

          {/* Hamburger → opens Sheet (portal, never in normal flow) */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50
                           flex items-center justify-center text-slate-600
                           active:scale-95 transition-transform">
                <Menu className="h-[18px] w-[18px]" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[260px] border-r-0">
              <AppSidebar items={sidebarItems} onNavItemClick={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 w-full max-w-[1400px] mx-auto
                         px-3 pt-4 pb-24
                         md:px-6 md:pt-6 md:pb-8
                         lg:px-8 lg:pt-8 lg:pb-10">
          {children}
        </main>

        {/* ── Mobile-only bottom nav ── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40
                        bg-white border-t border-slate-100
                        shadow-[0_-2px_16px_rgba(0,0,0,0.07)]
                        flex justify-around items-center h-16">
          {sidebarItems.slice(0, 5).map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-0.5 flex-1 py-2">
                <div className={`p-2 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-slate-400'
                }`}>
                  {item.icon}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wide ${
                  active ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer only on desktop */}
        <div className="hidden lg:block">
          <Footer />
        </div>
      </div>
    </div>
  );
}
