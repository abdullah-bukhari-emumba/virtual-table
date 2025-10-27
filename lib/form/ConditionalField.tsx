// ============================================================================
// CONDITIONAL FIELD COMPONENT
// ============================================================================
// Show/hide fields based on other field values or form state
// ============================================================================

'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useFormContext } from './FormContext';
import type { ConditionalConfig } from './types';

interface ConditionalFieldProps {
  /** Condition configuration */
  condition: ConditionalConfig;
  /** Child components to render when condition is met */
  children: ReactNode;
  /** Optional fallback to render when condition is not met */
  fallback?: ReactNode;
}

/**
 * ConditionalField Component
 * Conditionally renders fields based on other field values
 * 
 * @example
 * ```tsx
 * <ConditionalField
 *   condition={{
 *     when: 'hasAddress',
 *     is: (value) => value === true
 *   }}
 * >
 *   <FormInput name="street" label="Street Address" />
 *   <FormInput name="city" label="City" />
 * </ConditionalField>
 * ```
 */
export function ConditionalField({
  condition,
  children,
  fallback = null,
}: ConditionalFieldProps) {
  const { getFieldValue, values } = useFormContext();
  const [shouldRender, setShouldRender] = useState(false);

  // Watch the field value and update visibility
  useEffect(() => {
    const watchedValue = getFieldValue(condition.when);
    const isVisible = condition.is(watchedValue);
    setShouldRender(isVisible);
  }, [values, condition, getFieldValue]);

  // Announce visibility changes to screen readers
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (shouldRender) {
      setAnnouncement('Additional fields are now visible');
    } else {
      setAnnouncement('Additional fields are now hidden');
    }
    
    // Clear announcement after a short delay
    const timer = setTimeout(() => setAnnouncement(''), 1000);
    return () => clearTimeout(timer);
  }, [shouldRender]);

  return (
    <>
      {/* Screen reader announcement */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Conditional content */}
      {shouldRender ? children : fallback}
    </>
  );
}

/**
 * Multiple condition support
 */
interface ConditionalFieldsProps {
  /** Array of conditions (all must be met) */
  conditions: ConditionalConfig[];
  /** Match mode: 'all' (AND) or 'any' (OR) */
  mode?: 'all' | 'any';
  /** Child components */
  children: ReactNode;
  /** Optional fallback */
  fallback?: ReactNode;
}

/**
 * ConditionalFields Component
 * Supports multiple conditions with AND/OR logic
 * 
 * @example
 * ```tsx
 * <ConditionalFields
 *   mode="all"
 *   conditions={[
 *     { when: 'country', is: (v) => v === 'US' },
 *     { when: 'hasAddress', is: (v) => v === true }
 *   ]}
 * >
 *   <FormInput name="zipCode" label="ZIP Code" />
 * </ConditionalFields>
 * ```
 */
export function ConditionalFields({
  conditions,
  mode = 'all',
  children,
  fallback = null,
}: ConditionalFieldsProps) {
  const { getFieldValue, values } = useFormContext();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const results = conditions.map((condition) => {
      const watchedValue = getFieldValue(condition.when);
      return condition.is(watchedValue);
    });

    const isVisible =
      mode === 'all'
        ? results.every((result) => result)
        : results.some((result) => result);

    setShouldRender(isVisible);
  }, [values, conditions, mode, getFieldValue]);

  return <>{shouldRender ? children : fallback}</>;
}

/**
 * Hook for conditional logic
 * Useful for custom conditional rendering
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const showAddress = useConditional({
 *     when: 'hasAddress',
 *     is: (value) => value === true
 *   });
 *   
 *   return showAddress ? <AddressFields /> : null;
 * }
 * ```
 */
export function useConditional(condition: ConditionalConfig): boolean {
  const { getFieldValue, values } = useFormContext();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const watchedValue = getFieldValue(condition.when);
    const isVisible = condition.is(watchedValue);
    setShouldRender(isVisible);
  }, [values, condition, getFieldValue]);

  return shouldRender;
}

