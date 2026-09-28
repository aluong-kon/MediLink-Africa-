export type UserRole = 'Patient' | 'Doctor' | 'Nurse' | 'Laboratory' | 'Pharmacist' | 'Administrator' | 'Receptionist';

export interface Patient {
  id: string;
  qrToken: string;
  fullName: string;
  dob: string;
  gender: string;
  nationalId: string;
  passport?: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  bloodGroup: string;
  photoUrl: string;
  medicalHistory: {
    previousIllnesses: string[];
    chronicDiseases: string[];
    allergies: string[];
    surgeries: string[];
    hospitalAdmissions: string[];
    currentMedications: string[];
    familyHistory: string[];
    immunizations: string[];
    pregnancyHistory?: string;
    disabilities?: string[];
  };
  consent: {
    shareWithResearch: boolean;
    allowEmergencyBreakGlass: boolean;
    dataRetentionYears: number;
  };
}

export interface VisitRecord {
  id: string;
  patientId: string;
  hospitalName: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  prescriptions: string[];
  followUpDate: string;
  clinicalNotes: string;
}

export interface LabRecord {
  id: string;
  patientId: string;
  testName: string;
  category: 'Blood' | 'Urine' | 'COVID-19' | 'HIV' | 'Malaria' | 'Imaging';
  status: 'Pending' | 'Completed';
  date: string;
  orderedBy: string;
  results: string;
  facility: string;
  confidential?: boolean;
}

export interface PrescriptionRecord {
  id: string;
  patientId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedBy: string;
  hospital: string;
  date: string;
  status: 'Active' | 'Completed' | 'Refill Requested';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  doctorName: string;
  hospitalName: string;
  patientId: string;
  patientName: string;
  accessType: 'QR_SCAN' | 'MANUAL_LOOKUP' | 'EMERGENCY_BREAK_GLASS' | 'RECORD_UPDATE';
  deviceInfo: string;
  reason: string;
  granted: boolean;
}

export interface AISummary {
  mainConditions: string;
  allergies: string[];
  currentMeds: string[];
  highRiskAlerts: string[];
  vaccinationStatus: string;
  clinicalSummary: string;
}
