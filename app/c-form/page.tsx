// ============================================================================
// PATIENT INTAKE FORM - DEMONSTRATION PAGE
// ============================================================================
// This page demonstrates the custom form system with:
// - Compound component pattern (Form, Form.Field, Form.Input, etc.)
// - Yup schema validation
// - Conditional field rendering
// - Real-time error display
// - Healthcare/EHR context (patient intake form)
//
// FEATURES DEMONSTRATED:
// 1. Form validation with Yup schema
// 2. Conditional fields (show/hide based on other field values)
// 3. Multiple input types (text, email, date, select, textarea, checkbox)
// 4. Error display (only for touched fields)
// 5. Form submission with console logging
// ============================================================================

'use client';

import React from 'react';
import { Form } from './components/Form';
import { patientFormSchema } from './schemas/patientFormSchema';
import type { FormValues } from './types';

/**
 * PatientIntakeFormPage - Main page component
 * 
 * This page renders a comprehensive patient intake form for an EHR system.
 * It demonstrates all features of the custom form system.
 */
export default function PatientIntakeFormPage() {
  // ==========================================================================
  // INITIAL FORM VALUES
  // ==========================================================================
  // Define initial values for all form fields
  // These values populate the form on first render
  const initialValues: FormValues = {
    // Personal Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    
    // Contact Information
    email: '',
    phone: '',
    address: '',
    
    // Medical Information
    bloodType: '',
    hasAllergies: false,
    allergies: '',
    hasChronicConditions: false,
    chronicConditions: '',
    
    // Insurance Information
    hasInsurance: false,
    insuranceProvider: '',
    insurancePolicyNumber: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
  };

  // ==========================================================================
  // FORM SUBMISSION HANDLER
  // ==========================================================================
  /**
   * handleSubmit - Called when form is successfully validated and submitted
   * 
   * For this demonstration, we simply log the form data to the console.
   * In a real application, this would:
   * - Send data to an API endpoint
   * - Save to database
   * - Show success message
   * - Redirect to another page
   */
  const handleSubmit = (values: FormValues) => {
    console.log('='.repeat(80));
    console.log('FORM SUBMITTED SUCCESSFULLY');
    console.log('='.repeat(80));
    console.log('Form Values:', JSON.stringify(values, null, 2));
    console.log('='.repeat(80));
    
    // Show browser alert for demo purposes
    alert('Form submitted successfully! Check the console for form data.');
  };

  // ==========================================================================
  // DROPDOWN OPTIONS
  // ==========================================================================
  // Define options for select and radio inputs
  
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ];

  const bloodTypeOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
    { value: 'unknown', label: 'Unknown' },
  ];

  const relationshipOptions = [
    { value: 'spouse', label: 'Spouse' },
    { value: 'parent', label: 'Parent' },
    { value: 'child', label: 'Child' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'friend', label: 'Friend' },
    { value: 'other', label: 'Other' },
  ];

  // ==========================================================================
  // RENDER FORM
  // ==========================================================================
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Patient Intake Form</h1>
          <p className="mt-2 text-sm text-gray-600">
            PulseGrid EHR - Electronic Health Records Management
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Please fill out all required fields marked with an asterisk (*)
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white shadow-lg rounded-lg p-8">
          <Form
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={patientFormSchema}
            validateOnChange={true}
            validateOnBlur={true}
          >
            {/* ============================================================
                SECTION 1: PERSONAL INFORMATION
                ============================================================ */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Personal Information
              </h2>

              {/* First Name */}
              <Form.Field name="firstName" label="First Name" required>
                <Form.Input 
                  name="firstName" 
                  type="text" 
                  placeholder="Enter your first name"
                />
              </Form.Field>

              {/* Last Name */}
              <Form.Field name="lastName" label="Last Name" required>
                <Form.Input 
                  name="lastName" 
                  type="text" 
                  placeholder="Enter your last name"
                />
              </Form.Field>

              {/* Date of Birth */}
              <Form.Field name="dateOfBirth" label="Date of Birth" required>
                <Form.Input 
                  name="dateOfBirth" 
                  type="date"
                />
              </Form.Field>

              {/* Gender */}
              <Form.Field name="gender" label="Gender" required>
                <Form.Select 
                  name="gender" 
                  options={genderOptions}
                  placeholder="Select your gender"
                />
              </Form.Field>
            </div>

            {/* ============================================================
                SECTION 2: CONTACT INFORMATION
                ============================================================ */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Contact Information
              </h2>

              {/* Email */}
              <Form.Field name="email" label="Email Address" required>
                <Form.Input 
                  name="email" 
                  type="email" 
                  placeholder="your.email@example.com"
                />
              </Form.Field>

              {/* Phone */}
              <Form.Field name="phone" label="Phone Number" required>
                <Form.Input 
                  name="phone" 
                  type="tel" 
                  placeholder="(555) 123-4567"
                />
              </Form.Field>

              {/* Address */}
              <Form.Field name="address" label="Address" required>
                <Form.Textarea 
                  name="address" 
                  placeholder="Enter your full address"
                  rows={3}
                />
              </Form.Field>
            </div>

            {/* ============================================================
                SECTION 3: MEDICAL INFORMATION
                ============================================================ */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Medical Information
              </h2>

              {/* Blood Type */}
              <Form.Field name="bloodType" label="Blood Type" required>
                <Form.Select 
                  name="bloodType" 
                  options={bloodTypeOptions}
                  placeholder="Select your blood type"
                />
              </Form.Field>

              {/* Has Allergies Checkbox */}
              <div className="mb-6">
                <Form.Checkbox 
                  name="hasAllergies" 
                  label="I have allergies"
                />
              </div>

              {/* CONDITIONAL FIELD: Allergies Details
                  This field only shows when hasAllergies is true
                  Demonstrates conditional field rendering */}
              <Form.Field 
                name="allergies" 
                label="Allergy Details" 
                required
                showWhen={[{ field: 'hasAllergies', value: true }]}
              >
                <Form.Textarea 
                  name="allergies" 
                  placeholder="Please list all known allergies (medications, foods, environmental, etc.)"
                  rows={4}
                />
              </Form.Field>

              {/* Has Chronic Conditions Checkbox */}
              <div className="mb-6">
                <Form.Checkbox 
                  name="hasChronicConditions" 
                  label="I have chronic conditions"
                />
              </div>

              {/* CONDITIONAL FIELD: Chronic Conditions Details
                  This field only shows when hasChronicConditions is true */}
              <Form.Field 
                name="chronicConditions" 
                label="Chronic Condition Details" 
                required
                showWhen={[{ field: 'hasChronicConditions', value: true }]}
              >
                <Form.Textarea 
                  name="chronicConditions" 
                  placeholder="Please list all chronic conditions (diabetes, hypertension, asthma, etc.)"
                  rows={4}
                />
              </Form.Field>
            </div>

            {/* ============================================================
                SECTION 4: INSURANCE INFORMATION
                ============================================================ */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Insurance Information
              </h2>

              {/* Has Insurance Checkbox */}
              <div className="mb-6">
                <Form.Checkbox 
                  name="hasInsurance" 
                  label="I have health insurance"
                />
              </div>

              {/* CONDITIONAL FIELD: Insurance Provider
                  This field only shows when hasInsurance is true */}
              <Form.Field 
                name="insuranceProvider" 
                label="Insurance Provider" 
                required
                showWhen={[{ field: 'hasInsurance', value: true }]}
              >
                <Form.Input 
                  name="insuranceProvider" 
                  type="text" 
                  placeholder="e.g., Blue Cross, Aetna, UnitedHealthcare"
                />
              </Form.Field>

              {/* CONDITIONAL FIELD: Insurance Policy Number
                  This field only shows when hasInsurance is true */}
              <Form.Field 
                name="insurancePolicyNumber" 
                label="Policy Number" 
                required
                showWhen={[{ field: 'hasInsurance', value: true }]}
              >
                <Form.Input 
                  name="insurancePolicyNumber" 
                  type="text" 
                  placeholder="Enter your policy number"
                />
              </Form.Field>
            </div>

            {/* ============================================================
                SECTION 5: EMERGENCY CONTACT
                ============================================================ */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Emergency Contact
              </h2>

              {/* Emergency Contact Name */}
              <Form.Field name="emergencyContactName" label="Contact Name" required>
                <Form.Input 
                  name="emergencyContactName" 
                  type="text" 
                  placeholder="Full name of emergency contact"
                />
              </Form.Field>

              {/* Emergency Contact Phone */}
              <Form.Field name="emergencyContactPhone" label="Contact Phone" required>
                <Form.Input 
                  name="emergencyContactPhone" 
                  type="tel" 
                  placeholder="(555) 123-4567"
                />
              </Form.Field>

              {/* Emergency Contact Relationship */}
              <Form.Field name="emergencyContactRelationship" label="Relationship" required>
                <Form.Select 
                  name="emergencyContactRelationship" 
                  options={relationshipOptions}
                  placeholder="Select relationship"
                />
              </Form.Field>
            </div>

            {/* ============================================================
                SUBMIT BUTTON
                ============================================================ */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Submit Patient Information
              </button>
            </div>
          </Form>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Form Features Demonstrated:
          </h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>✓ Compound component pattern (Form.Field, Form.Input, etc.)</li>
            <li>✓ Yup schema validation with real-time error display</li>
            <li>✓ Conditional fields (allergies, chronic conditions, insurance details)</li>
            <li>✓ Multiple input types (text, email, date, select, textarea, checkbox)</li>
            <li>✓ Form data logged to console on successful submission</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

