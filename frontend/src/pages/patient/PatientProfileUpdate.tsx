import ProfileUpdate from '@/components/ProfileUpdate';
import { User, FileText, Pill, Bell, Target, AlertTriangle, Calendar, BarChart3 } from 'lucide-react';

const sidebarItems = [
  { label: 'Dashboard', icon: <User className="h-4 w-4" />, path: '/patient' },
  { label: 'Prescriptions', icon: <Pill className="h-4 w-4" />, path: '/patient/prescriptions' },
  { label: 'Reminders', icon: <Bell className="h-4 w-4" />, path: '/patient/reminders' },
  { label: 'Goals', icon: <Target className="h-4 w-4" />, path: '/patient/goals' },
  { label: 'Side Effects', icon: <AlertTriangle className="h-4 w-4" />, path: '/patient/side-effects' },
  { label: 'Appointments', icon: <Calendar className="h-4 w-4" />, path: '/patient/appointments' },
  { label: 'History', icon: <FileText className="h-4 w-4" />, path: '/patient/history' },
];

export default function PatientProfileUpdate() {
  return <ProfileUpdate sidebarItems={sidebarItems} />;
}