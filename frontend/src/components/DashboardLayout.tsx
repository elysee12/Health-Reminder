import { ReactNode } from 'react';
import AppSidebar from './AppSidebar';
import Footer from './Footer';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarItems: { label: string; icon: ReactNode; path: string }[];
}

export default function DashboardLayout({ children, sidebarItems }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <AppSidebar items={sidebarItems} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
