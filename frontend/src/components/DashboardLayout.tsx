import { ReactNode, useState } from 'react';
import AppSidebar from './AppSidebar';
import Footer from './Footer';
import { Menu, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarItems: { label: string; icon: ReactNode; path: string }[];
}

export default function DashboardLayout({ children, sidebarItems }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden h-16 border-b bg-sidebar text-sidebar-foreground flex items-center justify-between px-4 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
            <Heart className="h-4 w-4 text-sidebar-primary" />
          </div>
          <span className="font-heading font-bold text-sm">mHealth</span>
        </div>
        
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-sidebar border-r-sidebar-border">
            <AppSidebar items={sidebarItems} onNavItemClick={() => setIsMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AppSidebar items={sidebarItems} />
        </div>
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* Bottom Nav for Patients - Only on Mobile */}
      <div className="lg:hidden border-t bg-background/80 backdrop-blur-md sticky bottom-0 z-40 flex justify-around items-center h-16 px-2">
        {sidebarItems.slice(0, 4).map((item) => (
          <a
            key={item.path}
            href={item.path}
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary px-3"
          >
            <div className="scale-110">{item.icon}</div>
            <span className="text-[10px] font-medium uppercase tracking-wider">{item.label.split(' ')[0]}</span>
          </a>
        ))}
      </div>

      <Footer />
    </div>
  );
}
