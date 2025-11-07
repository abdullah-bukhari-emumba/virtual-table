/**
 * Patient Type Definitions
 * Shared across all zones
 */

export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  insuranceProvider: string;
  insuranceId: string;
  primaryPhysician: string;
  lastVisit: string;
  nextAppointment: string;
  medicalConditions: string;
  medications: string;
  allergies: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodType: string;
  height: string;
  weight: string;
  smokingStatus: string;
  alcoholConsumption: string;
  exerciseFrequency: string;
  occupation: string;
  maritalStatus: string;
  preferredLanguage: string;
  notes: string;
}

export interface PatientsResponse {
  patients: Patient[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SearchParams {
  query?: string;
  page?: number;
  pageSize?: number;
}

