// ============================================================================
// MEDICAL INFORMATION SECTION
// ============================================================================
// Form section for collecting patient medical and insurance information.
// Demonstrates conditional fields that show/hide based on other field values.
//
// FIELDS:
// - Patient Status (required) - Active, Inactive, or Pending
// - Primary Physician (conditional) - Only shown when status is 'active'
// - Insurance Provider (optional) - Name of insurance company
// - Insurance Policy Number (conditional) - Only shown when provider is filled
// - Diagnosis (optional) - Initial diagnosis or chief complaint
//
// CONDITIONAL FIELD LOGIC:
// 1. Primary Physician Field:
//    - Condition: status === 'active'
//    - Rationale: Only active patients need assigned physicians
//    - Visual: Blue-bordered box with info icon
//
// 2. Insurance Policy Number Field:
//    - Condition: insuranceProvider is not empty
//    - Rationale: Policy number only relevant if patient has insurance
//    - Visual: Green-bordered box with checkmark icon
//
// DESIGN NOTES:
// - Indigo gradient theme for medical/clinical information
// - Conditional fields have colored borders to draw attention
// - Icons indicate the type of conditional requirement
// - Smooth transitions when fields appear/disappear
//
// ACCESSIBILITY:
// - Screen reader announcements when conditional fields appear
// - Clear visual indicators for conditional fields
// - Help text explains when fields are required
// ============================================================================

'use client';

import React from 'react';
import { FormInput, FormRadio, FormTextarea, ConditionalField } from '@/lib/form';
import { SectionHeader } from './SectionHeader';

/**
 * MedicalInfoSection Component
 * 
 * Renders the medical information section with conditional fields.
 * This demonstrates the ConditionalField component which shows/hides
 * fields based on the values of other fields.
 * 
 * CONDITIONAL FIELD PATTERN:
 * The ConditionalField component watches another field's value and
 * conditionally renders its children based on a predicate function.
 * 
 * Example 1 - Primary Physician (status-based):
 * ```tsx
 * <ConditionalField
 *   condition={{
 *     when: 'status',              // Watch the 'status' field
 *     is: (value) => value === 'active'  // Show when status is 'active'
 *   }}
 * >
 *   <FormInput name="primaryPhysician" ... />
 * </ConditionalField>
 * ```
 * 
 * Example 2 - Insurance Policy Number (value-based):
 * ```tsx
 * <ConditionalField
 *   condition={{
 *     when: 'insuranceProvider',   // Watch the 'insuranceProvider' field
 *     is: (value) => value.trim().length > 0  // Show when not empty
 *   }}
 * >
 *   <FormInput name="insurancePolicyNumber" ... />
 * </ConditionalField>
 * ```
 * 
 * DESIGN DECISIONS:
 * - Patient Status placed first as it controls conditional field visibility
 * - Conditional fields wrapped in colored boxes to indicate special status
 * - Icons provide visual cues about the condition type
 * - Smooth transitions (duration-300) when fields appear/disappear
 * - Indigo gradient for medical/clinical theme
 * 
 * VALIDATION CONSIDERATIONS:
 * - Conditional fields are optional in the schema
 * - Validation only applies when fields are visible
 * - Form submission includes conditional field values if present
 * 
 * @example
 * ```tsx
 * <Form initialValues={...} onSubmit={...}>
 *   <MedicalInfoSection />
 * </Form>
 * ```
 */
export function MedicalInfoSection() {
  return (
    <div className="mb-10">
      {/* Section Header with Medical Document Icon */}
      <SectionHeader
        title="Medical Information"
        subtitle="Insurance and medical details"
        gradientFrom="from-indigo-500"
        gradientTo="to-indigo-600"
        icon={
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {/* Document/clipboard icon - represents medical records */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        }
      />

      {/* Patient Status - Controls Primary Physician Conditional Field */}
      <div className="mb-6">
        <FormRadio
          name="status"
          label="Patient Status"
          options={[
            {
              value: 'active',
              label: 'Active - Currently receiving care',
            },
            {
              value: 'inactive',
              label: 'Inactive - Not currently receiving care',
            },
            {
              value: 'pending',
              label: 'Pending - Awaiting approval',
            },
          ]}
          required
        />
      </div>

      {/* CONDITIONAL FIELD #1: Primary Physician (only for active patients) */}
      {/* 
        WHY: Active patients need an assigned primary physician for care coordination.
        Inactive or pending patients don't need this assignment yet.
        
        HOW IT WORKS:
        - ConditionalField watches the 'status' field
        - When status === 'active', this field appears with a smooth transition
        - When status changes to 'inactive' or 'pending', field disappears
        - Screen readers announce the visibility change
      */}
      <ConditionalField
        condition={{
          when: 'status', // Watch the 'status' field
          is: (value) => value === 'active', // Show when status is 'active'
        }}
      >
        {/* Blue-bordered box indicates this is a conditional field */}
        <div className="mb-6 rounded-lg border-2 border-blue-100 bg-blue-50/50 p-4 transition-all duration-300">
          {/* Header with info icon */}
          <div className="mb-3 flex items-center gap-2">
            <svg
              className="h-5 w-5 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium text-blue-900">
              Active Patient Information
            </span>
          </div>

          {/* Primary Physician Field */}
          <FormInput
            name="primaryPhysician"
            label="Primary Physician"
            placeholder="Dr. Smith"
            className="transition-all duration-200"
          />
        </div>
      </ConditionalField>

      {/* Insurance Provider - Controls Policy Number Conditional Field */}
      <div className="mb-6">
        <FormInput
          name="insuranceProvider"
          label="Insurance Provider"
          placeholder="Blue Cross Blue Shield"
          helpText="Leave blank if no insurance" // Clarifies field is optional
          className="transition-all duration-200"
        />
      </div>

      {/* CONDITIONAL FIELD #2: Insurance Policy Number (only when provider is filled) */}
      {/*
        WHY: Policy number is only relevant if the patient has insurance.
        No need to collect this if insuranceProvider is empty.
        
        HOW IT WORKS:
        - ConditionalField watches the 'insuranceProvider' field
        - When insuranceProvider has a value (not empty), this field appears
        - When insuranceProvider is cleared, field disappears
        - Type checking ensures value is a string before checking length
      */}
      <ConditionalField
        condition={{
          when: 'insuranceProvider', // Watch the 'insuranceProvider' field
          is: (value) => typeof value === 'string' && value.trim().length > 0, // Show when not empty
        }}
      >
        {/* Green-bordered box indicates insurance details are required */}
        <div className="mb-6 rounded-lg border-2 border-green-100 bg-green-50/50 p-4 transition-all duration-300">
          {/* Header with checkmark icon */}
          <div className="mb-3 flex items-center gap-2">
            <svg
              className="h-5 w-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium text-green-900">
              Insurance Details Required
            </span>
          </div>

          {/* Insurance Policy Number Field */}
          <FormInput
            name="insurancePolicyNumber"
            label="Insurance Policy Number"
            placeholder="ABC123456789"
            className="transition-all duration-200"
          />
        </div>
      </ConditionalField>

      {/* Diagnosis / Chief Complaint */}
      <div className="mb-6">
        <FormTextarea
          name="diagnosis"
          label="Initial Diagnosis / Chief Complaint"
          placeholder="Enter any initial diagnosis or chief complaint..."
          rows={4} // Multi-line for detailed medical notes
          className="transition-all duration-200"
        />
      </div>
    </div>
  );
}

