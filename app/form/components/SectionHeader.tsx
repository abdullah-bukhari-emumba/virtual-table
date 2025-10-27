// ============================================================================
// SECTION HEADER COMPONENT
// ============================================================================
// Reusable section header with gradient icon badge for form sections.
// This component provides consistent visual hierarchy across all form sections
// in the patient registration form.
//
// DESIGN PATTERN:
// - Gradient icon badge on the left (customizable color)
// - Section title and subtitle on the right
// - Consistent spacing and typography
// - Accessible heading structure
//
// USAGE:
// Used in all major sections of the patient registration form to create
// visual separation and improve scannability.
// ============================================================================

'use client';

import React, { ReactNode } from 'react';

/**
 * Props for the SectionHeader component
 */
interface SectionHeaderProps {
  /**
   * The main title of the section
   * @example "Personal Information"
   */
  title: string;

  /**
   * A brief description or subtitle for the section
   * @example "Basic patient demographics"
   */
  subtitle: string;

  /**
   * SVG icon to display in the gradient badge
   * Should be a valid React SVG element
   */
  icon: ReactNode;

  /**
   * Tailwind gradient classes for the icon badge background
   * @example "from-blue-500 to-blue-600"
   */
  gradientFrom: string;
  gradientTo: string;

  /**
   * Optional additional CSS classes for the container
   */
  className?: string;
}

/**
 * SectionHeader Component
 * 
 * A reusable header component for form sections that displays a gradient icon
 * badge alongside a title and subtitle. This creates consistent visual hierarchy
 * and improves the user experience by clearly separating different sections.
 * 
 * ACCESSIBILITY:
 * - Uses semantic heading structure (h2)
 * - Provides clear visual and textual hierarchy
 * - Icon is decorative and doesn't require alt text
 * 
 * @example
 * ```tsx
 * <SectionHeader
 *   title="Personal Information"
 *   subtitle="Basic patient demographics"
 *   gradientFrom="from-blue-500"
 *   gradientTo="to-blue-600"
 *   icon={
 *     <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 *       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
 *     </svg>
 *   }
 * />
 * ```
 */
export function SectionHeader({
  title,
  subtitle,
  icon,
  gradientFrom,
  gradientTo,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`mb-6 flex items-center gap-3 ${className}`}>
      {/* Gradient Icon Badge */}
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${gradientFrom} ${gradientTo} shadow-md`}
        aria-hidden="true" // Icon is decorative
      >
        {icon}
      </div>

      {/* Title and Subtitle */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {title}
        </h2>
        <p className="text-sm text-gray-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

