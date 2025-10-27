// ============================================================================
// PERSONAL INFORMATION SECTION
// ============================================================================
// Form section for collecting basic patient demographics including name,
// date of birth, and gender.
//
// FIELDS:
// - First Name (required) - Patient's given name
// - Last Name (required) - Patient's family name
// - Date of Birth (required) - Must not be in the future
// - Gender (required) - Male, Female, Other, or Prefer not to say
//
// VALIDATION:
// - Names must be 2-50 characters
// - Date of birth cannot be in the future
// - All fields are required
//
// ACCESSIBILITY:
// - Proper autocomplete attributes for browser autofill
// - Clear labels and error messages
// - Keyboard navigation support
// ============================================================================

'use client';

import React from 'react';
import { FormInput, FormRadio } from '@/lib/form';
import { SectionHeader } from './SectionHeader';

/**
 * PersonalInfoSection Component
 * 
 * Renders the personal information section of the patient registration form.
 * This section collects basic demographic data required for patient identification.
 * 
 * DESIGN DECISIONS:
 * - Two-column grid layout on medium+ screens for better space utilization
 * - Date input type for native date picker support
 * - Radio buttons for gender to ensure single selection
 * - Blue gradient theme to indicate primary/important information
 * 
 * FORM FIELDS:
 * 1. First Name - Text input with autocomplete="given-name"
 * 2. Last Name - Text input with autocomplete="family-name"
 * 3. Date of Birth - Date input with autocomplete="bday"
 * 4. Gender - Radio group with 4 options
 * 
 * @example
 * ```tsx
 * <Form initialValues={...} onSubmit={...}>
 *   <PersonalInfoSection />
 * </Form>
 * ```
 */
export function PersonalInfoSection() {
  return (
    <div className="mb-10">
      {/* Section Header with User Icon */}
      <SectionHeader
        title="Personal Information"
        subtitle="Basic patient demographics"
        gradientFrom="from-blue-500"
        gradientTo="to-blue-600"
        icon={
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {/* User icon - represents personal information */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        }
      />

      {/* Name Fields - Two Column Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* First Name Field */}
        <FormInput
          name="firstName"
          label="First Name"
          placeholder="John"
          required
          autoComplete="given-name" // Enables browser autofill
          className="transition-all duration-200" // Smooth hover/focus transitions
        />

        {/* Last Name Field */}
        <FormInput
          name="lastName"
          label="Last Name"
          placeholder="Doe"
          required
          autoComplete="family-name" // Enables browser autofill
          className="transition-all duration-200"
        />
      </div>

      {/* Date of Birth and Gender - Two Column Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Date of Birth Field */}
        <FormInput
          name="dateOfBirth"
          label="Date of Birth"
          type="date" // Native date picker
          required
          autoComplete="bday" // Enables browser autofill
          className="transition-all duration-200"
        />

        {/* Gender Radio Group */}
        <div>
          <FormRadio
            name="gender"
            label="Gender"
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
              { value: 'prefer-not-to-say', label: 'Prefer not to say' },
            ]}
            required
          />
        </div>
      </div>
    </div>
  );
}

