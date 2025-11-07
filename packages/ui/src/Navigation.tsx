'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Navigation Component - Modern Design
 *
 * Shared navigation bar that appears in both shell and forms zones.
 * Features:
 * - Modern glass-morphism design with subtle gradient
 * - Application logo/title with improved visual hierarchy
 * - Links to Patient Table and Patient Intake Form
 * - Prominent active state indicator with smooth transitions
 * - Sticky positioning for better accessibility
 * - Responsive design with improved mobile experience
 * - WCAG AA compliant contrast ratios
 * - Smooth animations and hover effects
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
      icon: '📊',
    },
    {
      label: 'Patient Intake Form',
      href: '/forms/patient-intake',
      isActive: isFormsActive,
      description: 'Add new patient',
      icon: '📋',
    },
  ];

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 z-50
        bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900
        backdrop-blur-md bg-opacity-95
        border-b border-slate-700/50
        shadow-lg shadow-slate-900/20
        ${className}
      `}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Logo Badge */}
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow duration-300">
              <span className="text-white font-bold text-sm">PT</span>
            </div>

            {/* Title */}
            <h1 className="text-lg font-semibold text-white hidden sm:block tracking-tight">
              {title}
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  relative px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-300 ease-out
                  flex items-center gap-2
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900
                  ${
                    link.isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }
                `}
                title={link.description}
                aria-current={link.isActive ? 'page' : undefined}
              >
                {/* Icon - visible on mobile and desktop */}
                <span className="text-base">{link.icon}</span>

                {/* Label - hidden on mobile, visible on sm and up */}
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative bottom border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
    </nav>
  );
}

