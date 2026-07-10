const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api';

export async function fetchFromApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = 'Something went wrong';
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || JSON.stringify(error);
    } catch {
      errorMessage = await response.text() || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (data: any) => fetchFromApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => fetchFromApi('/auth/logout', { method: 'POST' }),
    getProfile: () => fetchFromApi('/auth/me'),
    requestPasswordReset: (data: any) => fetchFromApi('/auth/password-reset/request', { method: 'POST', body: JSON.stringify(data) }),
    confirmPasswordReset: (data: any) => fetchFromApi('/auth/password-reset/confirm', { method: 'POST', body: JSON.stringify(data) }),
  },
  stats: {
    getPublic: () => fetchFromApi('/stats/public'),
  },
  reports: {
    adherence: (params: any) => fetchFromApi(`/reports/adherence?${new URLSearchParams(params).toString()}`),
    prescriptions: (params: any) => fetchFromApi(`/reports/prescriptions?${new URLSearchParams(params).toString()}`),
    reminders: (params: any) => fetchFromApi(`/reports/reminders?${new URLSearchParams(params).toString()}`),
    appointments: (params: any) => fetchFromApi(`/reports/appointments?${new URLSearchParams(params).toString()}`),
    patients: (params: any) => fetchFromApi(`/reports/patients?${new URLSearchParams(params).toString()}`),
    summary: (params: any) => fetchFromApi(`/reports/summary?${new URLSearchParams(params).toString()}`),
  },
  accessRequests: {
    create: (data: any) => fetchFromApi('/user', { method: 'POST', body: JSON.stringify(data) }),
  },
  users: {
    findAll: () => fetchFromApi('/user'),
    findOne: (id: number) => fetchFromApi(`/user/${id}`),
    create: (data: any) => fetchFromApi('/user', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => fetchFromApi(`/user/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => fetchFromApi(`/user/${id}`, { method: 'DELETE' }),
  },
  patients: {
    findAll: (providerId?: number) => fetchFromApi(`/patient${providerId ? `?providerId=${providerId}` : ''}`),
    findOne: (id: number) => fetchFromApi(`/patient/${id}`),
    create: (data: any) => fetchFromApi('/patient', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => fetchFromApi(`/patient/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => fetchFromApi(`/patient/${id}`, { method: 'DELETE' }),
  },
  hospitals: {
    findAll: () => fetchFromApi('/hospital'),
    findOne: (id: number) => fetchFromApi(`/hospital/${id}`),
    create: (data: any) => fetchFromApi('/hospital', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => fetchFromApi(`/hospital/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => fetchFromApi(`/hospital/${id}`, { method: 'DELETE' }),
  },
  prescriptions: {
    findAll: (providerId?: number) => fetchFromApi(`/prescription${providerId ? `?providerId=${providerId}` : ''}`),
    findOne: (id: number) => fetchFromApi(`/prescription/${id}`),
    create: (data: any) => fetchFromApi('/prescription', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => fetchFromApi(`/prescription/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => fetchFromApi(`/prescription/${id}`, { method: 'DELETE' }),
  },
  reminders: {
    findAll: (providerId?: number) => fetchFromApi(`/reminder${providerId ? `?providerId=${providerId}` : ''}`),
    findOne: (id: number) => fetchFromApi(`/reminder/${id}`),
    create: (data: any) => fetchFromApi('/reminder', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => fetchFromApi(`/reminder/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => fetchFromApi(`/reminder/${id}`, { method: 'DELETE' }),
  },
  smsLogs: {
    findAll: (providerId?: number) => fetchFromApi(`/sms-log${providerId ? `?providerId=${providerId}` : ''}`),
    findOne: (id: number) => fetchFromApi(`/sms-log/${id}`),
    create: (data: any) => fetchFromApi('/sms-log', { method: 'POST', body: JSON.stringify(data) }),
    broadcast: (data: { message: string; patientId?: number; phone?: string }) => fetchFromApi('/sms-log/broadcast', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => fetchFromApi(`/sms-log/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => fetchFromApi(`/sms-log/${id}`, { method: 'DELETE' }),
  },
  adherenceRecords: {
    findAll: (providerId?: number) => fetchFromApi(`/adherence-record${providerId ? `?providerId=${providerId}` : ''}`),
    findOne: (id: number) => fetchFromApi(`/adherence-record/${id}`),
    create: (data: any) => fetchFromApi('/adherence-record', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => fetchFromApi(`/adherence-record/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => fetchFromApi(`/adherence-record/${id}`, { method: 'DELETE' }),
  },
  externalSystems: {
    findAll: () => fetchFromApi('/external-system'),
    findOne: (id: number) => fetchFromApi(`/external-system/${id}`),
    create: (data: any) => fetchFromApi('/external-system', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => fetchFromApi(`/external-system/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => fetchFromApi(`/external-system/${id}`, { method: 'DELETE' }),
  },
  apiKeys: {
    findAll: () => fetchFromApi('/api-key'),
    findOne: (id: number) => fetchFromApi(`/api-key/${id}`),
    create: (data: any) => fetchFromApi('/api-key', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => fetchFromApi(`/api-key/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => fetchFromApi(`/api-key/${id}`, { method: 'DELETE' }),
  },
  healthGoals: {
    findAll: (patientId?: number, providerId?: number) => fetchFromApi(`/health-goal${patientId ? `?patientId=${patientId}` : providerId ? `?providerId=${providerId}` : ''}`),
    findOne: (id: number) => fetchFromApi(`/health-goal/${id}`),
    create: (data: any) => fetchFromApi('/health-goal', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => fetchFromApi(`/health-goal/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => fetchFromApi(`/health-goal/${id}`, { method: 'DELETE' }),
  },
  sideEffects: {
    findAll: (patientId?: number, providerId?: number) => fetchFromApi(`/side-effect${patientId ? `?patientId=${patientId}` : providerId ? `?providerId=${providerId}` : ''}`),
    findOne: (id: number) => fetchFromApi(`/side-effect/${id}`),
    create: (data: any) => fetchFromApi('/side-effect', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => fetchFromApi(`/side-effect/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => fetchFromApi(`/side-effect/${id}`, { method: 'DELETE' }),
  },
  appointments: {
    findAll: (patientId?: number, hospitalId?: number, providerId?: number) => {
      const params = new URLSearchParams();
      if (patientId) params.append('patientId', String(patientId));
      if (hospitalId) params.append('hospitalId', String(hospitalId));
      if (providerId) params.append('providerId', String(providerId));
      return fetchFromApi(`/appointment${params.toString() ? `?${params.toString()}` : ''}`);
    },
    findOne: (id: number) => fetchFromApi(`/appointment/${id}`),
    create: (data: any) => fetchFromApi('/appointment', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => fetchFromApi(`/appointment/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => fetchFromApi(`/appointment/${id}`, { method: 'DELETE' }),
  },
  followUps: {
    findAll: (patientId?: number, providerId?: number) => {
      const params = new URLSearchParams();
      if (patientId) params.append('patientId', String(patientId));
      if (providerId) params.append('providerId', String(providerId));
      return fetchFromApi(`/follow-up${params.toString() ? `?${params.toString()}` : ''}`);
    },
    findOne: (id: number) => fetchFromApi(`/follow-up/${id}`),
    create: (data: any) => fetchFromApi('/follow-up', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) => fetchFromApi(`/follow-up/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: number) => fetchFromApi(`/follow-up/${id}`, { method: 'DELETE' }),
  },
};

// Helper function to generate reports based on type
export async function generateReport(reportType: string, filters: any = {}) {
  const reportFunctions: Record<string, (params: any) => Promise<any>> = {
    adherence: api.reports.adherence,
    prescriptions: api.reports.prescriptions,
    reminders: api.reports.reminders,
    appointments: api.reports.appointments,
    patients: api.reports.patients,
    summary: api.reports.summary,
  };

  const reportFunction = reportFunctions[reportType];
  if (!reportFunction) {
    throw new Error(`Unknown report type: ${reportType}`);
  }

  return await reportFunction(filters);
}

export async function exportReportToExcel(reportType: string, filters: any = {}) {
  const params = new URLSearchParams();
  params.append('reportType', reportType);
  if (filters.period) params.append('period', filters.period);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.patientId) params.append('patientId', String(filters.patientId));
  if (filters.hospitalId) params.append('hospitalId', String(filters.hospitalId));
  if (filters.status) params.append('status', filters.status);

  const response = await fetch(`${API_URL}/reports/export/excel?${params.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to export report');
  }

  // Create download link
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reportType}-report-${Date.now()}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export async function exportReportToPDF(reportType: string, filters: any = {}) {
  const params = new URLSearchParams();
  params.append('reportType', reportType);
  if (filters.period) params.append('period', filters.period);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.patientId) params.append('patientId', String(filters.patientId));
  if (filters.hospitalId) params.append('hospitalId', String(filters.hospitalId));
  if (filters.status) params.append('status', filters.status);

  const response = await fetch(`${API_URL}/reports/export/pdf?${params.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to export report');
  }

  // Create download link
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reportType}-report-${Date.now()}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
