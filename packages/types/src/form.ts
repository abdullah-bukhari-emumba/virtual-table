/**
 * Form Type Definitions
 * Shared across all zones
 */

export interface FormValues {
  // Personal Information
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;

  // Address
  address: string;
  city: string;
  state: string;
  zipCode: string;

  // Insurance
  hasInsurance: boolean;
  insuranceProvider?: string;
  insuranceId?: string;

  // Medical History
  medicalConditions: string;
  medications: string;
  allergies: string;

  // Emergency Contact
  emergencyContact: string;
  emergencyPhone: string;

  // Additional Information
  notes?: string;
}

export interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface FormTouched {
  [key: string]: boolean | undefined;
}

