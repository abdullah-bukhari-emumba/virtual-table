// ============================================================================
// CONTACT INFORMATION SECTION
// ============================================================================
// Form section for collecting patient contact details including email and phone.
//
// FIELDS:
// - Email Address (optional) - Must be valid email format
// - Phone Number (optional) - Must be 10 digits in US format
//
// VALIDATION:
// - Email: Standard email format validation (user@domain.com)
// - Phone: Exactly 10 digits, no formatting characters (5551234567)
//
// DESIGN NOTES:
// - Both fields are optional to accommodate patients without contact info
// - Phone field uses tel input type for mobile keyboard optimization
// - Green gradient theme to indicate communication/contact
//
// ACCESSIBILITY:
// - Autocomplete attributes for browser autofill
// - Tel input type triggers numeric keyboard on mobile
// - Clear placeholder examples
// ============================================================================

'use client';

import React from 'react';
import { FormInput } from '@/lib/form';
import { SectionHeader } from './SectionHeader';

/**
 * ContactInfoSection Component
 * 
 * Renders the contact information section of the patient registration form.
 * Collects email and phone number for patient communication.
 * 
 * DESIGN DECISIONS:
 * - Two-column grid layout for balanced appearance
 * - Optional fields to accommodate patients without contact info
 * - Email input type for built-in validation and mobile keyboard
 * - Tel input type for numeric keyboard on mobile devices
 * - Green gradient to visually distinguish from personal info section
 * 
 * VALIDATION RULES:
 * - Email: Must match standard email pattern (validated by Zod schema)
 * - Phone: Must be exactly 10 digits with no formatting (e.g., 5551234567)
 * - Both fields accept empty string as valid (optional)
 * 
 * @example
 * ```tsx
 * <Form initialValues={...} onSubmit={...}>
 *   <ContactInfoSection />
 * </Form>
 * ```
 */
export function ContactInfoSection() {
  return (
    <div className="mb-10">
      {/* Section Header with Email Icon */}
      <SectionHeader
        title="Contact Information"
        subtitle="How can we reach you?"
        gradientFrom="from-green-500"
        gradientTo="to-green-600"
        icon={
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {/* Email/envelope icon - represents contact/communication */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        }
      />

      {/* Contact Fields - Two Column Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Email Address Field */}
        <FormInput
          name="email"
          label="Email Address"
          type="email" // Triggers email keyboard on mobile, provides basic validation
          placeholder="john.doe@example.com"
          autoComplete="email" // Enables browser autofill
          className="transition-all duration-200" // Smooth hover/focus transitions
        />

        {/* Phone Number Field */}
        <FormInput
          name="phone"
          label="Phone Number"
          type="tel" // Triggers numeric keyboard on mobile devices
          placeholder="5551234567" // Example without formatting to match validation
          autoComplete="tel" // Enables browser autofill
          className="transition-all duration-200"
        />
      </div>
    </div>
  );
}

