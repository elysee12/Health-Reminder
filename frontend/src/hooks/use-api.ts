import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: api.users.findAll,
  });
}

export function usePatients(providerId?: number) {
  return useQuery({
    queryKey: ['patients', providerId],
    queryFn: () => api.patients.findAll(providerId),
  });
}

export function useHospitals() {
  return useQuery({
    queryKey: ['hospitals'],
    queryFn: api.hospitals.findAll,
  });
}

export function usePrescriptions(providerId?: number) {
  return useQuery({
    queryKey: ['prescriptions', providerId],
    queryFn: () => api.prescriptions.findAll(providerId),
  });
}

export function useReminders(providerId?: number) {
  return useQuery({
    queryKey: ['reminders', providerId],
    queryFn: () => api.reminders.findAll(providerId),
  });
}

export function useSmsLogs(providerId?: number) {
  return useQuery({
    queryKey: ['sms-logs', providerId],
    queryFn: () => api.smsLogs.findAll(providerId),
  });
}

export function useAdherenceRecords(providerId?: number) {
  return useQuery({
    queryKey: ['adherence-records', providerId],
    queryFn: () => api.adherenceRecords.findAll(providerId),
  });
}

export function useExternalSystems() {
  return useQuery({
    queryKey: ['external-systems'],
    queryFn: api.externalSystems.findAll,
  });
}

export function useApiKeys() {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: api.apiKeys.findAll,
  });
}

export function useHealthGoals(patientId?: number, providerId?: number) {
  return useQuery({
    queryKey: ['health-goals', patientId, providerId],
    queryFn: () => api.healthGoals.findAll(patientId, providerId),
  });
}

export function useSideEffects(patientId?: number, providerId?: number) {
  return useQuery({
    queryKey: ['side-effects', patientId, providerId],
    queryFn: () => api.sideEffects.findAll(patientId, providerId),
  });
}

export function useAppointments(patientId?: number, hospitalId?: number, providerId?: number) {
  return useQuery({
    queryKey: ['appointments', patientId, hospitalId, providerId],
    queryFn: () => api.appointments.findAll(patientId, hospitalId, providerId),
  });
}

export function useFollowUps(patientId?: number, providerId?: number) {
  return useQuery({
    queryKey: ['follow-ups', patientId, providerId],
    queryFn: () => api.followUps.findAll(patientId, providerId),
  });
}

/**
 * Public stats for the login page left panel.
 * Fetches reminders, hospitals and adherence records in parallel
 * so the three stat pills show live numbers from the database.
 */
export function usePublicStats() {
  const stats = useQuery({
    queryKey: ['public-stats'],
    queryFn: () => api.stats.getPublic(),
    staleTime: 60_000,
    retry: 1,
  });

  const reminderCount = stats.data?.reminderCount || 0;
  const hospitalCount = stats.data?.hospitalCount || 0;
  const patientCount = stats.data?.patientCount || 0;
  const userCount = stats.data?.userCount || 0;

  return {
    reminderCount,
    hospitalCount,
    patientCount,
    userCount,
    isLoading: stats.isLoading,
  };
}
