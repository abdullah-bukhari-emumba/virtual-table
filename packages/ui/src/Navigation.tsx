'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Navigation Component - Simple Header
 *
 * Shared navigation bar that appears in both shell and forms zones.
 * Clean, simple design with no fancy effects.
 *
 * USAGE:
 * <Navigation />
 */

export type NavigationProps = {
  /** Optional: Custom title for the application */
  title?: string;
  /** Optional: Custom className for styling */
  className?: string;
};

export function Navigation({
  title = 'Patient Virtual Table',
  className = ''
}: NavigationProps) {
  const pathname = usePathname();

  // Determine if we're on the patient table page
  const isPatientTableActive = pathname === '/' || pathname === '';

  // Determine if we're on the forms page
  const isFormsActive = pathname.startsWith('/forms');

  // Navigation links configuration
  const navLinks = [
    {
      label: 'Patient Table',
      href: '/',
      isActive: isPatientTableActive,
    },
    {
      label: 'Patient Intake Form',
      href: '/forms/patient-intake',
      isActive: isFormsActive,
    },
  ];

  return (
    <nav
      className={`bg-white border-b border-gray-200 ${className}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Title */}
          <h1 className="text-lg font-semibold text-gray-900">
            {title}
          </h1>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-3 py-2 text-sm font-medium
                  ${
                    link.isActive
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                `}
                aria-current={link.isActive ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

