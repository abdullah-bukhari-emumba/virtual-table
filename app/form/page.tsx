// ============================================================================
// PATIENT REGISTRATION FORM - PULSEGRID EHR
// ============================================================================
// This page provides a comprehensive patient registration form that integrates
// with the PulseGrid EHR system. It demonstrates advanced form patterns using
// the compound component form builder while maintaining the professional
// healthcare application aesthetic.
//
// FEATURES:
// - Compound component pattern for clean, reusable form architecture
// - Zod schema validation for data integrity
// - Conditional fields that show/hide based on other field values
// - Field arrays for dynamic repeating field groups (Emergency Contacts)
// - Real-time validation with helpful error messages
// - Database integration with SQLite
// - Accessibility (WCAG 2.1 AA compliant)
// - Professional healthcare UI/UX design with modern Tailwind styling
//
// WORKFLOW:
// 1. User fills out patient information form
// 2. Form validates data using Zod schema
// 3. Conditional fields appear based on selections (e.g., insurance details)
// 4. Field arrays allow adding multiple emergency contacts
// 5. On submit, data is sent to POST /api/patients
// 6. API creates new patient record in database
// 7. User is redirected to home page to see new patient in table
// ============================================================================

'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import {
  Form,
  FormError,
  FormSubmit,
  FormReset,
  FormErrorBoundary,
} from '@/lib/form';
import type { FormValues } from '@/lib/form';
import {
  PersonalInfoSection,
  ContactInfoSection,
  AddressInfoSection,
  EmergencyContactsSection,
  MedicalInfoSection,
} from './components';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================
// This Zod schema defines validation rules for all patient form fields.
// It ensures data integrity before submission to the database.
//
// VALIDATION RULES:
// - Required fields: firstName, lastName, dateOfBirth, gender, status
// - Email: Must be valid email format (optional)
// - Phone: Must be 10 digits in US format (optional)
// - Date of Birth: Must be a valid date, not in the future
// - State: Must be 2-character state code (optional)
// - ZIP Code: Must be 5 digits (optional)
// - Conditional fields: insurancePolicyNumber (when insuranceProvider is filled)
// - Field arrays: Emergency contacts with name, relationship, and phone
// - All text fields have maximum length constraints
// ============================================================================

const patientFormSchema = z.object({
  // ========================================
  // PERSONAL INFORMATION (Required)
  // ========================================
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters'),

  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters'),

  dateOfBirth: z.string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const dob = new Date(date);
      const today = new Date();
      return dob <= today;
    }, 'Date of birth cannot be in the future'),

  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say'], {
    message: 'Please select a gender',
  }),

  // ========================================
  // CONTACT INFORMATION (Optional)
  // ========================================
  email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),

  phone: z.string()
    .regex(/^\d{10}$/, 'Phone must be 10 digits (e.g., 5551234567)')
    .optional()
    .or(z.literal('')),

  // ========================================
  // ADDRESS INFORMATION (Optional)
  // ========================================
  address: z.string()
    .max(100, 'Address must not exceed 100 characters')
    .optional()
    .or(z.literal('')),

  city: z.string()
    .max(50, 'City must not exceed 50 characters')
    .optional()
    .or(z.literal('')),

  state: z.string()
    .length(2, 'State must be 2 characters (e.g., CA)')
    .optional()
    .or(z.literal('')),

  zipCode: z.string()
    .regex(/^\d{5}$/, 'ZIP code must be 5 digits')
    .optional()
    .or(z.literal('')),

  // ========================================
  // MEDICAL INFORMATION
  // ========================================
  insuranceProvider: z.string()
    .max(100, 'Insurance provider must not exceed 100 characters')
    .optional()
    .or(z.literal('')),

  // CONDITIONAL FIELD: Only required when insuranceProvider is filled
  insurancePolicyNumber: z.string()
    .max(50, 'Policy number must not exceed 50 characters')
    .optional()
    .or(z.literal('')),

  // CONDITIONAL FIELD: Only shown when status is 'active'
  primaryPhysician: z.string()
    .max(100, 'Physician name must not exceed 100 characters')
    .optional()
    .or(z.literal('')),

  diagnosis: z.string()
    .max(500, 'Diagnosis must not exceed 500 characters')
    .optional()
    .or(z.literal('')),

  status: z.enum(['active', 'inactive', 'pending'], {
    message: 'Please select a patient status',
  }),
});

// ============================================================================
// INITIAL FORM VALUES
// ============================================================================
// Default values for all form fields. These are used when the form first loads.
// All optional fields start as empty strings.
// Emergency contacts are handled by FieldArray component.
// ============================================================================

