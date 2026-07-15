import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LayoutDashboard, Users, Building2, Settings, Save, Bell, MessageSquare, Globe, Shield, UserPlus, Network } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { user, t, language } = useAuth();

  const [systemName, setSystemName] = useState('mHealth Hypertension Reminder System');
  const [adminEmail, setAdminEmail] = useState('admin@mhealth.rw');
  const [defaultLang, setDefaultLang] = useState('en');
  const [supportPhone, setSupportPhone] = useState('+250 788 000 100');
  const [supportSms, setSupportSms] = useState('+250 722 000 200');
  const [supportEmail, setSupportEmail] = useState('support@mhealth.rw');

  const [smsEnabled, setSmsEnabled] = useState(true);
  const [smsProvider, setSmsProvider] = useState('twilio');
  const [smsTemplate, setSmsTemplate] = useState('');

  const [emailNotif, setEmailNotif] = useState(true);
  const [webNotif, setWebNotif] = useState(true);
  const [missedAlert, setMissedAlert] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState('70');
  const [bpAlerts, setBpAlerts] = useState(true);

  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [requireApproval, setRequireApproval] = useState(true);

  const handleSave = (section: string) => {
    toast.success(language === 'en' ? `${section} settings saved successfully` : `Igenamiterere ry'${section} ryabitswe neza`);
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <h1 className="page-header">{language === 'en' ? 'System Settings' : "Igenamiterere ry'Sisitemu"}</h1>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2"><Globe className="h-5 w-5 text-primary" />{language === 'en' ? 'General Settings' : 'Igenamiterere Rusange'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><Label>{language === 'en' ? 'System Name' : "Izina ry'Sisitemu"}</Label><Input value={systemName} onChange={(e) => setSystemName(e.target.value)} className="mt-1.5 max-w-md" /></div>
            <div><Label>{language === 'en' ? 'System Admin Email' : "Imeyili y'Umuyobozi wa Sisitemu"}</Label><Input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="mt-1.5 max-w-md" /></div>
            <div>
              <Label>{language === 'en' ? 'Default Language' : 'Ururimi Mbonezamubano'}</Label>
              <Select value={defaultLang} onValueChange={setDefaultLang}>
                <SelectTrigger className="mt-1.5 max-w-md"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="rw">Kinyarwanda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => handleSave('General')} className="gap-2"><Save className="h-4 w-4" />{language === 'en' ? 'Save' : 'Bika'}</Button>
          </CardContent>
        </Card>

        {/* Support Contact (for SMS footers) */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" />{language === 'en' ? 'Support Contact Details (SMS Footer)' : "Amakuru y'Ubufasha (mu SMS)"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{language === 'en' ? 'These details are automatically appended to all outgoing SMS messages.' : "Aya makuru ashyirwa mu butumwa bwose bwa SMS bwoherezwa."}</p>
            <div><Label>{language === 'en' ? 'Support Phone' : 'Telefoni y\'Ubufasha'}</Label><Input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} className="mt-1.5 max-w-md" /></div>
            <div><Label>{language === 'en' ? 'Support SMS Number' : 'Numero ya SMS y\'Ubufasha'}</Label><Input value={supportSms} onChange={(e) => setSupportSms(e.target.value)} className="mt-1.5 max-w-md" /></div>
            <div><Label>{language === 'en' ? 'Support Email' : 'Imeyili y\'Ubufasha'}</Label><Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="mt-1.5 max-w-md" /></div>
            <div className="bg-muted p-3 rounded-lg text-sm">
              <div className="font-medium text-card-foreground mb-1">{language === 'en' ? 'SMS Footer Preview:' : 'Igaragara mu SMS:'}</div>
              <div className="text-muted-foreground font-mono text-xs">---<br/>For support: Call {supportPhone} | SMS: {supportSms} | Email: {supportEmail}</div>
            </div>
            <Button onClick={() => handleSave('Support Contact')} className="gap-2"><Save className="h-4 w-4" />{language === 'en' ? 'Save' : 'Bika'}</Button>
          </CardContent>
        </Card>

        {/* SMS Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" />{language === 'en' ? 'SMS Configuration' : 'Igena SMS'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between max-w-md">
              <Label>{language === 'en' ? 'Enable SMS Reminders' : 'Gufungura Ibibutsa bya SMS'}</Label>
              <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
            </div>
            <div>
              <Label>{language === 'en' ? 'SMS Provider' : 'Utanga SMS'}</Label>
              <Select value={smsProvider} onValueChange={setSmsProvider}>
                <SelectTrigger className="mt-1.5 max-w-md"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="twilio">Twilio</SelectItem>
                  <SelectItem value="africas_talking">Africa's Talking</SelectItem>
                  <SelectItem value="pindo">Pindo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{language === 'en' ? 'SMS Template (with support footer)' : 'Icyitegererezo cya SMS (hamwe n\'ubufasha)'}</Label>
              <Textarea value={smsTemplate} onChange={(e) => setSmsTemplate(e.target.value)} className="mt-1.5 max-w-md" rows={5} />
              <p className="text-xs text-muted-foreground mt-1">{language === 'en' ? 'Variables: {patient_name}, {medication}, {dosage}, {time}' : 'Impinduka: {patient_name}, {medication}, {dosage}, {time}'}</p>
            </div>
            <Button onClick={() => handleSave('SMS')} className="gap-2"><Save className="h-4 w-4" />{language === 'en' ? 'Save' : 'Bika'}</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />{language === 'en' ? 'Notification Settings' : "Igenamiterere ry'Imenyesha"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between max-w-md">
              <Label>{language === 'en' ? 'Email Notifications' : "Imenyesha y'Imeyili"}</Label>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </div>
            <div className="flex items-center justify-between max-w-md">
              <Label>{language === 'en' ? 'Web Push Notifications' : 'Imenyesha ya Web'}</Label>
              <Switch checked={webNotif} onCheckedChange={setWebNotif} />
            </div>
            <div className="flex items-center justify-between max-w-md">
              <Label>{language === 'en' ? 'Missed Dose Alerts' : "Imenyesha y'Imiti Yaburiwe"}</Label>
              <Switch checked={missedAlert} onCheckedChange={setMissedAlert} />
            </div>
            <div className="flex items-center justify-between max-w-md">
              <Label>{language === 'en' ? 'High Blood Pressure Alerts' : "Imenyesha y'Umuvuduko w'Amaraso Munini"}</Label>
              <Switch checked={bpAlerts} onCheckedChange={setBpAlerts} />
            </div>
            <div>
              <Label>{language === 'en' ? 'Low Adherence Threshold (%)' : "Igipimo cy'Ubukurikire Buke (%)"}</Label>
              <Input type="number" value={alertThreshold} onChange={(e) => setAlertThreshold(e.target.value)} className="mt-1.5 max-w-[120px]" min="0" max="100" />
            </div>
            <Button onClick={() => handleSave('Notification')} className="gap-2"><Save className="h-4 w-4" />{language === 'en' ? 'Save' : 'Bika'}</Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />{language === 'en' ? 'Security & Access Control' : "Umutekano n'Igenzura ry'Ubwinjire"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between max-w-md">
              <Label>{language === 'en' ? 'Two-Factor Authentication' : 'Kwemeza Inshuro Ebyiri'}</Label>
              <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
            </div>
            <div className="flex items-center justify-between max-w-md">
              <Label>{language === 'en' ? 'Require System Admin Approval for New Users' : 'Gusaba Kwemezwa n\'Umuyobozi wa Sisitemu ku Bakoresha Bashya'}</Label>
              <Switch checked={requireApproval} onCheckedChange={setRequireApproval} />
            </div>
            <div>
              <Label>{language === 'en' ? 'Session Timeout (minutes)' : "Igihe cy'Imikoranire (iminota)"}</Label>
              <Input type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} className="mt-1.5 max-w-[120px]" min="5" max="120" />
            </div>
            <Button onClick={() => handleSave('Security')} className="gap-2"><Save className="h-4 w-4" />{language === 'en' ? 'Save' : 'Bika'}</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
