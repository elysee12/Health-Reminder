import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import Login from "./pages/Login";
import Index from "./pages/Index";
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
import ProviderReports from "./pages/provider/ProviderReports";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminHospitals from "./pages/admin/AdminHospitals";
import AdminInteroperability from "./pages/admin/AdminInteroperability";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProfileUpdate from "./pages/admin/AdminProfileUpdate";
import AdminReports from "./pages/admin/AdminReports";
import ProfileUpdate from "./components/ProfileUpdate";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={getDashboardPath(user.role)} replace /> : <Login />} />
      <Route path="/home" element={<Navigate to={user ? getDashboardPath(user.role) : "/"} replace />} />
      
      {/* Patient Routes */}
      <Route path="/patient" element={
        <ProtectedRoute allowedRoles={["patient"]}>
          <PatientDashboard />
        </ProtectedRoute>
      } />
      <Route path="/patient/prescriptions" element={
        <ProtectedRoute allowedRoles={["patient"]}>
          <PatientPrescriptions />
        </ProtectedRoute>
      } />
      <Route path="/patient/reminders" element={
        <ProtectedRoute allowedRoles={["patient"]}>
          <PatientReminders />
        </ProtectedRoute>
      } />
      <Route path="/patient/goals" element={
        <ProtectedRoute allowedRoles={["patient"]}>
          <PatientGoals />
        </ProtectedRoute>
      } />
      <Route path="/patient/side-effects" element={
        <ProtectedRoute allowedRoles={["patient"]}>
          <PatientSideEffects />
        </ProtectedRoute>
      } />
      <Route path="/patient/appointments" element={
        <ProtectedRoute allowedRoles={["patient"]}>
          <PatientAppointments />
        </ProtectedRoute>
      } />
      <Route path="/patient/history" element={
        <ProtectedRoute allowedRoles={["patient"]}>
          <PatientHistory />
        </ProtectedRoute>
      } />
      <Route path="/patient/profile" element={
        <ProtectedRoute allowedRoles={["patient"]}>
          <PatientProfileUpdate />
        </ProtectedRoute>
      } />

      {/* Provider Routes */}
      <Route path="/provider" element={
        <ProtectedRoute allowedRoles={["provider", "admin"]}>
          <ProviderDashboard />
        </ProtectedRoute>
      } />
      <Route path="/provider/patients" element={
        <ProtectedRoute allowedRoles={["provider", "admin"]}>
          <ProviderPatients />
        </ProtectedRoute>
      } />
      <Route path="/provider/prescriptions" element={
        <ProtectedRoute allowedRoles={["provider", "admin"]}>
          <ProviderPrescriptions />
        </ProtectedRoute>
      } />
      <Route path="/provider/reminders" element={
        <ProtectedRoute allowedRoles={["provider", "admin"]}>
          <ProviderReminders />
        </ProtectedRoute>
      } />
      <Route path="/provider/analytics" element={
        <ProtectedRoute allowedRoles={["provider", "admin"]}>
          <ProviderAnalytics />
        </ProtectedRoute>
      } />
      <Route path="/provider/goals" element={
        <ProtectedRoute allowedRoles={["provider", "admin"]}>
          <ProviderGoals />
        </ProtectedRoute>
      } />
      <Route path="/provider/side-effects" element={
        <ProtectedRoute allowedRoles={["provider", "admin"]}>
          <ProviderSideEffects />
        </ProtectedRoute>
      } />
      <Route path="/provider/appointments" element={
        <ProtectedRoute allowedRoles={["provider", "admin"]}>
          <ProviderAppointments />
        </ProtectedRoute>
      } />
      <Route path="/provider/follow-ups" element={
        <ProtectedRoute allowedRoles={["provider", "admin"]}>
          <ProviderFollowUps />
        </ProtectedRoute>
      } />
      <Route path="/provider/sms" element={
        <ProtectedRoute allowedRoles={["provider", "admin"]}>
          <ProviderSMS />
        </ProtectedRoute>
      } />
      <Route path="/provider/profile" element={
        <ProtectedRoute allowedRoles={["provider", "admin"]}>
          <ProviderProfileUpdate />
        </ProtectedRoute>
      } />
      <Route path="/provider/reports" element={
        <ProtectedRoute allowedRoles={["provider", "admin"]}>
          <ProviderReports />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminUsers />
        </ProtectedRoute>
      } />
      <Route path="/admin/hospitals" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminHospitals />
        </ProtectedRoute>
      } />
      <Route path="/admin/interoperability" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminInteroperability />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminSettings />
        </ProtectedRoute>
      } />
      <Route path="/admin/profile" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminProfileUpdate />
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminReports />
        </ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function getDashboardPath(role: string) {
  switch (role) {
    case "admin":
      return "/admin";
    case "provider":
      return "/provider";
    case "patient":
      return "/patient";
    default:
      return "/";
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
