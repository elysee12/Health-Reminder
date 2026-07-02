import { useState, Dispatch, SetStateAction, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { usePatients } from '@/hooks/use-api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { LayoutDashboard, Users, Pill, Bell, BarChart3, MessageSquare, Search, Plus, Pencil, Trash2, Eye, EyeOff, Target, Calendar, UserCheck, AlertTriangle } from 'lucide-react';
import rwandaLocations from '@/assets/rwanda_locations.json';

type FormFieldsProps = {
  language: string;
  t: (key: string) => string;
  formName: string;
  setFormName: Dispatch<SetStateAction<string>>;
  formPhone: string;
  setFormPhone: Dispatch<SetStateAction<string>>;
  formEmail: string;
  setFormEmail: Dispatch<SetStateAction<string>>;
  formAge: string;
  setFormAge: Dispatch<SetStateAction<string>>;
  formGender: 'Male' | 'Female';
  setFormGender: Dispatch<SetStateAction<'Male' | 'Female'>>;
  formCommMethod: 'web' | 'ussd' | 'both';
  setFormCommMethod: Dispatch<SetStateAction<'web' | 'ussd' | 'both'>>;
  formPassword: string;
  setFormPassword: Dispatch<SetStateAction<string>>;
  formConfirmPassword: string;
  setFormConfirmPassword: Dispatch<SetStateAction<string>>;
  formPin: string;
  setFormPin: Dispatch<SetStateAction<string>>;
  formConfirmPin: string;
  setFormConfirmPin: Dispatch<SetStateAction<string>>;
  showPassword: boolean;
  setShowPassword: Dispatch<SetStateAction<boolean>>;
  showPin: boolean;
  setShowPin: Dispatch<SetStateAction<boolean>>;
  selectedProvince: string;
  setSelectedProvince: Dispatch<SetStateAction<string>>;
  selectedDistrict: string;
  setSelectedDistrict: Dispatch<SetStateAction<string>>;
  selectedSector: string;
  setSelectedSector: Dispatch<SetStateAction<string>>;
  selectedCell: string;
  setSelectedCell: Dispatch<SetStateAction<string>>;
  selectedVillage: string;
  setSelectedVillage: Dispatch<SetStateAction<string>>;
};

const FormFields = ({ language, t, formName, setFormName, formPhone, setFormPhone, formEmail, setFormEmail, formAge, setFormAge, formGender, setFormGender, formCommMethod, setFormCommMethod, formPassword, setFormPassword, formConfirmPassword, setFormConfirmPassword, formPin, setFormPin, formConfirmPin, setFormConfirmPin, showPassword, setShowPassword, showPin, setShowPin, selectedProvince, setSelectedProvince, selectedDistrict, setSelectedDistrict, selectedSector, setSelectedSector, selectedCell, setSelectedCell, selectedVillage, setSelectedVillage }: FormFieldsProps) => {
  const provinces = rwandaLocations.items;
  const selectedProvinceData = provinces.find(p => p.name === selectedProvince);
  const districts = selectedProvinceData?.districts || [];
  const selectedDistrictData = districts.find(d => d.name === selectedDistrict);
  const sectors = selectedDistrictData?.sectors || [];
  const selectedSectorData = sectors.find(s => s.name === selectedSector);
  const cells = selectedSectorData?.cells || [];
  const selectedCellData = cells.find(c => c.name === selectedCell);
  const villages = selectedCellData?.villages || [];

  return (
  <div className="grid grid-cols-2 gap-4">
    <div className="col-span-2">
      <Label>{language === 'en' ? 'Communication Method' : 'Uburyo bwo Gutumanaho'}</Label>
      <Select value={formCommMethod} onValueChange={(v) => setFormCommMethod(v as any)}>
        <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="web">{language === 'en' ? 'Web/App' : 'Web/App'}</SelectItem>
          <SelectItem value="ussd">USSD</SelectItem>
          <SelectItem value="both">{language === 'en' ? 'Both (Web + USSD)' : 'Byombi (Web + USSD)'}</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="col-span-2">
      <Label>{language === 'en' ? 'Full Name' : 'Amazina Yose'}</Label>
      <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Patient name" className="mt-1.5" />
    </div>
    <div>
      <Label>{language === 'en' ? 'Phone' : 'Telefoni'}</Label>
      <Input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+250..." className="mt-1.5" />
    </div>
    {formCommMethod !== 'ussd' && (
      <div>
        <Label>{t('email')}</Label>
        <Input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="email@example.com" className="mt-1.5" />
      </div>
    )}
    <div className={formCommMethod === 'ussd' ? 'col-span-1' : ''}>
      <Label>{language === 'en' ? 'Age' : 'Imyaka'}</Label>
      <Input type="number" value={formAge} onChange={(e) => setFormAge(e.target.value)} placeholder="25" className="mt-1.5" />
    </div>
    <div>
      <Label>{language === 'en' ? 'Gender' : 'Igitsina'}</Label>
      <Select value={formGender} onValueChange={(v) => setFormGender(v as any)}>
        <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="Male">{language === 'en' ? 'Male' : 'Gabo'}</SelectItem>
          <SelectItem value="Female">{language === 'en' ? 'Female' : 'Gore'}</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="col-span-2">
      <Label>{language === 'en' ? 'Province' : 'Intara'}</Label>
      <Select value={selectedProvince} onValueChange={(v) => { setSelectedProvince(v); setSelectedDistrict(''); setSelectedSector(''); setSelectedCell(''); setSelectedVillage(''); }}>
        <SelectTrigger className="mt-1.5"><SelectValue placeholder={language === 'en' ? 'Select Province' : 'Hitamo Intara'} /></SelectTrigger>
        <SelectContent>
          {provinces.map(province => (
            <SelectItem key={province.name} value={province.name}>{province.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    {selectedProvince && (
      <div className="col-span-2">
        <Label>{language === 'en' ? 'District' : 'Akarere'}</Label>
        <Select value={selectedDistrict} onValueChange={(v) => { setSelectedDistrict(v); setSelectedSector(''); setSelectedCell(''); setSelectedVillage(''); }}>
          <SelectTrigger className="mt-1.5"><SelectValue placeholder={language === 'en' ? 'Select District' : 'Hitamo Akarere'} /></SelectTrigger>
          <SelectContent>
            {districts.map(district => (
              <SelectItem key={district.name} value={district.name}>{district.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )}
    {selectedDistrict && (
      <div className="col-span-2">
        <Label>{language === 'en' ? 'Sector' : 'Umurenge'}</Label>
        <Select value={selectedSector} onValueChange={(v) => { setSelectedSector(v); setSelectedCell(''); setSelectedVillage(''); }}>
          <SelectTrigger className="mt-1.5"><SelectValue placeholder={language === 'en' ? 'Select Sector' : 'Hitamo Umurenge'} /></SelectTrigger>
          <SelectContent>
            {sectors.map(sector => (
              <SelectItem key={sector.name} value={sector.name}>{sector.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )}
    {selectedSector && (
      <div className="col-span-2">
        <Label>{language === 'en' ? 'Cell' : 'Akagari'}</Label>
        <Select value={selectedCell} onValueChange={(v) => { setSelectedCell(v); setSelectedVillage(''); }}>
          <SelectTrigger className="mt-1.5"><SelectValue placeholder={language === 'en' ? 'Select Cell' : 'Hitamo Akagari'} /></SelectTrigger>
          <SelectContent>
            {cells.map(cell => (
              <SelectItem key={cell.name} value={cell.name}>{cell.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )}
    {selectedCell && (
      <div className="col-span-2">
        <Label>{language === 'en' ? 'Village' : 'Umudugudu'}</Label>
        <Select value={selectedVillage} onValueChange={setSelectedVillage}>
          <SelectTrigger className="mt-1.5"><SelectValue placeholder={language === 'en' ? 'Select Village' : 'Hitamo Umudugudu'} /></SelectTrigger>
          <SelectContent>
            {villages.map(village => (
              <SelectItem key={village} value={village}>{village}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )}
    {formCommMethod === 'ussd' || formCommMethod === 'both' ? (
      <>
        <div>
          <Label>{language === 'en' ? 'PIN' : 'PIN'}</Label>
          <div className="relative mt-1.5">
            <Input type={showPin ? 'text' : 'password'} value={formPin} onChange={(e) => setFormPin(e.target.value)} placeholder="Numeric PIN" />
            <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <Label>{language === 'en' ? 'Confirm PIN' : 'Emeza PIN'}</Label>
          <div className="relative mt-1.5">
            <Input type={showPin ? 'text' : 'password'} value={formConfirmPin} onChange={(e) => setFormConfirmPin(e.target.value)} placeholder="Confirm PIN" />
            <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </>
    ) : null}
    {formCommMethod === 'web' || formCommMethod === 'both' ? (
      <>
        <div>
          <Label>{language === 'en' ? 'Password' : 'Ijambo ry\'ibanga'}</Label>
          <div className="relative mt-1.5">
            <Input type={showPassword ? 'text' : 'password'} value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder="Enter password" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <Label>{language === 'en' ? 'Confirm Password' : 'Emeza Ijambo ry\'ibanga'}</Label>
          <div className="relative mt-1.5">
            <Input type={showPassword ? 'text' : 'password'} value={formConfirmPassword} onChange={(e) => setFormConfirmPassword(e.target.value)} placeholder="Confirm password" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </>
    ) : null}
  </div>
)};

export default function ProviderPatients() {
  const { t, language, user } = useAuth();
  const queryClient = useQueryClient();
  const { data: pats = [], isLoading } = usePatients(user?.id);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formGender, setFormGender] = useState<'Male' | 'Female'>('Male');
  const [formAddress, setFormAddress] = useState('');
  const [formCommMethod, setFormCommMethod] = useState<'web' | 'ussd' | 'both'>('both');
  const [formPassword, setFormPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');
  const [formPin, setFormPin] = useState('');
  const [formConfirmPin, setFormConfirmPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedCell, setSelectedCell] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');

  // Combine address parts when any changes
  useEffect(() => {
    const parts = [selectedProvince, selectedDistrict, selectedSector, selectedCell, selectedVillage].filter(Boolean);
    setFormAddress(parts.join(', '));
  }, [selectedProvince, selectedDistrict, selectedSector, selectedCell, selectedVillage]);

  const filtered = pats.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search));

  const resetForm = () => { setFormName(''); setFormPhone(''); setFormEmail(''); setFormAge(''); setFormGender('Male'); setFormAddress(''); setFormCommMethod('both'); setFormPassword(''); setFormConfirmPassword(''); setFormPin(''); setFormConfirmPin(''); setShowPassword(false); setShowPin(false); setSelectedProvince(''); setSelectedDistrict(''); setSelectedSector(''); setSelectedCell(''); setSelectedVillage(''); };

  const handleAdd = async () => {
    if (!formName.trim()) { toast.error(language === 'en' ? 'Please enter patient name' : 'Injiza izina ry\'umurwayi'); return; }
    
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!formPhone.trim() || !phoneRegex.test(formPhone.replace(/\s/g, ''))) {
      toast.error(language === 'en' ? 'Please enter a valid phone number (10-15 digits)' : 'Injiza telefoni yo kweza (ibibare 10-15)');
      return;
    }

    if (formEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) {
      toast.error(language === 'en' ? 'Please enter a valid email address' : 'Injiza imeyili yo kweza');
      return;
    }
    
    if (!formAge || Number(formAge) <= 0 || Number(formAge) > 150) {
      toast.error(language === 'en' ? 'Please enter a valid age (1-150)' : 'Injiza imyaka yo kweza (1-150)');
      return;
    }

    if (!formAddress) { toast.error(language === 'en' ? 'Please select a complete address' : 'Hitamo aderesi yuzuye'); return; }

    if (formCommMethod === 'ussd' || formCommMethod === 'both') {
      if (!formPin || formPin.length < 4) {
        toast.error(language === 'en' ? 'PIN must be at least 4 digits' : 'PIN rigomba kuba ubusa bwa 4');
        return;
      }
      if (formPin !== formConfirmPin) {
        toast.error(language === 'en' ? 'PINs must match' : 'PIN zigomba guhura');
        return;
      }
    }

    if (formCommMethod === 'web' || formCommMethod === 'both') {
      if (!formPassword || formPassword.length < 6) {
        toast.error(language === 'en' ? 'Password must be at least 6 characters' : 'Ijambo ry\'ibanga rigomba kuba ubusa bwa 6');
        return;
      }
      if (formPassword !== formConfirmPassword) {
        toast.error(language === 'en' ? 'Passwords must match' : 'Ijambo ry\'ibanga rigomba guhura');
        return;
      }
    }

    try {
      await api.patients.create({
        name: formName,
        phone: formPhone,
        email: formEmail || undefined,
        age: Number(formAge),
        gender: formGender,
        address: formAddress,
        registeredDate: new Date().toISOString(),
        communicationMethod: formCommMethod,
        password: (formCommMethod === 'web' || formCommMethod === 'both') ? formPassword : undefined,
        pin: (formCommMethod === 'ussd' || formCommMethod === 'both') ? formPin : undefined,
        hospitalId: user?.hospitalId,
        registeredByUserId: user?.id,
        registeredByHospitalId: user?.hospitalId,
      });
      await queryClient.invalidateQueries(['patients']);
      resetForm(); setAddOpen(false);
      toast.success(language === 'en' ? 'Patient registered successfully' : 'Umurwayi yanditswe neza');
    } catch (error: any) {
      toast.error(error.message || (language === 'en' ? 'Unable to register patient' : 'Ntabashije kwandika umurwayi'));
    }
  };

  const openEdit = (p: any) => {
    setSelected(p); setFormName(p.name); setFormPhone(p.phone); setFormEmail(p.email);
    setFormAge(String(p.age)); setFormGender(p.gender); setFormAddress(p.address); setFormCommMethod(p.communicationMethod);
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selected) return;

    if (!formName.trim()) { toast.error(language === 'en' ? 'Please enter patient name' : 'Injiza izina ry\'umurwayi'); return; }
    
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!formPhone.trim() || !phoneRegex.test(formPhone.replace(/\s/g, ''))) {
      toast.error(language === 'en' ? 'Please enter a valid phone number (10-15 digits)' : 'Injiza telefoni yo kweza (ibibare 10-15)');
      return;
    }

    if (formEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) {
      toast.error(language === 'en' ? 'Please enter a valid email address' : 'Injiza imeyili yo kweza');
      return;
    }
    
    if (!formAge || Number(formAge) <= 0 || Number(formAge) > 150) {
      toast.error(language === 'en' ? 'Please enter a valid age (1-150)' : 'Injiza imyaka yo kweza (1-150)');
      return;
    }

    try {
      await api.patients.update(selected.id, {
        name: formName,
        phone: formPhone,
        email: formEmail || undefined,
        age: Number(formAge),
        gender: formGender,
        address: formAddress,
        communicationMethod: formCommMethod,
      });
      await queryClient.invalidateQueries(['patients']);
      resetForm(); setEditOpen(false); setSelected(null);
      toast.success(language === 'en' ? 'Patient updated' : 'Umurwayi yahinduwe');
    } catch (error: any) {
      toast.error(error.message || (language === 'en' ? 'Unable to update patient' : 'Ntabashije guhindura umurwayi'));
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await api.patients.remove(selected.id);
      await queryClient.invalidateQueries(['patients']);
      setDeleteOpen(false); setSelected(null);
      toast.success(language === 'en' ? 'Patient deleted' : 'Umurwayi yasibwe');
    } catch (error) {
      toast.error(language === 'en' ? 'Unable to delete patient' : 'Ntabashije gusiba umurwayi');
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-header">{t('patients')}</h1>
          <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />{language === 'en' ? 'Register Patient' : 'Andikisha Umurwayi'}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6"> 
              <DialogHeader><DialogTitle className="font-heading">{language === 'en' ? 'Register New Patient' : 'Andikisha Umurwayi Mushya'}</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }} className="space-y-4">
                <FormFields 
                  language={language} 
                  t={t}
                  formName={formName} setFormName={setFormName}
                  formPhone={formPhone} setFormPhone={setFormPhone}
                  formEmail={formEmail} setFormEmail={setFormEmail}
                  formAge={formAge} setFormAge={setFormAge}
                  formGender={formGender} setFormGender={setFormGender}
                  formCommMethod={formCommMethod} setFormCommMethod={setFormCommMethod}
                  formPassword={formPassword} setFormPassword={setFormPassword}
                  formConfirmPassword={formConfirmPassword} setFormConfirmPassword={setFormConfirmPassword}
                  formPin={formPin} setFormPin={setFormPin}
                  formConfirmPin={formConfirmPin} setFormConfirmPin={setFormConfirmPin}
                  showPassword={showPassword} setShowPassword={setShowPassword}
                  showPin={showPin} setShowPin={setShowPin}
                  selectedProvince={selectedProvince} setSelectedProvince={setSelectedProvince}
                  selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict}
                  selectedSector={selectedSector} setSelectedSector={setSelectedSector}
                  selectedCell={selectedCell} setSelectedCell={setSelectedCell}
                  selectedVillage={selectedVillage} setSelectedVillage={setSelectedVillage}
                />
                <DialogFooter className="mt-4">
                  <DialogClose asChild><Button type="button" variant="outline">{language === 'en' ? 'Cancel' : 'Hagarika'}</Button></DialogClose>
                  <Button type="submit">{language === 'en' ? 'Register' : 'Andikisha'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={language === 'en' ? 'Search patients...' : 'Shakisha abarwayi...'} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{p.name.charAt(0)}</div>
                  <div>
                    <div className="font-semibold text-card-foreground">{p.name}</div>
                    <div className="text-sm text-muted-foreground">{p.phone}</div>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>{language === 'en' ? 'Age' : 'Imyaka'}: {p.age} · {p.gender}</div>
                  <div>{p.address}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="badge-success">{p.communicationMethod}</span>
                    <span className={`font-semibold ${p.adherenceRate >= 80 ? 'text-success' : p.adherenceRate >= 60 ? 'text-warning' : 'text-destructive'}`}>{p.adherenceRate}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3 justify-end border-t pt-2">
                  <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs" onClick={() => openEdit(p)}><Pencil className="h-3 w-3" />{language === 'en' ? 'Edit' : 'Hindura'}</Button>
                  <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs text-destructive hover:text-destructive" onClick={() => { setSelected(p); setDeleteOpen(true); }}><Trash2 className="h-3 w-3" />{language === 'en' ? 'Delete' : 'Siba'}</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) { resetForm(); setSelected(null); } }}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-6">
              <DialogHeader><DialogTitle className="font-heading">{language === 'en' ? 'Edit Patient' : 'Hindura Umurwayi'}</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }} className="space-y-4">
                <FormFields 
                  language={language} 
                  t={t}
                  formName={formName} setFormName={setFormName}
                  formPhone={formPhone} setFormPhone={setFormPhone}
                  formEmail={formEmail} setFormEmail={setFormEmail}
                  formAge={formAge} setFormAge={setFormAge}
                  formGender={formGender} setFormGender={setFormGender}
                  formCommMethod={formCommMethod} setFormCommMethod={setFormCommMethod}
                  formPassword={formPassword} setFormPassword={setFormPassword}
                  formConfirmPassword={formConfirmPassword} setFormConfirmPassword={setFormConfirmPassword}
                  formPin={formPin} setFormPin={setFormPin}
                  formConfirmPin={formConfirmPin} setFormConfirmPin={setFormConfirmPin}
                  showPassword={showPassword} setShowPassword={setShowPassword}
                  showPin={showPin} setShowPin={setShowPin}
                  selectedProvince={selectedProvince} setSelectedProvince={setSelectedProvince}
                  selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict}
                  selectedSector={selectedSector} setSelectedSector={setSelectedSector}
                  selectedCell={selectedCell} setSelectedCell={setSelectedCell}
                  selectedVillage={selectedVillage} setSelectedVillage={setSelectedVillage}
                />
                <DialogFooter className="mt-4">
                  <DialogClose asChild><Button type="button" variant="outline">{language === 'en' ? 'Cancel' : 'Hagarika'}</Button></DialogClose>
                  <Button type="submit">{language === 'en' ? 'Save Changes' : 'Bika Impinduka'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
        </Dialog>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-heading">{language === 'en' ? 'Delete Patient' : 'Siba Umurwayi'}</DialogTitle></DialogHeader>
            <p className="text-muted-foreground">{language === 'en' ? `Are you sure you want to delete "${selected?.name}"?` : `Urizeye ko ushaka gusiba "${selected?.name}"?`}</p>
            <DialogFooter className="mt-4">
              <DialogClose asChild><Button variant="outline">{language === 'en' ? 'Cancel' : 'Hagarika'}</Button></DialogClose>
              <Button variant="destructive" onClick={handleDelete}>{language === 'en' ? 'Delete' : 'Siba'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
