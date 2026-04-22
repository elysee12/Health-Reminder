import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Building2, Settings, Plus, Shield, Stethoscope, User, UserPlus, Network, AlertTriangle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUsers, useHospitals, usePatients } from '@/hooks/use-api';
import { Badge } from '@/components/ui/badge';

const sidebarItems = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, path: '/admin' },
  { label: 'Users', icon: <Users className="h-4 w-4" />, path: '/admin/users' },
  { label: 'Hospitals', icon: <Building2 className="h-4 w-4" />, path: '/admin/hospitals' },
  { label: 'Interoperability', icon: <Network className="h-4 w-4" />, path: '/admin/interoperability' },
  { label: 'Settings', icon: <Settings className="h-4 w-4" />, path: '/admin/settings' },
];

export default function AdminDashboard() {
  const { user, t, language } = useAuth();
  const navigate = useNavigate();
  const roleIcon = { admin: Shield, provider: Stethoscope, patient: User };
  
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: hospitals = [], isLoading: hospitalsLoading } = useHospitals();
  const { data: patients = [], isLoading: patientsLoading } = usePatients();

  const pendingRequests = users.filter((u: any) => u.status === 'pending').length;
  const highRiskPatients = patients.filter((p: any) => p.riskLevel === 'high').length;

  if (usersLoading || hospitalsLoading || patientsLoading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems}>
        <div className="p-8 text-center">Loading dashboard data...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="page-header">{t('welcome')}, Admin!</h1>
          <p className="text-muted-foreground">{language === 'en' ? 'Hypertension Management System Administration' : "Ubuyobozi bwa Sisitemu yo Gucunga Umuvuduko w'Amaraso"}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="stat-card">
            <div className="text-2xl font-bold font-heading text-card-foreground">{users.length}</div>
            <div className="text-sm text-muted-foreground">{language === 'en' ? 'Total Users' : 'Abakoresha Bose'}</div>
          </div>
          <div className="stat-card">
            <div className="text-2xl font-bold font-heading text-card-foreground">{hospitals.length}</div>
            <div className="text-sm text-muted-foreground">{t('hospitals')}</div>
          </div>
          <div className="stat-card">
            <div className="text-2xl font-bold font-heading text-success">{users.filter((u: any) => u.status === 'active').length}</div>
            <div className="text-sm text-muted-foreground">{language === 'en' ? 'Active Users' : 'Abakoresha Bakora'}</div>
          </div>
          <div className="stat-card cursor-pointer hover:ring-2 ring-warning/50 transition-all" onClick={() => navigate('/admin/users')}>
            <div className="text-2xl font-bold font-heading text-warning">{pendingRequests}</div>
            <div className="text-sm text-muted-foreground">{language === 'en' ? 'Pending Requests' : 'Ibyifuzo Bitegereje'}</div>
          </div>
          <div className="stat-card">
            <div className="text-2xl font-bold font-heading text-destructive">{highRiskPatients}</div>
            <div className="text-sm text-muted-foreground">{language === 'en' ? 'High-Risk BP' : "Umuvuduko w'Akaga"}</div>
          </div>
        </div>

        {/* Pending Access Requests Banner */}
        {pendingRequests > 0 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserPlus className="h-5 w-5 text-warning" />
                <div>
                  <div className="font-medium text-card-foreground">
                    {language === 'en' ? `${pendingRequests} pending access request(s)` : `${pendingRequests} icyifuzo/ibyifuzo bitegereje`}
                  </div>
                  <div className="text-sm text-muted-foreground">{language === 'en' ? 'Review and approve or reject new user requests' : 'Suzuma kandi wemeze cyangwa wange ibyifuzo bishya'}</div>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/users')}>
                {language === 'en' ? 'Review' : 'Suzuma'}
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading">{t('users')}</CardTitle>
              <Button size="sm" className="gap-2" onClick={() => navigate('/admin/users')}><Plus className="h-4 w-4" />{language === 'en' ? 'Manage Users' : 'Gucunga Abakoresha'}</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">{language === 'en' ? 'User' : 'Umukoresha'}</th>
                    <th className="p-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">{language === 'en' ? 'Role' : 'Uruhare'}</th>
                    <th className="p-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">{language === 'en' ? 'Status' : 'Imiterere'}</th>
                    <th className="p-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">{language === 'en' ? 'Hospital' : 'Ibitaro'}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 5).map((u: any) => (
                    <tr key={u.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </td>
                      <td className="p-3 capitalize">{u.role}</td>
                      <td className="p-3">
                        <Badge variant={u.status === 'active' ? 'success' : 'secondary'} className="capitalize">
                          {u.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{u.hospital?.name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
