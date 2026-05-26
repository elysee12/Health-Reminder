import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutDashboard, Users, Building2, Settings, UserPlus, Network, Plus, RefreshCw, Key, Plug, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useExternalSystems, useApiKeys } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminInteroperability() {
  const { user, t, language } = useAuth();
  const queryClient = useQueryClient();
  const { data: systems = [], isLoading: systemsLoading } = useExternalSystems();
  const { data: apiKeys = [], isLoading: apiKeysLoading } = useApiKeys();
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('');
  const [newProtocol, setNewProtocol] = useState('HL7 FHIR R4');

  const connectedCount = systems.filter((s: any) => s.status === 'connected').length;

  if (systemsLoading || apiKeysLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">Loading interoperability data...</div>
      </DashboardLayout>
    );
  }

  const handleSync = async (id: string) => {
    await api.externalSystems.update(id, { lastSync: new Date().toISOString().replace('T', ' ').slice(0, 16) });
    await queryClient.invalidateQueries({ queryKey: ['external-systems'] });
    toast.success(language === 'en' ? 'Sync initiated successfully' : 'Guhuza byatangiye neza');
  };

  const handleToggle = async (id: string, currentStatus: string) => {
    await api.externalSystems.update(id, { status: currentStatus === 'connected' ? 'disconnected' : 'connected' });
    await queryClient.invalidateQueries({ queryKey: ['external-systems'] });
    toast.success(language === 'en' ? 'Connection status updated' : 'Imimerere y\'ihuza yahinduwe');
  };

  const handleAddSystem = async () => {
    if (!newName || !newType) { toast.error(language === 'en' ? 'Fill required fields' : 'Uzuza imyanya ikenewe'); return; }
    await api.externalSystems.create({ name: newName, type: newType, status: 'disconnected', lastSync: 'Never', protocol: newProtocol });
    await queryClient.invalidateQueries({ queryKey: ['external-systems'] });
    setNewName(''); setNewType(''); setAddOpen(false);
    toast.success(language === 'en' ? 'External system added' : 'Sisitemu y\'inyuma yongeywe');
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-header">{language === 'en' ? 'Interoperability' : 'Gukorana na Sisitemu'}</h1>
            <p className="text-muted-foreground">{language === 'en' ? 'Manage external system integrations and data exchange' : "Gucunga ihuza rya sisitemu z'inyuma no guhana amakuru"}</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" />{language === 'en' ? 'Add System' : 'Ongeraho Sisitemu'}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-heading">{language === 'en' ? 'Connect External System' : "Huza Sisitemu y'Inyuma"}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>{language === 'en' ? 'System Name' : "Izina rya Sisitemu"}</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. OpenMRS, DHIS2" className="mt-1.5" /></div>
                <div><Label>{language === 'en' ? 'System Type' : "Ubwoko bwa Sisitemu"}</Label><Input value={newType} onChange={(e) => setNewType(e.target.value)} placeholder="e.g. Electronic Medical Records" className="mt-1.5" /></div>
                <div>
                  <Label>{language === 'en' ? 'Protocol' : 'Ubwoko bw\'Ihuza'}</Label>
                  <Select value={newProtocol} onValueChange={setNewProtocol}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HL7 FHIR R4">HL7 FHIR R4</SelectItem>
                      <SelectItem value="REST API">REST API</SelectItem>
                      <SelectItem value="HTTP/REST">HTTP/REST</SelectItem>
                      <SelectItem value="HL7 v2.5">HL7 v2.5</SelectItem>
                      <SelectItem value="SOAP/XML">SOAP/XML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild><Button variant="outline">{language === 'en' ? 'Cancel' : 'Hagarika'}</Button></DialogClose>
                <Button onClick={handleAddSystem}>{language === 'en' ? 'Connect' : 'Huza'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="text-2xl font-bold font-heading text-card-foreground">{systems.length}</div>
            <div className="text-sm text-muted-foreground">{language === 'en' ? 'Total Systems' : 'Sisitemu Zose'}</div>
          </div>
          <div className="stat-card">
            <div className="text-2xl font-bold font-heading text-success">{connectedCount}</div>
            <div className="text-sm text-muted-foreground">{language === 'en' ? 'Connected' : 'Zihujwe'}</div>
          </div>
          <div className="stat-card">
            <div className="text-2xl font-bold font-heading text-warning">{systems.length - connectedCount}</div>
            <div className="text-sm text-muted-foreground">{language === 'en' ? 'Disconnected' : 'Zitahujwe'}</div>
          </div>
          <div className="stat-card">
            <div className="text-2xl font-bold font-heading text-primary">{apiKeys.length}</div>
            <div className="text-sm text-muted-foreground">{language === 'en' ? 'API Keys' : 'Urufunguzo rwa API'}</div>
          </div>
        </div>

        {/* Connected Systems */}
        <Card>
          <CardHeader><CardTitle className="font-heading flex items-center gap-2"><Plug className="h-5 w-5 text-primary" />{language === 'en' ? 'Connected Systems' : "Sisitemu Zihujwe"}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systems.map((sys) => (
                <div key={sys.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sys.status === 'connected' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {sys.status === 'connected' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-medium text-card-foreground">{sys.name}</div>
                      <div className="text-sm text-muted-foreground">{sys.type} · {sys.protocol}</div>
                      <div className="text-xs text-muted-foreground">{language === 'en' ? 'Last sync' : 'Guhuza kwa nyuma'}: {sys.lastSync}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleSync(sys.id)} className="gap-1">
                      <RefreshCw className="h-3.5 w-3.5" />{language === 'en' ? 'Sync' : 'Huza'}
                    </Button>
                    <Button variant={sys.status === 'connected' ? 'destructive' : 'default'} size="sm" onClick={() => handleToggle(sys.id)}>
                      {sys.status === 'connected' ? (language === 'en' ? 'Disconnect' : 'Hagarika') : (language === 'en' ? 'Connect' : 'Huza')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader><CardTitle className="font-heading flex items-center gap-2"><Key className="h-5 w-5 text-primary" />{language === 'en' ? 'API Keys' : "Urufunguzo rwa API"}</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">{language === 'en' ? 'Name' : 'Izina'}</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">{language === 'en' ? 'Created' : 'Yaremwe'}</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">{language === 'en' ? 'Last Used' : 'Yakoreshejwe'}</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">{language === 'en' ? 'Status' : 'Imimerere'}</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((key) => (
                  <tr key={key.id} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium text-card-foreground">{key.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{key.created}</td>
                    <td className="py-3 px-4 text-muted-foreground">{key.lastUsed}</td>
                    <td className="py-3 px-4"><span className="badge-success">{key.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
