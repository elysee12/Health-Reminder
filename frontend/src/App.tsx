import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import Login from "./pages/Login";
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";
import PatientReminders from "./pages/patient/PatientReminders";
import PatientHistory from "./pages/patient/PatientHistory";
import PatientGoals from "./pages/patient/PatientGoals";
import PatientSideEffects from "./pages/patient/PatientSideEffects";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientProfileUpdate from "./pages/patient/PatientProfileUpdate";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import ProviderPatients from "./pages/provider/ProviderPatients";
import ProviderPrescriptions from "./pages/provider/ProviderPrescriptions";
import ProviderReminders from "./pages/provider/ProviderReminders";
import ProviderAnalytics from "./pages/provider/ProviderAnalytics";
import ProviderGoals from "./pages/provider/ProviderGoals";
import ProviderSideEffects from "./pages/provider/ProviderSideEffects";
import ProviderAppointments from "./pages/provider/ProviderAppointments";
import ProviderSMS from "./pages/provider/ProviderSMS";
import ProviderFollowUps from "./pages/provider/ProviderFollowUps";
import ProviderProfileUpdate from "./pages/provider/ProviderProfileUpdate";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminHospitals from "./pages/admin/AdminHospitals";
import AdminInteroperability from "./pages/admin/AdminInteroperability";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProfileUpdate from "./pages/admin/AdminProfileUpdate";
import ProfileUpdate from "./components/ProfileUpdate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
            <Route path="/patient/reminders" element={<PatientReminders />} />
            <Route path="/patient/goals" element={<PatientGoals />} />
            <Route path="/patient/side-effects" element={<PatientSideEffects />} />
            <Route path="/patient/appointments" element={<PatientAppointments />} />
            <Route path="/patient/history" element={<PatientHistory />} />
            <Route path="/patient/profile" element={<PatientProfileUpdate />} />
            <Route path="/provider" element={<ProviderDashboard />} />
            <Route path="/provider/patients" element={<ProviderPatients />} />
            <Route path="/provider/prescriptions" element={<ProviderPrescriptions />} />
            <Route path="/provider/reminders" element={<ProviderReminders />} />
            <Route path="/provider/analytics" element={<ProviderAnalytics />} />
            <Route path="/provider/goals" element={<ProviderGoals />} />
            <Route path="/provider/side-effects" element={<ProviderSideEffects />} />
            <Route path="/provider/appointments" element={<ProviderAppointments />} />
            <Route path="/provider/follow-ups" element={<ProviderFollowUps />} />
            <Route path="/provider/sms" element={<ProviderSMS />} />
            <Route path="/provider/profile" element={<ProviderProfileUpdate />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/hospitals" element={<AdminHospitals />} />
            <Route path="/admin/interoperability" element={<AdminInteroperability />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/profile" element={<AdminProfileUpdate />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
