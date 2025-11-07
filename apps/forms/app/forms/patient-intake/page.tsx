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

import React, { useState } from 'react';
import { Form } from './components/Form';
import { FormErrorBoundary } from './components/FormErrorBoundary';
import { useFormContext } from './components/FormContext';
import { patientFormSchema } from './schemas/patientFormSchema';
import type { FormValues } from './types';

/**
 * ErrorTestComponent - Component to test error boundary
 *
 * This component throws an error when the button is clicked,
 * allowing us to test the FormErrorBoundary in development mode.
 */
function ErrorTestComponent() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('Test error: This is a simulated error to demonstrate the Error Boundary!');
  }

  return (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="text-sm font-semibold text-yellow-900 mb-2">
        🧪 Error Boundary Test (Development Only)
      </h3>
      <p className="text-xs text-yellow-800 mb-3">
        Click the button below to trigger an error and see the error boundary in action.
      </p>
      <button
        type="button"
        onClick={() => setShouldThrow(true)}
        className="
          px-4 py-2
          bg-yellow-600 text-white
          text-sm font-medium rounded
          hover:bg-yellow-700
          focus:outline-none focus:ring-2 focus:ring-yellow-500
          transition-colors
        "
      >
        Trigger Error
      </button>
    </div>
  );
}

/**
 * StateDebugPanel - Shows normalized state structure (Development Only)
 *
 * This component displays the current form state to verify normalization is working.
 */
function StateDebugPanel() {
  const { values, arrayMetadata } = useFormContext();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-purple-900">
          🔍 Normalized State Debug Panel (Development Only)
        </h3>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-purple-700 hover:text-purple-900 font-medium"
        >
          {isExpanded ? '▼ Collapse' : '▶ Expand'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-purple-800 mb-1">Values (Normalized):</h4>
            <pre className="text-xs text-black bg-white p-2 rounded border border-purple-200 overflow-auto max-h-60">
              {JSON.stringify(values, null, 2)}
            </pre>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-purple-800 mb-1">Array Metadata:</h4>
            <pre className="text-xs text-black bg-white p-2 rounded border border-purple-200 overflow-auto max-h-40">
              {JSON.stringify(arrayMetadata, null, 2)}
            </pre>
          </div>

          <div className="text-xs text-purple-700 bg-purple-100 p-2 rounded">
            <strong>Note:</strong> Values are stored as flat paths (e.g., <code>emergencyContacts[0].name</code>).
            This enables O(1) array operations instead of O(n) array spreading.
          </div>
        </div>
      )}
    </div>
  );
}

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

    // Emergency Contact (Legacy - single contact)
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',

    // Emergency Contacts (New - dynamic array)
    // Start with one empty contact by default
    emergencyContacts: [
      { name: '', phone: '', relationship: '' }
    ],
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

        {/* Error Boundary wraps the entire form to catch any errors */}
        <FormErrorBoundary>
          {/* Error Test Component (Development Only) */}
          {/* {process.env.NODE_ENV === 'development' && <ErrorTestComponent />} */}

          {/* Form Container */}
          <div className="bg-white shadow-lg rounded-lg p-8">
          <Form
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validationSchema={patientFormSchema}
            validateOnChange={true}
            validateOnBlur={true}
          >
            {/* State Debug Panel (Development Only) */}
            {process.env.NODE_ENV === 'development' && <StateDebugPanel />}
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
                SECTION 5: EMERGENCY CONTACT (Legacy - Single Contact)
                ============================================================ */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Emergency Contact (Legacy)
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
                SECTION 6: EMERGENCY CONTACTS (Dynamic Array)
                ============================================================
                This section demonstrates the Form.FieldArray component.

                FEATURES DEMONSTRATED:
                - Dynamic field arrays (add/remove items)
                - Nested validation for each array item
                - Clean UI with remove buttons for each item
                - Default values for new items
                - Array-specific error handling
                ============================================================ */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Emergency Contacts (Dynamic Array)
              </h2>

              <p className="text-sm text-gray-600 mb-4">
                Add multiple emergency contacts. You can add or remove contacts as needed.
              </p>

              {/* FIELD ARRAY: Emergency Contacts
                  This demonstrates dynamic array fields where users can add/remove items.
                  Each item has its own validation rules defined in the schema. */}
              <Form.FieldArray
                name="emergencyContacts"
                defaultValue={{ name: '', phone: '', relationship: '' }}
                addButtonText="Add Another Contact"
              >
                {({ items, remove }) => (
                  <>
                    {items.map((_, index) => (
                      <div
                        key={index}
                        className="p-4 mb-4 border border-gray-200 rounded-lg bg-gray-50"
                      >
                        {/* Contact Header with Remove Button */}
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-md font-semibold text-gray-700">
                            Contact #{index + 1}
                          </h4>

                          {/* Remove Button - Only show if more than 1 contact */}
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="
                                px-3 py-1
                                text-sm text-red-600
                                border border-red-300
                                rounded
                                hover:bg-red-50
                                focus:outline-none focus:ring-2 focus:ring-red-500
                                transition-colors
                              "
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        {/* Contact Name Field */}
                        <Form.Field
                          name={`emergencyContacts[${index}].name`}
                          label="Contact Name"
                          required
                        >
                          <Form.Input
                            name={`emergencyContacts[${index}].name`}
                            type="text"
                            placeholder="Full name of emergency contact"
                          />
                        </Form.Field>

                        {/* Contact Phone Field */}
                        <Form.Field
                          name={`emergencyContacts[${index}].phone`}
                          label="Contact Phone"
                          required
                        >
                          <Form.Input
                            name={`emergencyContacts[${index}].phone`}
                            type="tel"
                            placeholder="1234567890"
                          />
                        </Form.Field>

                        {/* Contact Relationship Field */}
                        <Form.Field
                          name={`emergencyContacts[${index}].relationship`}
                          label="Relationship"
                          required
                        >
                          <Form.Select
                            name={`emergencyContacts[${index}].relationship`}
                            options={relationshipOptions}
                            placeholder="Select relationship"
                          />
                        </Form.Field>
                      </div>
                    ))}
                  </>
                )}
              </Form.FieldArray>
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
            <li>✓ <strong>NEW:</strong> Dynamic field arrays (Form.FieldArray) with add/remove functionality</li>
            <li>✓ <strong>NEW:</strong> Nested validation for array items</li>
            <li>✓ <strong>NEW:</strong> Error boundary with user-friendly error handling</li>
            <li>✓ Form data logged to console on successful submission</li>
          </ul>
        </div>
        </FormErrorBoundary>
      </div>
    </div>
  );
}

