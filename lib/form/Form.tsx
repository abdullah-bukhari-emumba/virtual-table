// ============================================================================
// FORM COMPONENT
// ============================================================================
// Main Form component with validation and state management
// ============================================================================

'use client';

import React, { useState, useCallback, useRef, ReactNode, FormEvent } from 'react';
import { z } from 'zod';
import { FormContext } from './FormContext';
import type {
  FormConfig,
  FormValues,
  FormErrors,
  FormState,
  FieldState,
  FieldError,
  FieldValue,
  ValidationTiming,
} from './types';

interface FormProps<TValues extends FormValues = FormValues> extends FormConfig<TValues> {
  /** Child components */
  children: ReactNode;
  /** Custom className */
  className?: string;
  /** ARIA label for the form */
  'aria-label'?: string;
  /** ARIA labelledby for the form */
  'aria-labelledby'?: string;
}

/**
 * Form Component
 * Main compound component that manages form state and validation
 * 
 * @example
 * ```tsx
 * <Form
 *   initialValues={{ email: '', password: '' }}
 *   validationSchema={schema}
 *   onSubmit={handleSubmit}
 * >
 *   <FormInput name="email" label="Email" />
 *   <FormInput name="password" label="Password" type="password" />
 *   <FormSubmit>Submit</FormSubmit>
 * </Form>
 * ```
 */
