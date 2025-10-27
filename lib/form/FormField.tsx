// ============================================================================
// FORM FIELD WRAPPER
// ============================================================================
// Wrapper component for form fields with label and error display
// ============================================================================

'use client';

import React, { ReactNode } from 'react';
import { useFormContext } from './FormContext';

interface FormFieldProps {
  /** Field name */
  name: string;
  /** Field label */
  label?: string;
  /** Help text */
  helpText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Custom className */
  className?: string;
  /** Child components (input, select, etc.) */
  children: ReactNode;
}

/**
 * FormField Component
 * Wrapper component that provides label, error display, and accessibility
 * 
 * @example
 * ```tsx
 * <FormField name="email" label="Email Address" required>
 *   <input type="email" />
 * </FormField>
 * ```
 */
export function FormField({
  name,
  label,
  helpText,
  required = false,
  className = '',
  children,
}: FormFieldProps) {
  const { getFieldError, getFieldState } = useFormContext();
  
  const error = getFieldError(name);
  const fieldState = getFieldState(name);
  
  // Generate unique IDs for accessibility
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;
  
  // Determine if we should show the error
  const showError = error && fieldState.touched;

  return (
    <div className={`mb-5 ${className}`}>
      {/* Label - Enhanced styling */}
      {label && (
        <label
          htmlFor={fieldId}
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      {/* Field wrapper with error state */}
      <div className="relative">
        {/* Clone children and add accessibility props */}
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              id: fieldId,
              name,
              'aria-invalid': showError ? 'true' : 'false',
              'aria-describedby': [
                showError ? errorId : null,
                helpText ? helpId : null,
              ]
                .filter(Boolean)
                .join(' ') || undefined,
              'aria-required': required ? 'true' : undefined,
            });
          }
          return child;
        })}
      </div>

      {/* Help text - Enhanced styling */}
      {helpText && !showError && (
        <p id={helpId} className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
          <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {helpText}
        </p>
      )}

      {/* Error message - Enhanced styling with icon */}
      {showError && (
        <p
          id={errorId}
          className="mt-2 flex items-center gap-1.5 text-sm font-medium text-red-600"
          role="alert"
          aria-live="polite"
        >
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error.message}
        </p>
      )}
    </div>
  );
}

