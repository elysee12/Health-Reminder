import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Heart, LogOut, User, ChevronRight, Globe } from 'lucide-react';
import { ReactNode } from 'react';

interface NavItem { label: string; icon: ReactNode; path: string; }
interface AppSidebarProps { items: NavItem[]; onNavItemClick?: () => void; }

export default function AppSidebar({ items, onNavItemClick }: AppSidebarProps) {
  const { user, logout, toggleLanguage, language, t } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const go = (path: string) => { navigate(path); onNavItemClick?.(); };

  const handleLogout = async () => { await logout(); navigate('/'); onNavItemClick?.(); };

  const handleEditProfile = () => {
    const map: Record<string, string> = { admin: '/admin/profile', provider: '/provider/profile', patient: '/patient/profile' };
    go(map[user?.role || 'patient']);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 h-full flex flex-col"
      style={{ background: 'linear-gradient(180deg, hsl(168 50% 13%) 0%, hsl(168 45% 16%) 100%)' }}>

      {/* ── Logo ── */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-white/8">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, hsl(168 60% 38%), hsl(168 65% 50%))' }}>
          <Heart className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
        </div>
        <div>
          <div className="font-heading font-extrabold text-white text-[15px] leading-none tracking-tight">mHealth</div>
          <div className="text-[10px] text-white/40 font-semibold tracking-[0.15em] uppercase mt-0.5">Reminder System</div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {items.map((item) => (
          <button key={item.path} onClick={() => go(item.path)}
            className={`sidebar-nav-item group relative ${
              isActive(item.path)
                ? 'bg-white/12 text-white font-semibold shadow-sm'
                : 'text-white/55 hover:text-white/90 hover:bg-white/6'
            }`}>
            {isActive(item.path) && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-emerald-400" />
            )}
            <span className={`shrink-0 ${isActive(item.path) ? 'text-emerald-400' : 'text-white/40 group-hover:text-white/70'} transition-colors`}>
              {item.icon}
            </span>
            <span className="flex-1 text-[13px]">{item.label}</span>
            {isActive(item.path) && <ChevronRight className="h-3.5 w-3.5 text-white/30" />}
          </button>
        ))}
      </nav>

      {/* ── Bottom section ── */}
      <div className="px-3 pb-5 space-y-3 border-t border-white/8 pt-3">

        {/* ── Language toggle ── */}
        <div className="px-1 py-1">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Globe className="h-3 w-3 text-white/30" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">
              {t('language')}
            </span>
          </div>

          {/* Pill toggle container */}
          <div className="relative flex items-center bg-white/8 rounded-2xl p-1 border border-white/10">
            {/* sliding active indicator */}
            <div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/30 transition-all duration-300 ease-in-out"
              style={{ left: language === 'en' ? '4px' : 'calc(50%)' }}
            />

            {/* English option */}
            <button
              onClick={() => language !== 'en' && toggleLanguage()}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all duration-300 ${
                language === 'en' ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}>
              <span className="text-base leading-none">🇬🇧</span>
              <span className="text-[12px] font-bold tracking-wide">EN</span>
            </button>

            {/* Kinyarwanda option */}
            <button
              onClick={() => language !== 'rw' && toggleLanguage()}
              className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all duration-300 ${
                language === 'rw' ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}>
              <span className="text-base leading-none">🇷🇼</span>
              <span className="text-[12px] font-bold tracking-wide">RW</span>
            </button>
          </div>
        </div>

        {/* Profile card */}
        <div className="rounded-2xl p-3.5 border border-white/10 bg-white/6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-white/40 font-semibold uppercase tracking-wider">{t('logged_in_as')}</div>
              <div className="text-sm font-bold text-white truncate leading-tight mt-0.5">{user?.name}</div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/8">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">
              {user?.role === 'provider' ? 'NURSE' : t(user?.role || 'patient').toUpperCase()}
            </span>
            <button onClick={handleEditProfile}
              className="text-[11px] font-semibold text-white/50 hover:text-emerald-400 transition-colors">
              {t('edit_profile')} →
            </button>
          </div>
        </div>

        {/* Sign out */}
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/8 transition-all duration-200 group">
          <div className="w-7 h-7 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 flex items-center justify-center transition-colors">
            <LogOut className="h-3.5 w-3.5" />
          </div>
          <span className="text-[13px] font-semibold">{t('sign_out')}</span>
        </button>
      </div>
    </aside>
  );
}
