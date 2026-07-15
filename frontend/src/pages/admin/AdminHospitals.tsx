import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { LayoutDashboard, Users, Building2, Settings, Plus, Search, Pencil, Trash2, MapPin, UserPlus, Network, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useHospitals } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

export default function AdminHospitals() {
  const { user, t, language } = useAuth();
  const queryClient = useQueryClient();
  const { data: hospitals = [], isLoading, refetch } = useHospitals();
  
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  const [formName, setFormName] = useState('');
  const [formDistrict, setFormDistrict] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');

  const createMutation = useMutation({
    mutationFn: api.hospitals.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      setAddOpen(false);
      resetForm();
      toast.success(language === 'en' ? 'Hospital added successfully' : 'Ibitaro byongeywe neza');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.hospitals.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      setEditOpen(false);
      resetForm();
      toast.success(language === 'en' ? 'Hospital updated successfully' : 'Ibitaro byahinduwe neza');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: api.hospitals.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      setDeleteOpen(false);
      toast.success(language === 'en' ? 'Hospital deleted successfully' : 'Ibitaro byasibwe neza');
    },
    onError: (error: any) => toast.error(error.message),
  });

  const filtered = hospitals.filter((h: any) => h.name.toLowerCase().includes(search.toLowerCase()) || h.district.toLowerCase().includes(search.toLowerCase()));

  const resetForm = () => { setFormName(''); setFormDistrict(''); setFormAddress(''); setFormPhone(''); };

  const handleAdd = () => {
    if (!formName || !formDistrict) { toast.error(language === 'en' ? 'Name and district are required' : 'Izina n\'akarere birakenewe'); return; }
    createMutation.mutate({ name: formName, district: formDistrict, address: formAddress, phone: formPhone });
  };

  const openEdit = (h: any) => {
    setSelected(h); setFormName(h.name); setFormDistrict(h.district); setFormAddress(h.address); setFormPhone(h.phone); setEditOpen(true);
  };

  const handleEdit = () => {
    if (!selected) return;
    updateMutation.mutate({ 
      id: selected.id, 
      data: { name: formName, district: formDistrict, address: formAddress, phone: formPhone } 
    });
  };

  const handleDelete = () => {
    if (!selected) return;
    deleteMutation.mutate(selected.id);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-header">{language === 'en' ? 'Hospitals' : 'Ibitaro'}</h1>
          <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />{language === 'en' ? 'Add Hospital' : 'Ongeraho Ibitaro'}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{language === 'en' ? 'Add Hospital' : 'Ongeraho Ibitaro'}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>{language === 'en' ? 'Hospital Name' : 'Izina ry\'Ibitaro'}</Label><Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder={language === 'en' ? "Hospital name" : "Izina ry'ibitaro"} className="mt-1.5" /></div>
                <div><Label>{language === 'en' ? 'District' : 'Akarere'}</Label><Input value={formDistrict} onChange={(e) => setFormDistrict(e.target.value)} placeholder={language === 'en' ? "District" : "Akarere"} className="mt-1.5" /></div>
                <div><Label>{language === 'en' ? 'Address' : 'Aderesi'}</Label><Input value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder={language === 'en' ? "Full address" : "Aderesi yose"} className="mt-1.5" /></div>
                <div><Label>{language === 'en' ? 'Phone' : 'Telefoni'}</Label><Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+250..." className="mt-1.5" /></div>
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setAddOpen(false)}>{language === 'en' ? 'Cancel' : 'Reka'}</Button>
                <Button onClick={handleAdd} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {language === 'en' ? 'Create' : 'Rema'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={language === 'en' ? "Search hospitals..." : "Shakisha ibitaro..."} className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading hospitals...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((h: any) => (
              <Card key={h.id} className="overflow-hidden hover:shadow-md transition-all">
                <CardContent className="p-0">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <Badge variant={h.status === 'active' ? 'default' : 'secondary'}>{h.status}</Badge>
                    </div>
                    <h3 className="font-heading font-bold text-lg mb-1">{h.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-3.5 w-3.5" />
                      {h.district}, {h.address}
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">{language === 'en' ? 'Patients' : 'Abarwayi'}</div>
                        <div className="font-bold text-lg">{h._count?.patients || 0}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">{language === 'en' ? 'Healthcare Providers' : 'Abaganga b\'Ubuzima Rusange'}</div>
                        <div className="font-bold text-lg">{h._count?.providers || 0}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 px-5 py-3 flex justify-end gap-2 border-t">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(h)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => { setSelected(h); setDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) resetForm(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{language === 'en' ? 'Edit Hospital' : 'Hindura Ibitaro'}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>{language === 'en' ? 'Hospital Name' : 'Izina ry\'Ibitaro'}</Label><Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder={language === 'en' ? "Hospital name" : "Izina ry'ibitaro"} className="mt-1.5" /></div>
            <div><Label>{language === 'en' ? 'District' : 'Akarere'}</Label><Input value={formDistrict} onChange={(e) => setFormDistrict(e.target.value)} placeholder={language === 'en' ? "District" : "Akarere"} className="mt-1.5" /></div>
            <div><Label>{language === 'en' ? 'Address' : 'Aderesi'}</Label><Input value={formAddress} onChange={(e) => setFormAddress(e.target.value)} placeholder={language === 'en' ? "Full address" : "Aderesi yose"} className="mt-1.5" /></div>
            <div><Label>{language === 'en' ? 'Phone' : 'Telefoni'}</Label><Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+250..." className="mt-1.5" /></div>
          </div>
          <DialogFooter className="mt-6">
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
        <DialogContent>
          <DialogHeader><DialogTitle>{language === 'en' ? 'Delete Hospital' : 'Siba Ibitaro'}</DialogTitle></DialogHeader>
          <div className="py-4"><p>{language === 'en' ? `Are you sure you want to delete ${selected?.name}?` : `Wizera neza ko ushaka gusiba ${selected?.name}?`}</p></div>
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
