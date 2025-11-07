'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Navigation Component
 * 
 * Shared navigation bar that appears in both shell and forms zones.
 * Features:
 * - Application logo/title
 * - Links to Patient Table and Patient Intake Form
 * - Active state indicator showing current page
 * - Responsive design
 * - Consistent styling across zones
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
      description: 'View patient records',
    },
    {
      label: 'Patient Intake Form',
      href: '/forms/patient-intake',
      isActive: isFormsActive,
      description: 'Add new patient',
    },
  ];

  return (
    <nav className={`bg-slate-800 text-white shadow-lg ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title Section */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500">
                <span className="text-white font-bold text-sm">PT</span>
              </div>
            </div>
            <h1 className="text-xl font-semibold hidden sm:block">{title}</h1>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    link.isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }
                `}
                title={link.description}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Indicator */}
          <div className="sm:hidden">
            <div className="text-xs text-slate-400">
              {isPatientTableActive ? '📊' : '📋'}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

