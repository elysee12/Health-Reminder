import ProfileUpdate from '@/components/ProfileUpdate';
import { LayoutDashboard, Users, Building, Settings, Globe } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, path: '/admin' },
  { label: 'Users', icon: <Users className="h-4 w-4" />, path: '/admin/users' },
  { label: 'Hospitals', icon: <Building className="h-4 w-4" />, path: '/admin/hospitals' },
  { label: 'Interoperability', icon: <Globe className="h-4 w-4" />, path: '/admin/interoperability' },
  { label: 'Settings', icon: <Settings className="h-4 w-4" />, path: '/admin/settings' },
];

export default function AdminProfileUpdate() {
  return <ProfileUpdate sidebarItems={sidebarItems} />;
}