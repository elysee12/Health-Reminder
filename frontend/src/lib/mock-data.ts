// Mock data for the mHealth Reminder Web System — Hypertension Focus

export type UserRole = 'admin' | 'provider' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  language: 'en' | 'rw';
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  age: number;
  gender: 'Male' | 'Female';
  address: string;
  registeredDate: string;
  adherenceRate: number;
  communicationMethod: 'web' | 'ussd' | 'both';
  bloodPressure?: string;
  riskLevel?: 'low' | 'moderate' | 'high';
  password?: string;
  pin?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  medication: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  prescribedBy: string;
  status: 'active' | 'completed' | 'discontinued';
}

export interface Reminder {
  id: string;
  patientId: string;
  prescriptionId: string;
  medication: string;
  dosage: string;
  scheduledTime: string;
  status: 'pending' | 'taken' | 'missed' | 'snoozed';
  type: 'web' | 'sms';
}

export interface AdherenceRecord {
  id: string;
  patientId: string;
  medication: string;
  scheduledTime: string;
  confirmedTime?: string;
  status: 'taken' | 'missed' | 'late';
}

export const demoUsers: User[] = [
  { id: 'admin-1', name: 'Admin User', email: 'admin@mhealth.rw', role: 'admin', language: 'en' },
  { id: 'provider-1', name: 'Dr. Uwimana Jean', email: 'dr.uwimana@hospital.rw', role: 'provider', language: 'en' },
  { id: 'patient-1', name: 'Mugisha Emmanuel', email: 'mugisha@email.com', role: 'patient', phone: '+250788123456', language: 'rw' },
];

export const patients: Patient[] = [
  { id: 'patient-1', name: 'Mugisha Emmanuel', phone: '+250788123456', email: 'mugisha@email.com', age: 45, gender: 'Male', address: 'Kigali, Nyarugenge', registeredDate: '2025-06-15', adherenceRate: 87, communicationMethod: 'both', bloodPressure: '145/92', riskLevel: 'moderate' },
  { id: 'patient-2', name: 'Uwase Diane', phone: '+250788234567', email: 'uwase@email.com', age: 32, gender: 'Female', address: 'Kigali, Kicukiro', registeredDate: '2025-07-20', adherenceRate: 94, communicationMethod: 'web', bloodPressure: '130/85', riskLevel: 'low' },
  { id: 'patient-3', name: 'Habimana Pierre', phone: '+250788345678', email: 'habimana@email.com', age: 58, gender: 'Male', address: 'Musanze', registeredDate: '2025-08-10', adherenceRate: 62, communicationMethod: 'sms', bloodPressure: '165/105', riskLevel: 'high' },
  { id: 'patient-4', name: 'Mukamana Grace', phone: '+250788456789', email: 'mukamana@email.com', age: 28, gender: 'Female', address: 'Huye', registeredDate: '2025-09-01', adherenceRate: 91, communicationMethod: 'both', bloodPressure: '128/82', riskLevel: 'low' },
  { id: 'patient-5', name: 'Niyonzima Claude', phone: '+250788567890', email: 'niyonzima@email.com', age: 67, gender: 'Male', address: 'Rubavu', registeredDate: '2025-10-12', adherenceRate: 45, communicationMethod: 'sms', bloodPressure: '175/110', riskLevel: 'high' },
];

