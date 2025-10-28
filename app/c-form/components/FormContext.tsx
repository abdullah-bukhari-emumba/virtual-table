// ============================================================================
// FORM CONTEXT - COMPOUND COMPONENT PATTERN CORE
// ============================================================================
// This file implements the React Context that powers the compound component pattern.
// It provides shared state and methods to all child form components.
//
// COMPOUND COMPONENT PATTERN EXPLAINED:
// Instead of passing props down through multiple levels (prop drilling), we use
// React Context to share state between a parent component and its children.
//
// EXAMPLE USAGE:
// <Form initialValues={...} onSubmit={...}>
//   <Form.Field name="email" label="Email">
//     <Form.Input name="email" type="email" />
//   </Form.Field>
// </Form>
//
// All child components (Form.Field, Form.Input) can access form state via context.
// ============================================================================

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { 
  FormContextValue, 
  FormValues, 
  FormErrors, 
  FormTouched,
  ConditionalRule 
} from '../types';

// ============================================================================
// STEP 1: CREATE CONTEXT
// ============================================================================
// Create a React Context with undefined as default value.
// We use undefined to force consumers to check if context exists,
// preventing usage outside of a Form provider.
const FormContext = createContext<FormContextValue | undefined>(undefined);

// ============================================================================
// STEP 2: CUSTOM HOOK TO ACCESS CONTEXT
// ============================================================================
/**
 * useFormContext - Hook to access form context
 * 
 * This hook provides access to the form context from any child component.
 * It throws an error if used outside of a Form component, providing clear
 * developer feedback.
 * 
 * USAGE:
 * const { values, errors, setFieldValue } = useFormContext();
 * 
 * ERROR HANDLING:
 * If this hook is called outside a <Form> component, it throws an error
 * with a helpful message, preventing silent bugs.
 */
export function useFormContext(): FormContextValue {
  const context = useContext(FormContext);
  
  // Guard: Ensure hook is used within a Form provider
  if (!context) {
    throw new Error(
      'useFormContext must be used within a Form component. ' +
      'Make sure your component is wrapped in <Form>...</Form>'
    );
  }
  
  return context;
}

// ============================================================================
// STEP 3: FORM PROVIDER COMPONENT
// ============================================================================
/**
 * FormProvider - Provides form context to child components
 * 
 * This component manages all form state and provides methods to child components
 * through React Context. It's the "brain" of the form system.
 * 
 * PROPS:
 * - initialValues: Starting values for form fields
 * - validationSchema: Yup schema for validation (optional)
 * - onSubmit: Callback when form is successfully submitted
 * - validateOnChange: Validate fields as user types (default: true)
 * - validateOnBlur: Validate fields when user leaves field (default: true)
 * - children: Child components that will have access to form context
 * 
 * STATE MANAGED:
 * - values: Current form field values
 * - errors: Current validation errors
 * - touched: Which fields have been interacted with
 * - isSubmitting: Whether form is currently being submitted
 */
type FormProviderProps = {
  initialValues: FormValues;
  validationSchema?: any;
  onSubmit: (values: FormValues) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  children: React.ReactNode;
};