export function Form<TValues extends FormValues = FormValues>({
  initialValues,
  validationSchema,
  validationMode = 'onSubmit',
  validationTiming,
  validateOnMount = false,
  reValidateMode = 'onChange',
  onSubmit,
  onError,
  children,
  className = '',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: FormProps<TValues>) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [values, setValues] = useState<TValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    isSubmitted: false,
    isValid: true,
    isDirty: false,
    isTouched: false,
    submitCount: 0,
    fields: {},
  });

  // Track registered fields
  const registeredFields = useRef<Set<string>>(new Set());
  
  // Track first error field for focus management
  const firstErrorFieldRef = useRef<string | null>(null);

  // ============================================================================
  // VALIDATION TIMING
  // ============================================================================

  const timing: ValidationTiming = validationTiming || {
    onChange: validationMode === 'onChange' || validationMode === 'all',
    onBlur: validationMode === 'onBlur' || validationMode === 'all',
    onSubmit: validationMode === 'onSubmit' || validationMode === 'all',
  };

  // ============================================================================
  // FIELD REGISTRATION
  // ============================================================================
  // Fields register themselves when they mount and unregister when they unmount.
  // This allows the form to track which fields exist and manage their state.
  //
  // WHY: Dynamic forms (conditional fields, field arrays) need to add/remove
  // fields at runtime. Registration ensures the form knows about all active fields.
  // ============================================================================

  /**
   * Register a field with the form
   *
   * Called by field components (FormInput, FormSelect, etc.) when they mount.
   * Initializes the field's state tracking (touched, dirty, validating).
   *
   * @param name - The field name (e.g., "email", "emergencyContacts.0.name")
   */
  const registerField = useCallback((name: string) => {
    registeredFields.current.add(name);

    // Initialize field state if not exists
    // This prevents errors when accessing field state before it's created
    setFormState((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [name]: prev.fields[name] || {
          touched: false,  // Has the user interacted with this field?
          dirty: false,    // Has the value changed from initial?
          validating: false, // Is validation currently running?
        },
      },
    }));
  }, []);

  /**
   * Unregister a field from the form
   *
   * Called by field components when they unmount (e.g., conditional field hides).
   * Cleans up all state associated with the field to prevent memory leaks.
   *
   * @param name - The field name to unregister
   */
  const unregisterField = useCallback((name: string) => {
    registeredFields.current.delete(name);

    // Clean up field state
    // Use destructuring to remove the field while keeping others
    setFormState((prev) => {
      const { [name]: removed, ...restFields } = prev.fields;
      return {
        ...prev,
        fields: restFields,
      };
    });

    // Clean up field value
    // Important: Remove value when field unmounts to prevent stale data
    setValues((prev) => {
      const { [name]: removed, ...restValues } = prev;
      return restValues as TValues;
    });

    // Clean up field error
    // Remove any validation errors for the unmounted field
    setErrors((prev) => {
      const { [name]: removed, ...restErrors } = prev;
      return restErrors;
    });
  }, []);

  // ============================================================================
  // VALUE SETTERS
  // ============================================================================

  const setFieldValue = useCallback((name: string, value: FieldValue | FieldValue[]) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Mark field as dirty
    setFormState((prev) => ({
      ...prev,
      isDirty: true,
      fields: {
        ...prev.fields,
        [name]: {
          ...prev.fields[name],
          dirty: true,
        },
      },
    }));
  }, []);

  const setValuesMultiple = useCallback((newValues: Partial<TValues>) => {
    setValues((prev) => ({
      ...prev,
      ...newValues,
    }));
    
    // Mark affected fields as dirty
    setFormState((prev) => {
      const updatedFields = { ...prev.fields };
      Object.keys(newValues).forEach((name) => {
        updatedFields[name] = {
          ...updatedFields[name],
          dirty: true,
        };
      });
      
      return {
        ...prev,
        isDirty: true,
        fields: updatedFields,
      };
    });
  }, []);

  // ============================================================================
  // ERROR SETTERS
  // ============================================================================

  const setFieldError = useCallback((name: string, error: FieldError | undefined) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
    
    // Update field state
    setFormState((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [name]: {
          ...prev.fields[name],
          error,
        },
      },
    }));
  }, []);

  const setErrorsMultiple = useCallback((newErrors: FormErrors) => {
    setErrors(newErrors);
    
    // Update field states
    setFormState((prev) => {
      const updatedFields = { ...prev.fields };
      Object.entries(newErrors).forEach(([name, error]) => {
        updatedFields[name] = {
          ...updatedFields[name],
          error,
        };
      });
      
      return {
        ...prev,
        isValid: Object.keys(newErrors).length === 0,
        fields: updatedFields,
      };
    });
  }, []);

  // ============================================================================
  // FIELD STATE SETTERS
  // ============================================================================

  const setFieldTouched = useCallback((name: string, touched: boolean) => {
    setFormState((prev) => ({
      ...prev,
      isTouched: touched || prev.isTouched,
      fields: {
        ...prev.fields,
        [name]: {
          ...prev.fields[name],
          touched,
        },
      },
    }));
  }, []);

  const setFieldDirty = useCallback((name: string, dirty: boolean) => {
    setFormState((prev) => ({
      ...prev,
      isDirty: dirty || prev.isDirty,
      fields: {
        ...prev.fields,
        [name]: {
          ...prev.fields[name],
          dirty,
        },
      },
    }));
  }, []);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateField = useCallback(async (name: string): Promise<boolean> => {
    if (!validationSchema) return true;

    try {
      // Set validating state
      setFormState((prev) => ({
        ...prev,
        fields: {
          ...prev.fields,
          [name]: {
            ...prev.fields[name],
            validating: true,
          },
        },
      }));

      // Validate using Zod
      await validationSchema.parseAsync(values);

      // Clear error if validation passes
      setFieldError(name, undefined);

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Find error for this specific field
        const fieldError = error.issues.find((err: any) => err.path[0] === name);

        if (fieldError) {
          setFieldError(name, {
            message: fieldError.message,
            type: fieldError.code,
          });
          return false;
        }
      }

      return true;
    } finally {
      // Clear validating state
      setFormState((prev) => ({
        ...prev,
        fields: {
          ...prev.fields,
          [name]: {
            ...prev.fields[name],
            validating: false,
          },
        },
      }));
    }
  }, [validationSchema, values, setFieldError]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    if (!validationSchema) return true;

    try {
      await validationSchema.parseAsync(values);

      // Clear all errors
      setErrorsMultiple({});

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};

        error.issues.forEach((err) => {
          const fieldName = err.path[0] as string;
          newErrors[fieldName] = {
            message: err.message,
            type: err.code,
          };
        });

        setErrorsMultiple(newErrors);

        // Track first error field for focus management
        const firstErrorField = Object.keys(newErrors)[0];
        firstErrorFieldRef.current = firstErrorField;

        // Call error handler if provided
        onError?.(newErrors);

        return false;
      }

      return false;
    }
  }, [validationSchema, values, setErrorsMultiple, onError]);

  // ============================================================================
  // FORM SUBMISSION
  // ============================================================================

  const handleSubmit = useCallback(async (e?: FormEvent) => {
    e?.preventDefault();

    // Set submitting state
    setFormState((prev) => ({
      ...prev,
      isSubmitting: true,
      submitCount: prev.submitCount + 1,
    }));

    try {
      // Validate form
      const isValid = await validateForm();

      if (!isValid) {
        // Focus first error field
        if (firstErrorFieldRef.current) {
          const element = document.querySelector(
            `[name="${firstErrorFieldRef.current}"]`
          ) as HTMLElement;
          element?.focus();
        }

        return;
      }

      // Call submit handler
      await onSubmit(values);

      // Mark as submitted
      setFormState((prev) => ({
        ...prev,
        isSubmitted: true,
      }));
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      // Clear submitting state
      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  }, [validateForm, onSubmit, values]);

  // ============================================================================
  // FORM RESET
  // ============================================================================

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setFormState({
      isSubmitting: false,
      isSubmitted: false,
      isValid: true,
      isDirty: false,
      isTouched: false,
      submitCount: 0,
      fields: {},
    });
    firstErrorFieldRef.current = null;
  }, [initialValues]);

  // ============================================================================
  // GETTERS
  // ============================================================================

  const getFieldValue = useCallback((name: string) => {
    return values[name];
  }, [values]);

  const getFieldError = useCallback((name: string) => {
    return errors[name];
  }, [errors]);

  const getFieldState = useCallback((name: string): FieldState => {
    return formState.fields[name] || {
      touched: false,
      dirty: false,
      validating: false,
    };
  }, [formState.fields]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue = {
    values,
    errors,
    formState,
    validationSchema,
    validationTiming: timing,
    registerField,
    unregisterField,
    setFieldValue,
    setValues: setValuesMultiple,
    setFieldError,
    setErrors: setErrorsMultiple,
    setFieldTouched,
    setFieldDirty,
    validateField,
    validateForm,
    handleSubmit,
    reset,
    getFieldValue,
    getFieldError,
    getFieldState,
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <FormContext.Provider value={contextValue as any}>
      <form
        onSubmit={handleSubmit}
        className={className}
        noValidate
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

