// ============================================================================
// EMERGENCY CONTACTS SECTION
// ============================================================================
// Form section for collecting emergency contact information using field arrays.
// Demonstrates the FieldArray component for dynamic repeating field groups.
//
// FIELD ARRAY FEATURES:
// - Add up to 3 emergency contacts
// - Remove contacts individually
// - Each contact has: name, relationship, phone
// - Minimum 0 contacts (optional)
// - Maximum 3 contacts (prevents excessive entries)
//
// FIELD ARRAY BEHAVIOR:
// - Starts with 0 contacts (user must explicitly add)
// - "Add Emergency Contact" button appears when < 3 contacts
// - Each contact gets a numbered header (Contact #1, #2, #3)
// - Remove button appears on each contact card
// - Smooth animations when adding/removing
//
// DESIGN NOTES:
// - Red gradient theme to indicate urgency/emergency
// - Two-column grid for name and relationship
// - Full-width phone field below
// - Professional card-based layout for each contact
//
// ACCESSIBILITY:
// - Clear labels for all fields
// - Numbered contact headers for screen readers
// - Remove buttons have descriptive labels
// - Keyboard navigation support
// ============================================================================

'use client';

import React from 'react';
import { FormInput, FieldArray } from '@/lib/form';
import { SectionHeader } from './SectionHeader';

/**
 * EmergencyContactsSection Component
 * 
 * Renders the emergency contacts section using the FieldArray component.
 * This demonstrates dynamic field arrays where users can add/remove multiple
 * sets of related fields.
 * 
 * FIELD ARRAY PATTERN:
 * The FieldArray component manages an array of emergency contacts. Each contact
 * is a group of fields (name, relationship, phone). The component handles:
 * - Adding new contacts (up to maxItems)
 * - Removing existing contacts (down to minItems)
 * - Generating unique field names (emergencyContacts.0.name, etc.)
 * - Providing render props for custom field rendering
 * 
 * DESIGN DECISIONS:
 * - minItems={0}: Emergency contacts are optional
 * - maxItems={3}: Limit to 3 to prevent form bloat
 * - initialCount={0}: Start with no contacts, user adds as needed
 * - Two-column grid for name/relationship (related info)
 * - Full-width phone field (typically longer with formatting)
 * - Red gradient to indicate emergency/urgent nature
 * 
 * FIELD NAMING CONVENTION:
 * Fields are named using dot notation for nested data:
 * - emergencyContacts.0.name
 * - emergencyContacts.0.relationship
 * - emergencyContacts.0.phone
 * - emergencyContacts.1.name (second contact)
 * - etc.
 * 
 * This creates a structured data object on form submission:
 * ```json
 * {
 *   "emergencyContacts": [
 *     { "name": "Jane Doe", "relationship": "Spouse", "phone": "5551234567" },
 *     { "name": "John Smith", "relationship": "Brother", "phone": "5559876543" }
 *   ]
 * }
 * ```
 * 
 * @example
 * ```tsx
 * <Form initialValues={...} onSubmit={...}>
 *   <EmergencyContactsSection />
 * </Form>
 * ```
 */
export function EmergencyContactsSection() {
  return (
    <div className="mb-10">
      {/* Section Header with People Icon */}
      <SectionHeader
        title="Emergency Contacts"
        subtitle="Who should we contact in case of emergency?"
        gradientFrom="from-red-500"
        gradientTo="to-red-600"
        icon={
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {/* Multiple people icon - represents emergency contacts */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        }
      />

      {/* Field Array for Dynamic Emergency Contacts */}
      <FieldArray
        name="emergencyContacts"
        minItems={0} // Optional - can have zero contacts
        maxItems={3} // Limit to 3 contacts to prevent form bloat
        addButtonLabel="Add Emergency Contact" // Custom button text
        initialCount={0} // Start with no contacts (user adds as needed)
      >
        {/* Render function receives index and helper functions */}
        {({ index }) => (
          <div className="space-y-4">
            {/* Name and Relationship - Two Column Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Contact Name Field */}
              <FormInput
                name={`emergencyContacts.${index}.name`} // Dot notation for nested data
                label="Contact Name"
                placeholder="Jane Doe"
                className="transition-all duration-200"
              />

              {/* Relationship Field */}
              <FormInput
                name={`emergencyContacts.${index}.relationship`}
                label="Relationship"
                placeholder="Spouse, Parent, Sibling, etc."
                className="transition-all duration-200"
              />
            </div>

            {/* Contact Phone - Full Width */}
            <FormInput
              name={`emergencyContacts.${index}.phone`}
              label="Contact Phone"
              type="tel" // Triggers numeric keyboard on mobile
              placeholder="5551234567"
              className="transition-all duration-200"
            />
          </div>
        )}
      </FieldArray>
    </div>
  );
}