export function FormProvider({
  initialValues,
  validationSchema,
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
  children,
}: FormProviderProps) {
  // ==========================================================================
  // STATE INITIALIZATION
  // ==========================================================================
  // Initialize form state with provided initial values
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================================================
  // FIELD VALUE MANAGEMENT
  // ==========================================================================
  // ==========================================================================
  // VALIDATION LOGIC
  // ==========================================================================
  /**
   * validateField - Validate a single field
   *
   * Uses the Yup validation schema to validate a specific field.
   *
   * EXECUTION FLOW:
   * 1. Check if validation schema exists
   * 2. Extract the field's schema from the full schema
   * 3. Validate the field value against its schema
   * 4. If valid: Clear error for this field
   * 5. If invalid: Set error message for this field
   *
   * NOTE: This function accepts an optional fieldValue parameter to validate
   * against the latest value (important for validateOnChange scenarios)
   */
  const validateField = useCallback(
    async (name: string, fieldValue?: any) => {
      // Guard: No validation if no schema provided
      if (!validationSchema) return;

      try {
        // Get the schema for this specific field
        const fieldSchema = validationSchema.fields[name];

        if (fieldSchema) {
          // Use provided value or current value from state
          const valueToValidate = fieldValue !== undefined ? fieldValue : values[name];

          // Validate the field value
          await fieldSchema.validate(valueToValidate, { abortEarly: false });

          // Validation passed: Clear any existing error
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          });
        }
      } catch (error: any) {
        // Validation failed: Set error message
        if (error.errors && error.errors.length > 0) {
          setErrors((prev) => ({ ...prev, [name]: error.errors[0] }));
        }
      }
    },
    [validationSchema, values]
  );

  /**
   * setFieldValue - Update a single field's value
   *
   * This function updates the value of a specific field and optionally
   * triggers validation if validateOnChange is enabled.
   *
   * EXECUTION FLOW:
   * 1. Update the field value in state
   * 2. If validateOnChange is true, validate the field with the new value
   * 3. Re-render components that depend on this value
   */
  const setFieldValue = useCallback(
    (name: string, value: any) => {
      // Update field value
      setValues((prev) => ({ ...prev, [name]: value }));

      // Validate on change if enabled
      // Pass the new value directly to avoid stale state issues
      if (validateOnChange) {
        // Use setTimeout to validate after state update
        setTimeout(() => validateField(name, value), 0);
      }
    },
    [validateOnChange, validateField]
  );

  /**
   * setFieldTouched - Mark a field as touched
   *
   * A field is "touched" when the user has interacted with it (focused and blurred).
   * We only show validation errors for touched fields to avoid overwhelming users.
   *
   * EXECUTION FLOW:
   * 1. Mark field as touched
   * 2. If validateOnBlur is true and field is touched, validate it
   */
  const setFieldTouched = useCallback(
    (name: string, isTouched: boolean) => {
      // Update touched state
      setTouched((prev) => ({ ...prev, [name]: isTouched }));

      // Validate on blur if enabled and field is touched
      if (validateOnBlur && isTouched) {
        setTimeout(() => validateField(name), 0);
      }
    },
    [validateOnBlur, validateField]
  );

  /**
   * setFieldError - Set a custom error for a field
   *
   * Allows manual error setting for custom validation logic.
   */
  const setFieldError = useCallback((name: string, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  /**
   * validateForm - Validate all fields in the form
   * 
   * Validates the entire form against the Yup schema.
   * 
   * EXECUTION FLOW:
   * 1. Check if validation schema exists
   * 2. Validate all values against the schema
   * 3. If valid: Clear all errors, return true
   * 4. If invalid: Set all error messages, return false
   * 
   * RETURNS:
   * - true if form is valid
   * - false if form has validation errors
   */
  const validateForm = useCallback(async (): Promise<boolean> => {
    // Guard: No validation if no schema provided
    if (!validationSchema) return true;

    try {
      // Validate all form values
      await validationSchema.validate(values, { abortEarly: false });
      
      // Validation passed: Clear all errors
      setErrors({});
      return true;
    } catch (error: any) {
      // Validation failed: Collect all errors
      const validationErrors: FormErrors = {};
      
      if (error.inner) {
        error.inner.forEach((err: any) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
      }
      
      // Set all errors
      setErrors(validationErrors);
      return false;
    }
  }, [validationSchema, values]);

  // ==========================================================================
  // FORM SUBMISSION
  // ==========================================================================
  /**
   * handleSubmit - Handle form submission
   * 
   * This function orchestrates the entire submission process:
   * 1. Prevent default form submission
   * 2. Mark all fields as touched (to show all errors)
   * 3. Validate the entire form
   * 4. If valid: Call onSubmit callback
   * 5. If invalid: Do nothing (errors are displayed)
   * 
   * EXECUTION FLOW:
   * 1. User clicks submit button
   * 2. Prevent browser's default form submission
   * 3. Set isSubmitting to true (can show loading state)
   * 4. Mark all fields as touched (show all validation errors)
   * 5. Validate entire form
   * 6. If valid: Call onSubmit with form values
   * 7. Set isSubmitting to false
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      // Prevent default browser form submission
      e.preventDefault();
      
      // Set submitting state
      setIsSubmitting(true);
      
      // Mark all fields as touched to show all errors
      const allTouched: FormTouched = {};
      Object.keys(values).forEach((key) => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      
      // Validate entire form
      const isValid = await validateForm();
      
      if (isValid) {
        // Form is valid: Call onSubmit callback
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }
      
      // Clear submitting state
      setIsSubmitting(false);
    },
    [values, validateForm, onSubmit]
  );

  /**
   * resetForm - Reset form to initial values
   * 
   * Clears all values, errors, and touched state.
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // ==========================================================================
  // CONDITIONAL FIELD VISIBILITY
  // ==========================================================================
  /**
   * isFieldVisible - Check if a field should be visible
   * 
   * Evaluates conditional rules to determine if a field should be shown.
   * This enables dynamic forms where fields appear/disappear based on other values.
   * 
   * EXAMPLE:
   * Show "allergies" field only if "hasAllergies" is true:
   * isFieldVisible([{ field: 'hasAllergies', value: true }])
   * 
   * PARAMETERS:
   * - rules: Array of conditional rules (all must pass for field to be visible)
   * 
   * RETURNS:
   * - true if field should be visible
   * - false if field should be hidden
   */
  const isFieldVisible = useCallback(
    (rules?: ConditionalRule[]): boolean => {
      // No rules means always visible
      if (!rules || rules.length === 0) return true;
      
      // Check all rules - ALL must pass for field to be visible
      return rules.every((rule) => {
        const fieldValue = values[rule.field];
        const operator = rule.operator || 'equals';
        
        // Evaluate based on operator
        switch (operator) {
          case 'equals':
            return fieldValue === rule.value;
          case 'notEquals':
            return fieldValue !== rule.value;
          case 'includes':
            return Array.isArray(fieldValue) && fieldValue.includes(rule.value);
          default:
            return true;
        }
      });
    },
    [values]
  );

  // ==========================================================================
  // CONTEXT VALUE
  // ==========================================================================
  // Combine all state and methods into context value
  const contextValue: FormContextValue = {
    values,
    errors,
    touched,
    isSubmitting,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    validateField,
    validateForm,
    handleSubmit,
    resetForm,
    isFieldVisible,
  };

  // ==========================================================================
  // RENDER PROVIDER
  // ==========================================================================
  // Provide context to all child components
  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
}

