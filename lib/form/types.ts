// ============================================================================
// FORM BUILDER - TYPE DEFINITIONS
// ============================================================================
// TypeScript types and interfaces for the compound component form builder
// ============================================================================

import { z } from 'zod';
import { ReactNode } from 'react';

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Validation mode determines when validation occurs
 */
export type ValidationMode = 'onChange' | 'onBlur' | 'onSubmit' | 'all';

/**
 * Validation timing configuration
 */
export interface ValidationTiming {
  /** Validate on field change */
  onChange?: boolean;
  /** Validate on field blur */
  onBlur?: boolean;
  /** Validate on form submit */
  onSubmit?: boolean;
}

/**
 * Field-level validation error
 */
export interface FieldError {
  /** Error message */
  message: string;
  /** Error type (e.g., 'required', 'minLength', 'pattern') */
  type?: string;
}

/**
 * Form-level errors (keyed by field name)
 */
export type FormErrors = Record<string, FieldError | undefined>;

// ============================================================================
// FIELD TYPES
// ============================================================================

/**
 * Supported field types
 */
export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file';

/**
 * Field value types
 */
export type FieldValue = string | number | boolean | File | null | undefined;

/**
 * Form values (keyed by field name)
 */
export type FormValues = Record<string, FieldValue | FieldValue[]>;

// ============================================================================
// FORM STATE
// ============================================================================

/**
 * Field state metadata
 */
export interface FieldState {
  /** Whether the field has been touched (focused and blurred) */
  touched: boolean;
  /** Whether the field has been modified */
  dirty: boolean;
  /** Current validation error, if any */
  error?: FieldError;
  /** Whether the field is currently being validated (async) */
  validating: boolean;
}

/**
 * Form state metadata
 */
export interface FormState {
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
  /** Whether the form has been submitted at least once */
  isSubmitted: boolean;
  /** Whether the form is valid (no errors) */
  isValid: boolean;
  /** Whether any field has been modified */
  isDirty: boolean;
  /** Whether any field has been touched */
  isTouched: boolean;
  /** Number of submit attempts */
  submitCount: number;
  /** Field-level state metadata */
  fields: Record<string, FieldState>;
}

// ============================================================================
// FORM CONFIGURATION
// ============================================================================

/**
 * Form configuration options
 */
export interface FormConfig<TValues extends FormValues = FormValues> {
  /** Initial form values */
  initialValues: TValues;
  /** Zod validation schema */
  validationSchema?: z.ZodSchema<TValues>;
  /** Validation mode */
  validationMode?: ValidationMode;
  /** Custom validation timing */
  validationTiming?: ValidationTiming;
  /** Whether to validate on mount */
  validateOnMount?: boolean;
  /** Whether to re-validate on change after first submit */
  reValidateMode?: ValidationMode;
  /** Form submit handler */
  onSubmit: (values: TValues) => void | Promise<void>;
  /** Form error handler */
  onError?: (errors: FormErrors) => void;
}

// ============================================================================
// FORM CONTEXT
// ============================================================================

/**
 * Form context value shared with child components
 */
export interface FormContextValue<TValues extends FormValues = FormValues> {
  /** Current form values */
  values: TValues;
  /** Current form errors */
  errors: FormErrors;
  /** Form state metadata */
  formState: FormState;
  /** Validation schema */
  validationSchema?: z.ZodSchema<TValues>;
  /** Validation timing configuration */
  validationTiming: ValidationTiming;
  
  // Field registration and management
  /** Register a field with the form */
  registerField: (name: string) => void;
  /** Unregister a field from the form */
  unregisterField: (name: string) => void;
  
  // Value setters
  /** Set a single field value */
  setFieldValue: (name: string, value: FieldValue | FieldValue[]) => void;
  /** Set multiple field values */
  setValues: (values: Partial<TValues>) => void;
  
  // Error setters
  /** Set a single field error */
  setFieldError: (name: string, error: FieldError | undefined) => void;
  /** Set multiple field errors */
  setErrors: (errors: FormErrors) => void;
  
  // Field state setters
  /** Mark a field as touched */
  setFieldTouched: (name: string, touched: boolean) => void;
  /** Mark a field as dirty */
  setFieldDirty: (name: string, dirty: boolean) => void;
  
  // Validation
  /** Validate a single field */
  validateField: (name: string) => Promise<boolean>;
  /** Validate all fields */
  validateForm: () => Promise<boolean>;
  
  // Form actions
  /** Submit the form */
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  /** Reset the form to initial values */
  reset: () => void;
  
  // Utilities
  /** Get a field value */
  getFieldValue: (name: string) => FieldValue | FieldValue[] | undefined;
  /** Get a field error */
  getFieldError: (name: string) => FieldError | undefined;
  /** Get field state */
  getFieldState: (name: string) => FieldState;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

/**
 * Base field props shared by all field components
 */
export interface BaseFieldProps {
  /** Field name (used as key in form values) */
  name: string;
  /** Field label */
  label?: string;
  /** Help text displayed below the field */
  helpText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Custom className for the field wrapper */
  className?: string;
  /** Custom validation function */
  validate?: (value: FieldValue | FieldValue[]) => string | undefined | Promise<string | undefined>;
}

/**
 * Select option
 */
export interface SelectOption {
  /** Option value */
  value: string | number;
  /** Option label */
  label: string;
  /** Whether the option is disabled */
  disabled?: boolean;
}

/**
 * Radio option
 */
export interface RadioOption {
  /** Option value */
  value: string | number;
  /** Option label */
  label: string;
  /** Whether the option is disabled */
  disabled?: boolean;
}

/**
 * Conditional field configuration
 */
export interface ConditionalConfig {
  /** Field name to watch */
  when: string;
  /** Condition function */
  is: (value: FieldValue | FieldValue[]) => boolean;
}

/**
 * Field array item render props
 */
export interface FieldArrayRenderProps {
  /** Item index */
  index: number;
  /** Remove this item */
  remove: () => void;
  /** Move this item up */
  moveUp: () => void;
  /** Move this item down */
  moveDown: () => void;
  /** Whether this is the first item */
  isFirst: boolean;
  /** Whether this is the last item */
  isLast: boolean;
}

/**
 * Field array props
 */
export interface FieldArrayProps {
  /** Field name (base name for array items) */
  name: string;
  /** Render function for each array item */
  children: (props: FieldArrayRenderProps) => ReactNode;
  /** Initial number of items */
  initialCount?: number;
  /** Minimum number of items */
  minItems?: number;
  /** Maximum number of items */
  maxItems?: number;
  /** Label for add button */
  addButtonLabel?: string;
  /** Custom className */
  className?: string;
}

