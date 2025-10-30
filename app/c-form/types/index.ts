// ============================================================================
// FORM SYSTEM TYPE DEFINITIONS
// ============================================================================
// This file contains all TypeScript type definitions for the custom form system.
// These types ensure type safety across the compound component pattern.
//
// KEY CONCEPTS:
// - FormValues: Generic type representing all form field values as key-value pairs
// - FormErrors: Validation errors mapped to field names
// - FormTouched: Tracks which fields have been interacted with (for showing errors)
// - FormContextValue: The shared state and methods available to all form components
// - ArrayMetadata: Tracks structure of array fields in normalized state
// ============================================================================

/**
 * FormValues - Generic type for form data
 *
 * Represents all form field values as a key-value object.
 *
 * NORMALIZED STATE:
 * In normalized state, array fields are flattened to indexed paths:
 * Example: {
 *   firstName: "John",
 *   'emergencyContacts[0].name': 'Jane',
 *   'emergencyContacts[0].phone': '555-1234'
 * }
 */
export type FormValues = Record<string, unknown>;

/**
 * FormErrors - Validation error messages
 *
 * Maps field names to their error messages.
 * Example: { email: "Invalid email format", age: "Must be 18 or older" }
 */
export type FormErrors = Record<string, string>;

/**
 * FormTouched - Tracks field interaction
 *
 * Maps field names to boolean values indicating if the field has been touched.
 * Used to determine when to show validation errors (only after user interaction).
 * Example: { email: true, password: false }
 */
export type FormTouched = Record<string, boolean>;

/**
 * ArrayMetadata - Tracks structure of array fields
 *
 * Maps array field names to their metadata (length and indices).
 * Used in normalized state to track array structure when fields are flattened.
 *
 * EXAMPLE:
 * {
 *   emergencyContacts: { length: 2, indices: [0, 1] },
 *   medications: { length: 1, indices: [0] }
 * }
 */
export type ArrayMetadata = Record<string, {
  length: number;
  indices: number[];
}>;

/**
 * ConditionalRule - Defines when a field should be visible
 * 
 * Allows fields to show/hide based on other field values.
 * 
 * PROPERTIES:
 * - field: The name of the field to check
 * - value: The value that field must have for this field to be visible
 * - operator: Comparison operator (default: 'equals')
 * 
 * EXAMPLE:
 * Show "pregnancy details" field only if gender is "female":
 * { field: 'gender', value: 'female', operator: 'equals' }
 */
export type ConditionalRule = {
  field: string;                                    // Field name to check
  value: unknown;                                       // Expected value
  operator?: 'equals' | 'notEquals' | 'includes';  // Comparison type
};

/**
 * FormContextValue - The shared context for all form components
 *
 * This is the core of the compound component pattern. All child components
 * (Form.Field, Form.Input, etc.) access this context to read/update form state.
 *
 * STATE PROPERTIES:
 * - values: Current form field values
 * - errors: Current validation errors
 * - touched: Which fields have been interacted with
 * - isSubmitting: Whether form is currently being submitted
 *
 * METHODS:
 * - setFieldValue: Update a single field's value
 * - setFieldTouched: Mark a field as touched
 * - setFieldError: Set a custom error for a field
 * - validateField: Validate a single field
 * - validateForm: Validate all fields
 * - handleSubmit: Handle form submission with validation
 * - resetForm: Reset form to initial state
 * - isFieldVisible: Check if a field should be shown (conditional logic)
 * - addArrayItem: Add a new item to a field array
 * - removeArrayItem: Remove an item from a field array
 * - moveArrayItem: Reorder items in a field array
 */
export type FormContextValue = {
  // ===== STATE =====
  values: FormValues;                              // Current form values
  errors: FormErrors;                              // Current validation errors
  touched: FormTouched;                            // Which fields have been touched
  isSubmitting: boolean;                           // Is form currently submitting?

  // ===== FIELD METHODS =====
  setFieldValue: (name: string, value: unknown) => void;        // Update field value
  setFieldTouched: (name: string, touched: boolean) => void; // Mark field as touched
  setFieldError: (name: string, error: string) => void;      // Set custom error

  // ===== VALIDATION METHODS =====
  validateField: (name: string) => Promise<void>;   // Validate single field
  validateForm: () => Promise<boolean>;             // Validate entire form

  // ===== FORM METHODS =====
  handleSubmit: (e: React.FormEvent) => void;       // Handle form submission
  resetForm: () => void;                            // Reset to initial values

  // ===== CONDITIONAL LOGIC =====
  isFieldVisible: (rules?: ConditionalRule[]) => boolean; // Check field visibility

  // ===== ARRAY FIELD METHODS =====
  addArrayItem: (fieldName: string, defaultValue?: unknown) => void;     // Add item to array
  removeArrayItem: (fieldName: string, index: number) => void;       // Remove item from array
  moveArrayItem: (fieldName: string, fromIndex: number, toIndex: number) => void; // Reorder array items
};