export const prescriptions: Prescription[] = [
  { id: 'rx-1', patientId: 'patient-1', patientName: 'Mugisha Emmanuel', medication: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', startDate: '2025-11-01', endDate: '2026-05-01', prescribedBy: 'Dr. Uwimana Jean', status: 'active' },
  { id: 'rx-2', patientId: 'patient-1', patientName: 'Mugisha Emmanuel', medication: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', startDate: '2025-11-01', endDate: '2026-05-01', prescribedBy: 'Dr. Uwimana Jean', status: 'active' },
  { id: 'rx-3', patientId: 'patient-2', patientName: 'Uwase Diane', medication: 'Hydrochlorothiazide', dosage: '25mg', frequency: 'Once daily', startDate: '2026-02-15', endDate: '2026-08-15', prescribedBy: 'Dr. Uwimana Jean', status: 'active' },
  { id: 'rx-4', patientId: 'patient-3', patientName: 'Habimana Pierre', medication: 'Losartan', dosage: '50mg', frequency: 'Once daily', startDate: '2025-12-01', endDate: '2026-06-01', prescribedBy: 'Dr. Uwimana Jean', status: 'active' },
  { id: 'rx-5', patientId: 'patient-4', patientName: 'Mukamana Grace', medication: 'Enalapril', dosage: '10mg', frequency: 'Twice daily', startDate: '2026-01-10', endDate: '2026-07-10', prescribedBy: 'Dr. Uwimana Jean', status: 'active' },
  { id: 'rx-6', patientId: 'patient-5', patientName: 'Niyonzima Claude', medication: 'Atenolol', dosage: '50mg', frequency: 'Once daily', startDate: '2025-10-15', endDate: '2026-04-15', prescribedBy: 'Dr. Uwimana Jean', status: 'active' },
];

export const reminders: Reminder[] = [
  { id: 'rem-1', patientId: 'patient-1', prescriptionId: 'rx-1', medication: 'Amlodipine', dosage: '5mg', scheduledTime: '08:00', status: 'taken', type: 'web' },
  { id: 'rem-2', patientId: 'patient-1', prescriptionId: 'rx-2', medication: 'Lisinopril', dosage: '10mg', scheduledTime: '09:00', status: 'pending', type: 'web' },
  { id: 'rem-3', patientId: 'patient-1', prescriptionId: 'rx-2', medication: 'Lisinopril', dosage: '10mg', scheduledTime: '20:00', status: 'pending', type: 'sms' },
  { id: 'rem-4', patientId: 'patient-3', prescriptionId: 'rx-4', medication: 'Losartan', dosage: '50mg', scheduledTime: '07:00', status: 'missed', type: 'sms' },
  { id: 'rem-5', patientId: 'patient-4', prescriptionId: 'rx-5', medication: 'Enalapril', dosage: '10mg', scheduledTime: '07:30', status: 'pending', type: 'web' },
  { id: 'rem-6', patientId: 'patient-5', prescriptionId: 'rx-6', medication: 'Atenolol', dosage: '50mg', scheduledTime: '08:00', status: 'missed', type: 'sms' },
];

export const adherenceRecords: AdherenceRecord[] = [
  { id: 'adh-1', patientId: 'patient-1', medication: 'Amlodipine', scheduledTime: '2026-03-10 08:00', confirmedTime: '2026-03-10 08:05', status: 'taken' },
  { id: 'adh-2', patientId: 'patient-1', medication: 'Lisinopril', scheduledTime: '2026-03-10 09:00', confirmedTime: '2026-03-10 09:15', status: 'taken' },
  { id: 'adh-3', patientId: 'patient-1', medication: 'Amlodipine', scheduledTime: '2026-03-09 20:00', status: 'missed' },
  { id: 'adh-4', patientId: 'patient-3', medication: 'Losartan', scheduledTime: '2026-03-10 07:00', status: 'missed' },
  { id: 'adh-5', patientId: 'patient-4', medication: 'Enalapril', scheduledTime: '2026-03-10 07:30', confirmedTime: '2026-03-10 07:45', status: 'late' },
];

export const weeklyAdherenceData = [
  { day: 'Mon', taken: 12, missed: 2 },
  { day: 'Tue', taken: 14, missed: 1 },
  { day: 'Wed', taken: 10, missed: 4 },
  { day: 'Thu', taken: 13, missed: 2 },
  { day: 'Fri', taken: 11, missed: 3 },
  { day: 'Sat', taken: 9, missed: 5 },
  { day: 'Sun', taken: 8, missed: 6 },
];

export const accessRequests: AccessRequest[] = [
  { id: 'req-1', name: 'Dr. Kamanzi Alice', email: 'kamanzi@hospital.rw', phone: '+250788111222', role: 'provider', reason: 'New cardiologist at CHUK, need to manage hypertension patients', password: 'password123', status: 'pending', requestedDate: '2026-03-28', hospital: 'CHUK' },
  { id: 'req-2', name: 'Uwimana Patrick', email: 'uwimana.p@email.com', phone: '+250788333444', role: 'patient', reason: 'Diagnosed with hypertension, referred by Dr. Uwimana', password: 'password456', status: 'pending', requestedDate: '2026-03-30' },
  { id: 'req-3', name: 'Nurse Ingabire', email: 'ingabire@hospital.rw', phone: '+250788555666', role: 'provider', reason: 'Hypertension clinic nurse at King Faisal Hospital', password: 'password789', status: 'approved', requestedDate: '2026-03-20', hospital: 'King Faisal Hospital' },
  { id: 'req-4', name: 'Bizimana Jean', email: 'bizimana@email.com', phone: '+250788777888', role: 'patient', reason: 'Need medication reminders for blood pressure medication', password: 'password101', status: 'rejected', requestedDate: '2026-03-15' },
];

export const SMS_SUPPORT_FOOTER = '\n---\nFor support: Call +250 788 000 100 | SMS: +250 722 000 200 | Email: support@mhealth.rw';

export const smsTemplates = {
  reminder: `Muraho {patient_name}! Igihe cyo gufata {medication} ({dosage}) kirageze. Mwifurize ubuzima bwiza!${SMS_SUPPORT_FOOTER}`,
  missed: `{patient_name}, twabonye ko utafashe {medication} ku gihe. Nyamuneka ufate umuti wawe vuba bishoboka.${SMS_SUPPORT_FOOTER}`,
  appointment: `Muraho {patient_name}! Wibutse gusura muganga wawe ku itariki {date} saa {time}.${SMS_SUPPORT_FOOTER}`,
  bp_check: `{patient_name}, ni igihe cyo gupima umuvuduko w'amaraso. Nyamuneka andika ibisubizo byawe.${SMS_SUPPORT_FOOTER}`,
};

export const interoperabilityConfig = {
  fhirEndpoint: 'https://api.mhealth.rw/fhir/r4',
  hl7Version: '2.5.1',
  apiVersion: 'v1.0',
  supportedFormats: ['JSON', 'XML', 'HL7v2'],
  connectedSystems: [
    { id: 'sys-1', name: 'HMIS Rwanda', type: 'National Health System', status: 'connected', lastSync: '2026-04-03 08:00', protocol: 'HL7 FHIR R4' },
    { id: 'sys-2', name: 'OpenMRS', type: 'Electronic Medical Records', status: 'connected', lastSync: '2026-04-03 07:30', protocol: 'REST API' },
    { id: 'sys-3', name: 'DHIS2', type: 'Health Data Analytics', status: 'disconnected', lastSync: '2026-04-01 12:00', protocol: 'REST API' },
    { id: 'sys-4', name: 'RapidSMS', type: 'SMS Gateway', status: 'connected', lastSync: '2026-04-03 08:05', protocol: 'HTTP/REST' },
  ],
  apiKeys: [
    { id: 'key-1', name: 'HMIS Integration Key', created: '2026-01-15', lastUsed: '2026-04-03', status: 'active' },
    { id: 'key-2', name: 'OpenMRS Sync Key', created: '2026-02-01', lastUsed: '2026-04-03', status: 'active' },
    { id: 'key-3', name: 'Mobile App API Key', created: '2026-03-01', lastUsed: '2026-04-02', status: 'active' },
  ],
};

export const translations: Record<string, Record<string, string>> = {
  en: {
    'dashboard': 'Dashboard',
    'prescriptions': 'Prescriptions',
    'reminders': 'Reminders',
    'medication_history': 'Medication History',
    'profile': 'Profile',
    'logout': 'Logout',
    'welcome': 'Welcome',
    'today_medications': "Today's Medications",
    'taken': 'Taken',
    'missed': 'Missed',
    'pending': 'Pending',
    'confirm_taken': 'Confirm Taken',
    'adherence_rate': 'Adherence Rate',
    'active_prescriptions': 'Active Prescriptions',
    'next_reminder': 'Next Reminder',
    'medication_schedule': 'Medication Schedule',
    'patients': 'Patients',
    'reports': 'Reports',
    'sms_management': 'SMS Management',
    'settings': 'Settings',
    'users': 'Users',
    'hospitals': 'Hospitals',
    'system_settings': 'System Settings',
    'login': 'Sign In',
    'email': 'Email',
    'password': 'Password',
    'select_role': 'Select your role',
    'patient': 'Patient',
    'provider': 'Healthcare Provider',
    'admin': 'Administrator',
    'language': 'Language',
    'request_access': 'Request Access',
    'access_requests': 'Access Requests',
    'interoperability': 'Interoperability',
    'blood_pressure': 'Blood Pressure',
    'hypertension': 'Hypertension',
    'risk_level': 'Risk Level',
    'target_goals': 'Target Goals',
    'side_effects': 'Side Effects',
    'appointments': 'Appointments',
    'history': 'History',
    'active_goals': 'Active Goals',
    'next_visit': 'Next Visit',
    'view_all': 'View All',
    'take_now': 'Take Now',
    'no_reminders': 'No reminders for today.',
    'no_active_prescriptions': 'No active prescriptions',
    'upcoming_emergency': 'Upcoming Emergency Appointment',
    'today_bp_meds': "Today's Blood Pressure Medications",
    'dosage': 'Dosage',
    'frequency': 'Frequency',
    'start_date': 'Start Date',
    'end_date': 'End Date',
    'status': 'Status',
    'actions': 'Actions',
    'add_new': 'Add New',
    'save': 'Save',
    'cancel': 'Cancel',
    'edit': 'Edit',
    'delete': 'Delete',
    'search': 'Search',
    'filter': 'Filter',
    'all': 'All',
    'none': 'None',
    'low': 'Low',
    'moderate': 'Moderate',
    'high': 'High',
    'active': 'Active',
    'completed': 'Completed',
    'discontinued': 'Discontinued',
    'once_daily': 'Once daily',
    'twice_daily': 'Twice daily',
    'thrice_daily': 'Thrice daily',
    'as_needed': 'As needed',
    'before_food': 'Before food',
    'after_food': 'After food',
    'at_night': 'At night',
    'morning': 'Morning',
    'evening': 'Evening',
    'Amlodipine': 'Amlodipine',
    'Lisinopril': 'Lisinopril',
    'Hydrochlorothiazide': 'Hydrochlorothiazide',
    'Losartan': 'Losartan',
    'Enalapril': 'Enalapril',
    'Atenolol': 'Atenolol',
    'Metoprolol': 'Metoprolol',
    'Chlorthalidone': 'Chlorthalidone',
    'Hydralazine': 'Hydralazine',
    'Spironolactone': 'Spironolactone',
    '5mg': '5mg',
    '10mg': '10mg',
    '20mg': '20mg',
    '25mg': '25mg',
    '50mg': '50mg',
    '100mg': '100mg',
    'medication_marked_taken': 'Medication marked as taken',
    'failed_to_update': 'Failed to update reminder',
    'pending_today': 'Pending Today',
    'missed_today': 'Missed Today',
    'high_risk': 'High Risk',
    'weekly_adherence': 'Weekly BP Medication Adherence',
    'high_risk_patients': 'High-Risk BP Patients',
    'hypertension_patients': 'Hypertension Patients',
    'patient_name': 'Patient',
    'age_gender': 'Age/Gender',
    'bp': 'BP',
    'adherence': 'Adherence',
    'loading': 'Loading dashboard data...',
    'no_high_risk_found': 'No high-risk patients found.',
    'analytics': 'Analytics',
    'follow_ups': 'Follow-ups',
    'patient_goals': 'Patient Goals',
    'sms_mgmt': 'SMS Management',
    'email_password_required': 'Email and password are required',
    'login_success': 'Login successful!',
    'please_enter_email': 'Please enter your email',
    'otp_sent': 'OTP sent to your email. Please check your inbox.',
    'forgot_password': 'Forgot Password?',
    'sign_in': 'Sign In',
    'create_account': 'Request Access',
    'back_to_login': 'Back to Login',
    'reset_password': 'Reset Password',
    'new_password': 'New Password',
    'confirm_new_password': 'Confirm New Password',
    'submit': 'Submit',
    'full_name': 'Full Name',
    'phone_number': 'Phone Number',
    'select_hospital': 'Select Hospital',
    'reason_for_access': 'Reason for Access',
    'request_sent': 'Request sent successfully. We will notify you once approved.',
    'total_users': 'Total Users',
    'active_users': 'Active Users',
    'pending_requests': 'Pending Requests',
    'high_risk_bp': 'High-Risk BP',
    'pending_requests_banner': 'pending access request(s)',
    'review_approve_reject': 'Review and approve or reject new user requests',
    'review': 'Review',
    'manage_users': 'Manage Users',
    'user': 'User',
    'logged_in_as': 'LOGGED IN AS',
    'sign_out': 'Sign Out',
    'edit_profile': 'Edit Profile',
  },
  rw: {
    'dashboard': 'Ikibaho',
    'prescriptions': 'Imiti yanditswe',
    'reminders': 'Ibibutsa',
    'medication_history': "Amateka y'imiti",
    'profile': 'Umwirondoro',
    'logout': 'Gusohoka',
    'welcome': 'Murakaza neza',
    'today_medications': "Imiti y'uyu munsi",
    'taken': 'Yafashwe',
    'missed': 'Yaburiwe',
    'pending': 'Itegereje',
    'confirm_taken': 'Emeza ko yafashwe',
    'adherence_rate': "Igipimo cy'ubukurikire",
    'active_prescriptions': 'Imiti ikoreshwa',
    'next_reminder': 'Ikibutsa gikurikira',
    'medication_schedule': "Gahunda y'imiti",
    'patients': 'Abarwayi',
    'reports': 'Raporo',
    'sms_management': 'Gucunga SMS',
    'settings': 'Igenamiterere',
    'users': 'Abakoresha',
    'hospitals': 'Ibitaro',
    'system_settings': "Igenamiterere ry'sisitemu",
    'login': 'Kwinjira',
    'email': 'Imeyili',
    'password': "Ijambo ry'ibanga",
    'select_role': 'Hitamo uruhare rwawe',
    'patient': 'Umurwayi',
    'provider': 'Umuganga',
    'admin': 'Umuyobozi',
    'language': 'Ururimi',
    'request_access': 'Saba Kwinjira',
    'access_requests': "Ibyo Gusaba Kwinjira",
    'interoperability': 'Gukorana na Sisitemu',
    'blood_pressure': "Umuvuduko w'Amaraso",
    'hypertension': "Umuvuduko w'Amaraso Munini",
    'risk_level': "Urwego rw'Akaga",
    'target_goals': 'Intego zihari',
    'side_effects': 'Ingaruka zihari',
    'appointments': 'Gahunda na muganga',
    'history': 'Amateka',
    'active_goals': 'Intego zihari',
    'next_visit': 'Gahunda itaha',
    'view_all': 'Reba byose',
    'take_now': 'Fata Umuti',
    'no_reminders': "Nta miburo y'uyu munsi.",
    'no_active_prescriptions': 'Nta miti yanditswe ihari',
    'upcoming_emergency': 'Gahunda Yihutirwa Irimbere',
    'today_bp_meds': "Imiti y'Umuvuduko w'Amaraso y'Uyu Munsi",
    'dosage': 'Ingano',
    'frequency': 'Incuro',
    'start_date': 'Itariki yatangiye',
    'end_date': 'Itariki izarangirira',
    'status': 'Imiterere',
    'actions': 'Ibikorwa',
    'add_new': 'Ongeraho gishya',
    'save': 'Bika',
    'cancel': 'Siba',
    'edit': 'Hindura',
    'delete': 'Siba',
    'search': 'Shakisha',
    'filter': 'Yungurura',
    'all': 'Byose',
    'none': 'Ntabyo',
    'low': 'Hasi',
    'moderate': 'Hagati',
    'high': 'Hejuru',
    'active': 'Irakoreshwa',
    'completed': 'Yarangiye',
    'discontinued': 'Yahagaritswe',
    'once_daily': 'Rimwe ku munsi',
    'twice_daily': 'Kabiri ku munsi',
    'thrice_daily': 'Gatatu ku munsi',
    'as_needed': 'Iyo bikenewe',
    'before_food': 'Mbere yo kurya',
    'after_food': 'Nyuma yo kurya',
    'at_night': 'Nijoro',
    'morning': 'Mu gitondo',
    'evening': 'Nimugoroba',
    'Amlodipine': 'Amlodipine',
    'Lisinopril': 'Lisinopril',
    'Hydrochlorothiazide': 'Hydrochlorothiazide',
    'Losartan': 'Losartan',
    'Enalapril': 'Enalapril',
    'Atenolol': 'Atenolol',
    'Metoprolol': 'Metoprolol',
    'Chlorthalidone': 'Chlorthalidone',
    'Hydralazine': 'Hydralazine',
    'Spironolactone': 'Spironolactone',
    '5mg': '5mg',
    '10mg': '10mg',
    '20mg': '20mg',
    '25mg': '25mg',
    '50mg': '50mg',
    '100mg': '100mg',
    'medication_marked_taken': 'Umuti wemejwe ko wafashwe',
    'failed_to_update': 'Guhindura ibyibutsa byanze',
    'pending_today': 'Ibitegereje uyu munsi',
    'missed_today': 'Ibyabuze uyu munsi',
    'high_risk': 'Akaga gakomeye',
    'weekly_adherence': "Ubukurikire bw'icyumweru",
    'high_risk_patients': 'Abarwayi bari mu kaga',
    'hypertension_patients': "Abarwayi b'umuvuduko",
    'patient_name': 'Umurwayi',
    'age_gender': 'Imyaka/Igitsina',
    'bp': 'BP',
    'adherence': 'Ubukurikire',
    'loading': 'Gutegura ibikubiye mu kiba...',
    'no_high_risk_found': 'Nta barwayi bari mu kaga babonetse.',
    'analytics': 'Isesengura',
    'follow_ups': 'Gukurikirana',
    'patient_goals': "Intego z'umurwayi",
    'sms_mgmt': 'Gucunga SMS',
    'email_password_required': "Imeyili n'ijambo ry'ibanga birakenewe",
    'login_success': 'Kwinjira byagenze neza!',
    'please_enter_email': 'Andika imeyili yawe',
    'otp_sent': 'OTP yoherejwe kuri imeyili yawe. Reba agasanduku kawe.',
    'forgot_password': "Wibagiwe ijambo ry'ibanga?",
    'sign_in': 'Kwinjira',
    'create_account': 'Saba Kwinjira',
    'back_to_login': 'Subira Kwinjira',
    'reset_password': "Guhindura ijambo ry'ibanga",
    'new_password': "Ijambo ry'ibanga rishya",
    'confirm_new_password': "Emeza ijambo ry'ibanga",
    'submit': 'Ohereza',
    'full_name': 'Amazina Yose',
    'phone_number': 'Nimero ya Terefoni',
    'select_hospital': 'Hitamo Ibitaro',
    'reason_for_access': 'Impamvu yo gusaba',
    'request_sent': 'Ubusabe bwoherejwe neza. Tuzakumenyesha nibumara kwemezwa.',
    'total_users': 'Abakoresha Bose',
    'active_users': 'Abakoresha Bakora',
    'pending_requests': 'Ibyifuzo Bitegereje',
    'high_risk_bp': "Umuvuduko w'Akaga",
    'pending_requests_banner': 'icyifuzo/ibyifuzo bitegereje',
    'review_approve_reject': 'Suzuma kandi wemeze cyangwa wange ibyifuzo bishya',
    'review': 'Suzuma',
    'manage_users': 'Gucunga Abakoresha',
    'user': 'Umukoresha',
    'logged_in_as': 'WINJIYE NKA',
    'sign_out': 'Sohoka',
    'edit_profile': 'Hindura Umwirondoro',
  },
};
