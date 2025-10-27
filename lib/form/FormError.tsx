// ============================================================================
// FORM ERROR AND SUBMIT COMPONENTS
// ============================================================================
// Form-level error display and submit button
// ============================================================================

'use client';

import React, { ReactNode } from 'react';
import { useFormContext } from './FormContext';

// ============================================================================
// FORM ERROR
// ============================================================================

interface FormErrorProps {
  /** Custom className */
  className?: string;
  /** Custom error message (overrides form errors) */
  message?: string;
}

/**
 * FormError Component
 * Displays form-level errors
 * 
 * @example
 * ```tsx
 * <FormError />
 * ```
 */
export function FormError({ className = '', message }: FormErrorProps) {
  const { errors, formState } = useFormContext();

  // Only show errors after form has been submitted
  if (!formState.isSubmitted && !message) {
    return null;
  }

  const errorCount = Object.keys(errors).length;

  if (errorCount === 0 && !message) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`rounded-md bg-red-50 p-4 ${className}`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {message || `There ${errorCount === 1 ? 'is' : 'are'} ${errorCount} error${errorCount === 1 ? '' : 's'} with your submission`}
          </h3>
          {!message && errorCount > 0 && (
            <div className="mt-2 text-sm text-red-700">
              <ul className="list-disc space-y-1 pl-5">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>
                    <strong className="font-medium">{field}:</strong> {error?.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FORM SUBMIT
// ============================================================================

interface FormSubmitProps {
  /** Button text */
  children: ReactNode;
  /** Custom className */
  className?: string;
  /** Loading text (shown when submitting) */
  loadingText?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Full width button */
  fullWidth?: boolean;
}

/**
 * FormSubmit Component
 * Submit button with loading state
 * 
 * @example
 * ```tsx
 * <FormSubmit loadingText="Saving...">
 *   Submit Form
 * </FormSubmit>
 * ```
 */
export function FormSubmit({
  children,
  className = '',
  loadingText = 'Submitting...',
  disabled = false,
  variant = 'primary',
  fullWidth = false,
}: FormSubmitProps) {
  const { formState, handleSubmit } = useFormContext();

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const isDisabled = disabled || formState.isSubmitting;

  return (
    <button
      type="submit"
      onClick={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow-sm
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {formState.isSubmitting && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span>{formState.isSubmitting ? loadingText : children}</span>
    </button>
  );
}

// ============================================================================
// FORM RESET
// ============================================================================

interface FormResetProps {
  /** Button text */
  children?: ReactNode;
  /** Custom className */
  className?: string;
  /** Confirmation message */
  confirmMessage?: string;
}

/**
 * FormReset Component
 * Reset button to clear form
 * 
 * @example
 * ```tsx
 * <FormReset confirmMessage="Are you sure you want to reset?">
 *   Reset Form
 * </FormReset>
 * ```
 */
export function FormReset({
  children = 'Reset',
  className = '',
  confirmMessage,
}: FormResetProps) {
  const { reset, formState } = useFormContext();

  const handleReset = () => {
    if (confirmMessage && formState.isDirty) {
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }
    reset();
  };

  return (
    <button
      type="button"
      onClick={handleReset}
      className={`
        inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm
        hover:bg-gray-50
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `}
    >
      {children}
    </button>
  );
}

