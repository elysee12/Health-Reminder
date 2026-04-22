import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Lock, Eye, EyeOff, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ProfileUpdateProps {
  sidebarItems: any[];
}

export default function ProfileUpdate({ sidebarItems }: ProfileUpdateProps) {
  const { user, language, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [formName, setFormName] = useState(user?.name || '');
  const [formEmail, setFormEmail] = useState(user?.email || '');
  const [formPhone, setFormPhone] = useState(user?.phone || '');
  const [formPassword, setFormPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName || !formEmail) {
      toast.error(language === 'en' ? 'Name and email are required' : 'Izina na imeyili birakenewe');
      return;
    }

    if (formPassword && formPassword !== formConfirmPassword) {
      toast.error(language === 'en' ? 'Passwords do not match' : "Ijambo ry'ibanga ntabwo rihura");
      return;
    }

    setIsLoading(true);
    try {
      const updateData: any = {
        name: formName,
        email: formEmail,
        phone: formPhone,
      };

      if (formPassword) {
        updateData.password = formPassword;
      }

      await api.users.update(Number(user!.id), updateData);
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      await refreshUser();      toast.success(language === 'en' ? 'Profile updated successfully' : 'Umwirondoro wahinduwe neza');

      // Navigate back to dashboard
      const dashboardPath = user?.role === 'patient' ? '/patient' : user?.role === 'provider' ? '/provider' : '/admin';
      navigate(dashboardPath);
    } catch (error: any) {
      toast.error(error.message || (language === 'en' ? 'Failed to update profile' : 'Ntabashije guhindura umwirondoro'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    const dashboardPath = user?.role === 'patient' ? '/patient' : user?.role === 'provider' ? '/provider' : '/admin';
    navigate(dashboardPath);
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {language === 'en' ? 'Back' : 'Subira inyuma'}
          </Button>
          <div>
            <h1 className="page-header">{language === 'en' ? 'Update Profile' : 'Hindura Umwirondoro'}</h1>
            <p className="text-muted-foreground">
              {language === 'en' ? 'Modify your account information' : 'Hindura imyirondoro yawe'}
            </p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {language === 'en' ? 'Profile Information' : 'Imyirondoro'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {language === 'en' ? 'Full Name' : 'Amazina Yose'}
                  </Label>
                  <Input
                    id="name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={language === 'en' ? 'Enter your full name' : 'Andika amazina yawe yose'}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {language === 'en' ? 'Email Address' : 'Aderesi ya Imeyili'}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="name@hospital.rw"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {language === 'en' ? 'Phone Number' : 'Nimero ya Telefoni'}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+250 700 000 000"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {language === 'en' ? 'Change Password' : 'Hindura Ijambo ry\'Ibanga'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === 'en'
                    ? 'Leave blank if you don\'t want to change your password'
                    : 'Reba niba udashaka guhindura ijambo ry\'ibanga'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">{language === 'en' ? 'New Password' : 'Ijambo ry\'Ibanga Rishya'}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder={language === 'en' ? 'Enter new password' : 'Andika ijambo ry\'ibanga rishya'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{language === 'en' ? 'Confirm New Password' : 'Emeza Ijambo ry\'Ibanga Rishya'}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formConfirmPassword}
                        onChange={(e) => setFormConfirmPassword(e.target.value)}
                        placeholder={language === 'en' ? 'Confirm new password' : 'Emeza ijambo ry\'ibanga rishya'}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={handleBack}>
                  {language === 'en' ? 'Cancel' : 'Hagarika'}
                </Button>
                <Button type="submit" disabled={isLoading} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isLoading ? (language === 'en' ? 'Updating...' : 'Guhindura...') : (language === 'en' ? 'Update Profile' : 'Hindura Umwirondoro')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}