// ============================================================================
// ADDRESS INFORMATION SECTION
// ============================================================================
// Form section for collecting patient address details.
//
// FIELDS:
// - Street Address (optional) - Full street address
// - City (optional) - City name
// - State (optional) - 2-character state code (e.g., CA, NY)
// - ZIP Code (optional) - 5-digit US ZIP code
//
// VALIDATION:
// - Street Address: Max 100 characters
// - City: Max 50 characters
// - State: Exactly 2 characters (enforced by maxLength and validation)
// - ZIP Code: Exactly 5 digits (enforced by maxLength and regex validation)
//
// DESIGN NOTES:
// - All fields are optional to accommodate patients without permanent address
// - Three-column grid for city/state/zip creates compact, logical grouping
// - Purple gradient theme to distinguish from other sections
// - MaxLength attributes prevent over-entry
//
// ACCESSIBILITY:
// - Autocomplete attributes for browser autofill
// - Clear placeholders showing expected format
// - Logical tab order (street → city → state → zip)
// ============================================================================

'use client';

import React from 'react';
import { FormInput } from '@/lib/form';
import { SectionHeader } from './SectionHeader';

/**
 * AddressInfoSection Component
 * 
 * Renders the address information section of the patient registration form.
 * Collects full mailing address for patient records and correspondence.
 * 
 * DESIGN DECISIONS:
 * - Street address in full-width row for longer addresses
 * - City/State/ZIP in three-column grid for compact layout
 * - All fields optional to accommodate homeless or transient patients
 * - MaxLength attributes prevent data entry errors
 * - Purple gradient for visual variety and section distinction
 * 
 * LAYOUT STRATEGY:
 * - Street address gets full width (can be long)
 * - City gets more space than state/zip (typically longer)
 * - State and ZIP are short, fixed-length fields
 * - Responsive: stacks to single column on mobile
 * 
 * VALIDATION RULES:
 * - State: Must be exactly 2 uppercase letters (e.g., CA, NY, TX)
 * - ZIP: Must be exactly 5 digits (e.g., 94102, 10001)
 * - All other fields: Length limits only
 * 
 * @example
 * ```tsx
 * <Form initialValues={...} onSubmit={...}>
 *   <AddressInfoSection />
 * </Form>
 * ```
 */
export function AddressInfoSection() {
  return (
    <div className="mb-10">
      {/* Section Header with Location Pin Icon */}
      <SectionHeader
        title="Address Information"
        subtitle="Where do you live?"
        gradientFrom="from-purple-500"
        gradientTo="to-purple-600"
        icon={
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {/* Location pin icon - represents address/location */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        }
      />

      {/* Street Address - Full Width */}
      <div className="mb-6">
        <FormInput
          name="address"
          label="Street Address"
          placeholder="123 Main St"
          autoComplete="street-address" // Enables browser autofill
        />
      </div>

      {/* City, State, ZIP - Three Column Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* City Field */}
        <FormInput
          name="city"
          label="City"
          placeholder="San Francisco"
          autoComplete="address-level2" // Standard autocomplete for city
        />

        {/* State Field - Limited to 2 characters */}
        <FormInput
          name="state"
          label="State"
          placeholder="CA"
          maxLength={2} // Prevent entering more than 2 characters
          autoComplete="address-level1" // Standard autocomplete for state
        />

        {/* ZIP Code Field - Limited to 5 digits */}
        <FormInput
          name="zipCode"
          label="ZIP Code"
          placeholder="94102"
          maxLength={5} // Prevent entering more than 5 characters
          autoComplete="postal-code" // Standard autocomplete for postal code
        />
      </div>
    </div>
  );
}

