// ============================================================================
// FORM CONTEXT
// ============================================================================
// React Context for sharing form state between compound components
// ============================================================================

'use client';

import { createContext, useContext } from 'react';
import type { FormContextValue, FormValues } from './types';

/**
 * Form Context
 * Provides form state and methods to all child components
 */
export const FormContext = createContext<FormContextValue | null>(null);

/**
 * Hook to access form context
 * Throws an error if used outside of a Form component
 * 
 * @example
 * ```tsx
 * function MyField() {
 *   const form = useFormContext();
 *   return <input value={form.values.myField} />;
 * }
 * ```
 */
export function useFormContext<TValues extends FormValues = FormValues>(): FormContextValue<TValues> {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error(
      'useFormContext must be used within a Form component. ' +
      'Make sure your field components are wrapped in a <Form> component.'
    );
  }

  return context as unknown as FormContextValue<TValues>;
}

/**
 * Hook to access a specific field's value
 * 
 * @param name - Field name
 * @returns Field value
 * 
 * @example
 * ```tsx
 * function MyField() {
 *   const value = useFieldValue('email');
 *   return <div>{value}</div>;
 * }
 * ```
 */
export function useFieldValue(name: string) {
  const { getFieldValue } = useFormContext();
  return getFieldValue(name);
}

/**
 * Hook to access a specific field's error
 * 
 * @param name - Field name
 * @returns Field error
 * 
 * @example
 * ```tsx
 * function MyField() {
 *   const error = useFieldError('email');
 *   return error ? <div>{error.message}</div> : null;
 * }
 * ```
 */
export function useFieldError(name: string) {
  const { getFieldError } = useFormContext();
  return getFieldError(name);
}

/**
 * Hook to access a specific field's state
 * 
 * @param name - Field name
 * @returns Field state
 * 
 * @example
 * ```tsx
 * function MyField() {
 *   const state = useFieldState('email');
 *   return <div>Touched: {state.touched}</div>;
 * }
 * ```
 */
export function useFieldState(name: string) {
  const { getFieldState } = useFormContext();
  return getFieldState(name);
}

