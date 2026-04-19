export interface MedicalRecord {
  id: string;
  visitDate: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  bloodPressure?: string;
  temperature?: string;
  pulse?: string;
  weight?: string;
  patientId: string;
  doctorId: string;
  patient?: {
    firstName: string;
    lastName: string;
  };
  doctor?: {
    firstName: string;
    lastName: string;
    specialization: string;
  };
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  bloodType?: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
}