/**
 * FormProps - Props for the main Form component
 * 
 * REQUIRED PROPS:
 * - initialValues: Starting values for all form fields
 * - onSubmit: Callback function when form is successfully submitted
 * - children: Child components (Form.Field, Form.Input, etc.)
 * 
 * OPTIONAL PROPS:
 * - validationSchema: Yup schema for validation
 * - validateOnChange: Validate fields as user types (default: true)
 * - validateOnBlur: Validate fields when user leaves field (default: true)
 */
export type FormProps = {
  initialValues: FormValues;                        // Initial form values
  onSubmit: (values: FormValues) => void | Promise<void>; // Submit handler
  validationSchema?: unknown;                       // Yup validation schema
  validateOnChange?: boolean;                       // Validate on change?
  validateOnBlur?: boolean;                         // Validate on blur?
  children: React.ReactNode;                        // Child components
  className?: string;                               // Optional CSS classes
};

/**
 * FormFieldProps - Props for Form.Field wrapper component
 * 
 * Form.Field wraps input components and provides:
 * - Label display
 * - Error message display
 * - Conditional visibility
 * 
 * REQUIRED PROPS:
 * - name: Field name (must match key in form values)
 * - label: Display label for the field
 * - children: The input component (Form.Input, Form.Select, etc.)
 * 
 * OPTIONAL PROPS:
 * - required: Show asterisk (*) for required fields
 * - showWhen: Conditional rules for showing this field
 * - className: Additional CSS classes
 */
export type FormFieldProps = {
  name: string;                                     // Field name
  label: string;                                    // Field label
  children: React.ReactNode;                        // Input component
  required?: boolean;                               // Is field required?
  showWhen?: ConditionalRule[];                     // Conditional visibility rules
  className?: string;                               // Optional CSS classes
};

/**
 * FormInputProps - Props for Form.Input component
 *
 * Standard text input field with validation support.
 */
export type FormInputProps = {
  name: string;                                     // Field name
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date'; // Input type
  placeholder?: string;                             // Placeholder text
  disabled?: boolean;                               // Is input disabled?
  required?: boolean;                               // Is input required? (for ARIA)
  className?: string;                               // Optional CSS classes
};

/**
 * FormSelectProps - Props for Form.Select dropdown component
 *
 * Dropdown select field with options.
 */
export type FormSelectProps = {
  name: string;                                     // Field name
  options: Array<{ value: string; label: string }>; // Dropdown options
  placeholder?: string;                             // Placeholder text
  disabled?: boolean;                               // Is select disabled?
  required?: boolean;                               // Is select required? (for ARIA)
  className?: string;                               // Optional CSS classes
};

/**
 * FormTextareaProps - Props for Form.Textarea component
 *
 * Multi-line text input field.
 */
export type FormTextareaProps = {
  name: string;                                     // Field name
  placeholder?: string;                             // Placeholder text
  rows?: number;                                    // Number of visible rows
  disabled?: boolean;                               // Is textarea disabled?
  required?: boolean;                               // Is textarea required? (for ARIA)
  className?: string;                               // Optional CSS classes
};

/**
 * FormCheckboxProps - Props for Form.Checkbox component
 *
 * Checkbox input for boolean values.
 */
export type FormCheckboxProps = {
  name: string;                                     // Field name
  label: string;                                    // Checkbox label
  disabled?: boolean;                               // Is checkbox disabled?
  required?: boolean;                               // Is checkbox required? (for ARIA)
  className?: string;                               // Optional CSS classes
};

/**
 * FormRadioGroupProps - Props for Form.RadioGroup component
 *
 * Radio button group for selecting one option from multiple choices.
 */
export type FormRadioGroupProps = {
  name: string;                                     // Field name
  options: Array<{ value: string; label: string }>; // Radio options
  disabled?: boolean;                               // Are radios disabled?
  required?: boolean;                               // Is selection required? (for ARIA)
  className?: string;                               // Optional CSS classes
};

/**
 * FormFieldArrayProps - Props for Form.FieldArray component
 *
 * Dynamic field array that allows adding/removing items.
 * Used for repeating form sections (e.g., multiple phone numbers, addresses).
 *
 * REQUIRED PROPS:
 * - name: Field name (must be an array in form values)
 * - children: Render function that receives array helpers
 *
 * OPTIONAL PROPS:
 * - defaultValue: Default value for new array items
 * - label: Label for the field array section
 * - addButtonText: Custom text for the "Add" button
 * - className: Additional CSS classes
 */
export type FormFieldArrayProps = {
  name: string;                                     // Field name (array)
  children: (helpers: FieldArrayHelpers) => React.ReactNode; // Render function
  defaultValue?: unknown;                           // Default value for new items
  label?: string;                                   // Section label
  addButtonText?: string;                           // Custom "Add" button text
  className?: string;                               // Optional CSS classes
};

/**
 * FieldArrayHelpers - Helper methods for array field manipulation
 *
 * Provided to the render function of Form.FieldArray.
 * Allows adding, removing, and reordering array items.
 */
export type FieldArrayHelpers = {
  items: unknown[];                                 // Current array items
  add: () => void;                                  // Add new item
  remove: (index: number) => void;                  // Remove item at index
  move: (fromIndex: number, toIndex: number) => void; // Move item
};

