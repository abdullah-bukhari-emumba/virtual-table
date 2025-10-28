// ============================================================================
// PATIENT FORM VALIDATION SCHEMA
// ============================================================================
// This file defines the Yup validation schema for the patient intake form.
// Yup provides declarative, schema-based validation with clear error messages.
//
// VALIDATION FEATURES DEMONSTRATED:
// - Required fields
// - String length constraints (min/max)
// - Email format validation
// - Number range validation
// - Date validation
// - Conditional validation (fields required only when certain conditions are met)
// - Custom validation messages
// ============================================================================

import * as yup from 'yup';

/**
 * Patient Form Validation Schema
 * 
 * This schema validates a patient intake form for an EHR system.
 * It demonstrates various validation rules and conditional requirements.
 * 
 * FORM FIELDS:
 * 1. Personal Information:
 *    - firstName: Required, 2-50 characters
 *    - lastName: Required, 2-50 characters
 *    - dateOfBirth: Required, valid date, must be in the past
 *    - gender: Required, one of predefined options
 * 
 * 2. Contact Information:
 *    - email: Required, valid email format
 *    - phone: Required, 10-15 digits
 *    - address: Required, 5-200 characters
 * 
 * 3. Medical Information:
 *    - bloodType: Required, one of valid blood types
 *    - hasAllergies: Required boolean
 *    - allergies: Required if hasAllergies is true (CONDITIONAL)
 *    - hasChronicConditions: Required boolean
 *    - chronicConditions: Required if hasChronicConditions is true (CONDITIONAL)
 * 
 * 4. Insurance Information:
 *    - hasInsurance: Required boolean
 *    - insuranceProvider: Required if hasInsurance is true (CONDITIONAL)
 *    - insurancePolicyNumber: Required if hasInsurance is true (CONDITIONAL)
 * 
 * 5. Emergency Contact:
 *    - emergencyContactName: Required, 2-100 characters
 *    - emergencyContactPhone: Required, 10-15 digits
 *    - emergencyContactRelationship: Required
 */
export const patientFormSchema = yup.object().shape({
  // ==========================================================================
  // PERSONAL INFORMATION
  // ==========================================================================
  
  // First Name: Required, minimum 2 characters, maximum 50 characters
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .trim(),
  
  // Last Name: Required, minimum 2 characters, maximum 50 characters
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .trim(),
  
  // Date of Birth: Required, must be a valid date, must be in the past
  dateOfBirth: yup
    .date()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future')
    .typeError('Please enter a valid date'),
  
  // Gender: Required, must be one of the predefined options
  gender: yup
    .string()
    .required('Gender is required')
    .oneOf(['male', 'female', 'other', 'prefer-not-to-say'], 'Please select a valid gender'),
  
  // ==========================================================================
  // CONTACT INFORMATION
  // ==========================================================================
  
  // Email: Required, must be valid email format
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .trim(),
  
  // Phone: Required, 10-15 digits (allows for international formats)
  phone: yup
    .number()
    .required('Phone number is required')
    .min(10, 'Phone number must be at least 10 digits')
    .typeError('Phone number must be a number'),
  
  // Address: Required, 5-200 characters
  address: yup
    .string()
    .required('Address is required')
    .min(5, 'Address must be at least 5 characters')
    .max(200, 'Address must not exceed 200 characters')
    .trim(),
  
  // ==========================================================================
  // MEDICAL INFORMATION
  // ==========================================================================
  
  // Blood Type: Required, must be one of valid blood types
  bloodType: yup
    .string()
    .required('Blood type is required')
    .oneOf(
      ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'],
      'Please select a valid blood type'
    ),
  
  // Has Allergies: Required boolean (yes/no)
  hasAllergies: yup
    .boolean()
    .required('Please indicate if you have any allergies'),
  
  // Allergies: CONDITIONAL - Required only if hasAllergies is true
  // This demonstrates conditional validation based on another field's value
  allergies: yup
    .string()
    .when('hasAllergies', {
      is: true,  // When hasAllergies is true
      then: (schema) => schema
        .required('Please list your allergies')
        .min(3, 'Please provide details about your allergies'),
      otherwise: (schema) => schema.notRequired(), // Not required when hasAllergies is false
    }),
  
  // Has Chronic Conditions: Required boolean (yes/no)
  hasChronicConditions: yup
    .boolean()
    .required('Please indicate if you have any chronic conditions'),
  
  // Chronic Conditions: CONDITIONAL - Required only if hasChronicConditions is true
  chronicConditions: yup
    .string()
    .when('hasChronicConditions', {
      is: true,  // When hasChronicConditions is true
      then: (schema) => schema
        .required('Please list your chronic conditions')
        .min(3, 'Please provide details about your chronic conditions'),
      otherwise: (schema) => schema.notRequired(),
    }),
  
  // ==========================================================================
  // INSURANCE INFORMATION
  // ==========================================================================
  
  // Has Insurance: Required boolean (yes/no)
  hasInsurance: yup
    .boolean()
    .required('Please indicate if you have insurance'),
  
  // Insurance Provider: CONDITIONAL - Required only if hasInsurance is true
  insuranceProvider: yup
    .string()
    .when('hasInsurance', {
      is: true,
      then: (schema) => schema
        .required('Insurance provider is required')
        .min(2, 'Insurance provider must be at least 2 characters'),
      otherwise: (schema) => schema.notRequired(),
    }),
  
  // Insurance Policy Number: CONDITIONAL - Required only if hasInsurance is true
  insurancePolicyNumber: yup
    .string()
    .when('hasInsurance', {
      is: true,
      then: (schema) => schema
        .required('Insurance policy number is required')
        .min(5, 'Policy number must be at least 5 characters'),
      otherwise: (schema) => schema.notRequired(),
    }),
  
  // ==========================================================================
  // EMERGENCY CONTACT
  // ==========================================================================
  
  // Emergency Contact Name: Required, 2-100 characters
  emergencyContactName: yup
    .string()
    .required('Emergency contact name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  
  // Emergency Contact Phone: Required, 10-15 digits
  emergencyContactPhone: yup
    .number()
    .required('Emergency contact phone is required')
    .min(10, 'Phone number must be at least 10 digits')
    .typeError('Phone number must be a number'),
  
  // Emergency Contact Relationship: Required
  emergencyContactRelationship: yup
    .string()
    .required('Relationship is required')
    .oneOf(
      ['spouse', 'parent', 'child', 'sibling', 'friend', 'other'],
      'Please select a valid relationship'
    ),
});

/**
 * Type inference from schema
 * 
 * This creates a TypeScript type from the Yup schema, ensuring type safety
 * between the validation schema and the form values.
 */
export type PatientFormValues = yup.InferType<typeof patientFormSchema>;

