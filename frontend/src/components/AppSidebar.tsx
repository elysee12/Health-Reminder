import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { Heart, Globe, LogOut, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface NavItem {
  label: string;
  icon: ReactNode;
  path: string;
}

interface AppSidebarProps {
  items: NavItem[];
  onNavItemClick?: () => void;
}

export default function AppSidebar({ items, onNavItemClick }: AppSidebarProps) {
  const { user, logout, toggleLanguage, language } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    if (onNavItemClick) onNavItemClick();
  };

  const handleNavItemClick = (path: string) => {
    navigate(path);
    if (onNavItemClick) onNavItemClick();
  };

  const handleEditProfile = () => {
    const rolePathMap: Record<string, string> = {
      admin: '/admin/profile',
      provider: '/provider/profile',
      patient: '/patient/profile',
    };
    navigate(rolePathMap[user?.role || 'patient']);
    if (onNavItemClick) onNavItemClick();
  };

  return (
    <aside className="w-full lg:w-64 h-full bg-sidebar text-sidebar-foreground flex flex-col">
      <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-sidebar-primary/20 flex items-center justify-center">
          <Heart className="h-5 w-5 text-sidebar-primary" />
        </div>
        <div>
          <div className="font-heading font-bold text-sm">mHealth</div>
          <div className="text-xs text-sidebar-foreground/60">Reminder System</div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavItemClick(item.path)}
            className={`sidebar-nav-item w-full text-left ${
              location.pathname === item.path ? 'sidebar-nav-item-active' : 'hover:bg-sidebar-accent/50'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-2 pb-6 lg:pb-3">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent" onClick={toggleLanguage}>
          <Globe className="h-4 w-4" />
          {language === 'en' ? 'Kinyarwanda' : 'English'}
        </Button>

        <div className="px-3 py-2 flex items-center justify-between gap-3 bg-sidebar-accent/20 rounded-md">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-xs font-bold text-sidebar-primary shrink-0">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name}</div>
              <div className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 text-sidebar-foreground hover:bg-sidebar-accent shrink-0" 
            onClick={handleEditProfile}
            title="Edit Profile"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
