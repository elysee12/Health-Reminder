import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutDashboard, Users, Building2, Settings, Plus, Search, Shield, Stethoscope, User, Pencil, Trash2, UserPlus, Network, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUsers } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

const roleIcon = { admin: Shield, provider: Stethoscope, patient: User };

export default function AdminUsers() {
  const { user, t, language } = useAuth();
  const { data: users = [], isLoading, refetch } = useUsers();
  
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<any>('patient');
  const [formStatus, setFormStatus] = useState<any>('active');
  const [formReason, setFormReason] = useState('');

  const createMutation = useMutation({
    mutationFn: api.users.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setAddOpen(false);
      resetForm();
      toast.success(language === 'en' ? 'User added successfully' : 'Umukoresha yongeywe neza');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.users.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditOpen(false);
      resetForm();
      toast.success(language === 'en' ? 'User updated successfully' : 'Umukoresha yahinduwe neza');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.users.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteOpen(false);
      toast.success(language === 'en' ? 'User deleted successfully' : 'Umukoresha yasibwe neza');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const filtered = users.filter(
    (u: any) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormName(''); setFormEmail(''); setFormPhone(''); setFormRole('patient'); setFormStatus('active'); setFormReason('');
  };

  const handleAdd = () => {
    if (!formName || !formEmail) {
      toast.error(language === 'en' ? 'Name and email are required' : 'Izina na imeyili birakenewe');
      return;
    }
    createMutation.mutate({ name: formName, email: formEmail, phone: formPhone, role: formRole, status: formStatus, reason: formReason });
  };

  const openEdit = (user: any) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone || '');
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormReason(user.reason || '');
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!selectedUser || !formName || !formEmail) return;
    updateMutation.mutate({ 
      id: selectedUser.id, 
      data: { name: formName, email: formEmail, phone: formPhone, role: formRole, status: formStatus, reason: formReason } 
    });
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    deleteMutation.mutate(selectedUser.id);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-header">{t('users')}</h1>
            <p className="text-muted-foreground">{language === 'en' ? 'Manage system access and permissions' : 'Gucunga uruhushya rwo kwinjira muri sisitemu'}</p>
          </div>
          <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />{language === 'en' ? 'Add User' : 'Ongeraho Umukoresha'}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading">{language === 'en' ? 'Add New User' : 'Ongeraho Umukoresha Mushya'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{language === 'en' ? 'Full Name' : 'Amazina Yose'}</Label>
                  <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input id="email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{language === 'en' ? 'Phone' : 'Nimero ya Terefone'}</Label>
                  <Input id="phone" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Role' : 'Uruhare'}</Label>
                    <Select value={formRole} onValueChange={(v: any) => setFormRole(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="provider">Provider</SelectItem>
                        <SelectItem value="patient">Patient</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'en' ? 'Status' : 'Imiterere'}</Label>
                    <Select value={formStatus} onValueChange={(v: any) => setFormStatus(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">{language === 'en' ? 'Reason for Access' : 'Impamvu yo Gusaba'}</Label>
                  <Input id="reason" value={formReason} onChange={(e) => setFormReason(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>{language === 'en' ? 'Cancel' : 'Reka'}</Button>
                <Button onClick={handleAdd} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {language === 'en' ? 'Create' : 'Rema'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={language === 'en' ? "Search by name or email..." : "Shakisha mu mazina cyangwa imeyili..."}
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading users...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">{language === 'en' ? 'User' : 'Umukoresha'}</th>
                      <th className="p-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">{language === 'en' ? 'Role' : 'Uruhare'}</th>
                      <th className="p-3 font-medium text-muted-foreground uppercase text-xs tracking-wider">{language === 'en' ? 'Status' : 'Imiterere'}</th>
                      <th className="p-3 font-medium text-muted-foreground uppercase text-xs tracking-wider text-right">{language === 'en' ? 'Actions' : 'Ibikorwa'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u: any) => {
                      const Icon = roleIcon[u.role as keyof typeof roleIcon] || User;
                      return (
                        <tr key={u.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div>
                                <div className="font-medium text-card-foreground">{u.name}</div>
                                <div className="text-xs text-muted-foreground">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 capitalize">{u.role}</td>
                          <td className="p-3">
                            <Badge 
                              variant={u.status === 'active' ? 'success' : u.status === 'pending' ? 'warning' : 'secondary'} 
                              className="capitalize"
                            >
                              {u.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => openEdit(u)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { setSelectedUser(u); setDeleteOpen(true); }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">{language === 'en' ? 'Edit User' : 'Hindura Umukoresha'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{language === 'en' ? 'Full Name' : 'Amazina Yose'}</Label>
              <Input id="edit-name" value={formName} onChange={(e) => setFormName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">{t('email')}</Label>
              <Input id="edit-email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">{language === 'en' ? 'Phone' : 'Nimero ya Terefone'}</Label>
              <Input id="edit-phone" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'en' ? 'Role' : 'Uruhare'}</Label>
                <Select value={formRole} onValueChange={(v: any) => setFormRole(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="provider">Provider</SelectItem>
                    <SelectItem value="patient">Patient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                  <Label>{language === 'en' ? 'Status' : 'Imiterere'}</Label>
                  <Select value={formStatus} onValueChange={(v: any) => setFormStatus(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-reason">{language === 'en' ? 'Reason for Access' : 'Impamvu yo Gusaba'}</Label>
                <Input id="edit-reason" value={formReason} onChange={(e) => setFormReason(e.target.value)} />
              </div>
            </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>{language === 'en' ? 'Cancel' : 'Reka'}</Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {language === 'en' ? 'Update' : 'Hindura'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">{language === 'en' ? 'Delete User' : 'Siba Umukoresha'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              {language === 'en' 
                ? `Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.` 
                : `Wizera neza ko ushaka gusiba ${selectedUser?.name}? Iki gikorwa ntigishobora gusubirwamo.`}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>{language === 'en' ? 'Cancel' : 'Reka'}</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {language === 'en' ? 'Delete' : 'Siba'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