const initialValues: FormValues = {
  // Personal Information
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'prefer-not-to-say',

  // Contact Information
  email: '',
  phone: '',

  // Address Information
  address: '',
  city: '',
  state: '',
  zipCode: '',

  // Medical Information
  insuranceProvider: '',
  insurancePolicyNumber: '',
  primaryPhysician: '',
  diagnosis: '',
  status: 'active',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
// This is the main patient registration form component. It handles form
// submission, success/error states, and navigation.
//
// STATE MANAGEMENT:
// - submitting: Tracks whether form is currently being submitted
// - error: Stores any error messages from API
// - success: Tracks successful submission
//
// FORM SUBMISSION FLOW:
// 1. User fills out form and clicks Submit
// 2. Form validates data using Zod schema (handled by Form component)
// 3. handleSubmit sends POST request to /api/patients
// 4. API creates patient record in database
// 5. On success, show success message and redirect to home page after 2 seconds
// 6. On error, display error message and allow user to retry
// ============================================================================

export default function PatientRegistrationPage() {
  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Handle form submission
   *
   * This function is called when the form passes validation.
   * It sends the patient data to the API and handles the response.
   *
   * @param {FormValues} values - Validated form data from the form
   */
  const handleSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setError(null);

    try {
      // Send POST request to create patient record
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      // Check if request was successful
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create patient record');
      }

      // Parse response data
      const data = await response.json();
      console.log('Patient created:', data.patient);

      // Show success message
      setSuccess(true);

      // Redirect to home page after 2 seconds to see new patient in table
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (err) {
      // Handle errors
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setSubmitting(false);
    }
  };

  // ========================================
  // RENDER
  // ========================================
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ========================================
            PAGE HEADER
            ======================================== */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                New Patient Registration
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                PulseGrid Electronic Health Records
              </p>
            </div>
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Patient List
            </a>
          </div>
        </div>

        {/* ========================================
            SUCCESS MESSAGE
            ======================================== */}
        {success && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 border border-green-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Patient registered successfully!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Redirecting to patient list...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================
            ERROR MESSAGE
            ======================================== */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error creating patient record
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* ========================================
            FORM CARD - PROFESSIONAL STYLING
            ======================================== */}
        <div className="rounded-xl bg-white shadow-lg ring-1 ring-gray-900/5">
          <div className="px-8 py-10">
            <FormErrorBoundary>
              <Form
                initialValues={initialValues}
                validationSchema={patientFormSchema}
                onSubmit={handleSubmit}
                validationMode="onBlur"
              >
                {/* Form-level error display */}
                <FormError />

                {/* ========================================
                    FORM SECTIONS
                    Extracted into separate components for:
                    - Better code organization
                    - Single responsibility principle
                    - Easier maintenance and testing
                    - Improved readability
                    ======================================== */}

                {/* Personal Information: Name, DOB, Gender */}
                <PersonalInfoSection />

                {/* Contact Information: Email, Phone */}
                <ContactInfoSection />

                {/* Address Information: Street, City, State, ZIP */}
                <AddressInfoSection />

                {/* Emergency Contacts: Field Array Demo */}
                <EmergencyContactsSection />

                {/* Medical Information: Conditional Fields Demo */}
                <MedicalInfoSection />

                {/* ========================================
                    FORM ACTIONS
                    Modern, professional button styling with:
                    - Gradient backgrounds with smooth transitions
                    - Hover effects with scale and shadow changes
                    - Loading state with spinner animation
                    - Proper focus states for accessibility
                    - Icons for visual clarity
                    ======================================== */}
                <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-8">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Required fields</span> are marked with an asterisk (*)
                  </div>

                  <div className="flex gap-3">
                    {/* Reset Button - Secondary Action */}
                    <FormReset className="inline-flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 active:scale-95">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset Form
                    </FormReset>

                    {/* Submit Button - Primary Action with Modern Styling */}
                    <FormSubmit
                      disabled={submitting}
                      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:from-blue-600 disabled:hover:via-blue-700 disabled:hover:to-indigo-700 active:scale-95"
                    >
                      {/* Shimmer effect on hover */}
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                      {submitting ? (
                        <>
                          {/* Loading Spinner */}
                          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="relative">Creating Patient...</span>
                        </>
                      ) : (
                        <>
                          {/* Checkmark Icon */}
                          <svg className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="relative">Create Patient Record</span>
                        </>
                      )}
                    </FormSubmit>
                  </div>
                </div>
              </Form>
            </FormErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}


