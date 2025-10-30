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

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type {
  FormContextValue,
  FormValues,
  FormErrors,
  FormTouched,
  ConditionalRule,
  ArrayMetadata
} from '../types';
import { normalizeFormValues, denormalizeFormValues, getArrayItems, getNextArrayIndex } from '../utils/normalization';

// ============================================================================
// FORM STATE TYPE DEFINITION
// ============================================================================
/**
 * FormState - Complete form state managed by useReducer
 *
 * This type defines the shape of the entire form state.
 * Using a single state object (instead of multiple useState calls) provides:
 * - Better organization of related state
 * - Easier debugging (single state object to inspect)
 * - More predictable state updates
 * - Better performance for complex state logic
 *
 * STATE PROPERTIES:
 * - values: Current form field values
 * - errors: Current validation errors
 * - touched: Which fields have been interacted with
 * - isSubmitting: Whether form is currently being submitted
 * - isValidating: Whether form is currently being validated
 * - submitCount: Number of times form has been submitted
 */
type FormState = {
  values: FormValues;           // Current form values (NORMALIZED: flat field paths)
  arrayMetadata: ArrayMetadata; // Metadata for array fields (length, indices)
  errors: FormErrors;           // Current validation errors
  touched: FormTouched;         // Which fields have been touched
  isSubmitting: boolean;        // Is form currently submitting?
  isValidating: boolean;        // Is form currently validating?
  submitCount: number;          // Number of submit attempts
};

// ============================================================================
// ACTION TYPE DEFINITIONS
// ============================================================================
/**
 * FormAction - All possible actions that can update form state
 *
 * Using a discriminated union type ensures type safety for all actions.
 * Each action has a 'type' property and optional payload.
 *
 * ACTION TYPES:
 * - SET_FIELD_VALUE: Update a single field's value
 * - SET_FIELD_ERROR: Set error for a single field
 * - SET_FIELD_TOUCHED: Mark a field as touched
 * - SET_ERRORS: Set all errors at once
 * - SET_VALUES: Set all values at once
 * - SET_TOUCHED: Set all touched fields at once
 * - SET_ARRAY_METADATA: Update array metadata (for normalized state)
 * - RESET_FORM: Reset form to initial state
 * - SUBMIT_START: Mark form as submitting
 * - SUBMIT_END: Mark form as not submitting
 * - VALIDATE_START: Mark form as validating
 * - VALIDATE_END: Mark form as not validating
 * - CLEAR_FIELD_ERROR: Clear error for a single field
 */
type FormAction =
  | { type: 'SET_FIELD_VALUE'; payload: { name: string; value: unknown } }
  | { type: 'SET_FIELD_ERROR'; payload: { name: string; error: string } }
  | { type: 'SET_FIELD_TOUCHED'; payload: { name: string; touched: boolean } }
  | { type: 'SET_ERRORS'; payload: FormErrors }
  | { type: 'SET_VALUES'; payload: FormValues }
  | { type: 'SET_TOUCHED'; payload: FormTouched }
  | { type: 'SET_ARRAY_METADATA'; payload: ArrayMetadata }
  | { type: 'RESET_FORM'; payload: FormValues }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_END' }
  | { type: 'VALIDATE_START' }
  | { type: 'VALIDATE_END' }
  | { type: 'CLEAR_FIELD_ERROR'; payload: { name: string } };

// ============================================================================
// REDUCER FUNCTION
// ============================================================================
/**
 * formReducer - Pure function that updates form state
 *
 * This reducer handles all state updates for the form.
 * It's a pure function: given the same state and action, it always
 * returns the same new state (no side effects).
 *
 * BENEFITS OF useReducer OVER useState:
 * 1. Centralized state logic - All state updates in one place
 * 2. Easier testing - Pure function, easy to test
 * 3. Better debugging - Can log all actions and state changes
 * 4. Predictable updates - Clear action types, no hidden state changes
 * 5. Complex state logic - Better for forms with many interdependent fields
 * 6. Performance - Fewer re-renders with batched updates
 *
 * PARAMETERS:
 * - state: Current form state
 * - action: Action to perform
 *
 * RETURNS:
 * - New form state (never mutates existing state)
 */
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    // Update a single field's value
    case 'SET_FIELD_VALUE':
      return {
        ...state,
        values: {
          ...state.values,
          [action.payload.name]: action.payload.value,
        },
      };

    // Set error for a single field
    case 'SET_FIELD_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.name]: action.payload.error,
        },
      };

    // Clear error for a single field
    case 'CLEAR_FIELD_ERROR': {
      const newErrors = { ...state.errors };
      delete newErrors[action.payload.name];
      return {
        ...state,
        errors: newErrors,
      };
    }

    // Mark a field as touched
    case 'SET_FIELD_TOUCHED':
      return {
        ...state,
        touched: {
          ...state.touched,
          [action.payload.name]: action.payload.touched,
        },
      };

    // Set all errors at once (used after full form validation)
    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload,
      };

    // Set all values at once
    case 'SET_VALUES':
      return {
        ...state,
        values: action.payload,
      };

    // Set all touched fields at once
    case 'SET_TOUCHED':
      return {
        ...state,
        touched: action.payload,
      };

    // Update array metadata
    case 'SET_ARRAY_METADATA':
      return {
        ...state,
        arrayMetadata: action.payload,
      };

    // Reset form to initial state
    case 'RESET_FORM': {
      // Normalize the initial values
      const normalized = normalizeFormValues(action.payload);
      return {
        values: normalized.values,
        arrayMetadata: normalized.arrayMetadata,
        errors: {},
        touched: {},
        isSubmitting: false,
        isValidating: false,
        submitCount: 0,
      };
    }

    // Mark form as submitting
    case 'SUBMIT_START':
      return {
        ...state,
        isSubmitting: true,
        submitCount: state.submitCount + 1,
      };

    // Mark form as not submitting
    case 'SUBMIT_END':
      return {
        ...state,
        isSubmitting: false,
      };

    // Mark form as validating
    case 'VALIDATE_START':
      return {
        ...state,
        isValidating: true,
      };

    // Mark form as not validating
    case 'VALIDATE_END':
      return {
        ...state,
        isValidating: false,
      };

    // Default: return current state (no changes)
    default:
      return state;
  }
}

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
  validationSchema?: unknown;
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
  // STATE INITIALIZATION WITH useReducer
  // ==========================================================================
  /**
   * Initialize form state using useReducer instead of multiple useState calls
   *
   * BENEFITS OF useReducer:
   * - Single source of truth for all form state
   * - Centralized state update logic in reducer function
   * - Easier to debug (can log all actions)
   * - Better performance (batched updates)
   * - More predictable state transitions
   * - Easier to test (reducer is a pure function)
   *
   * INITIAL STATE:
   * - values: Normalized initial values (flat field paths)
   * - arrayMetadata: Metadata for array fields
   * - errors: Empty object (no errors initially)
   * - touched: Empty object (no fields touched initially)
   * - isSubmitting: false
   * - isValidating: false
   * - submitCount: 0
   */
  // Normalize initial values on mount
  const normalizedInitial = normalizeFormValues(initialValues);

  const [state, dispatch] = useReducer(formReducer, {
    values: normalizedInitial.values,
    arrayMetadata: normalizedInitial.arrayMetadata,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValidating: false,
    submitCount: 0,
  });

  // Destructure state for easier access
  const { values, arrayMetadata, errors, touched, isSubmitting } = state;

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
   * 4. If valid: Clear error for this field (dispatch CLEAR_FIELD_ERROR)
   * 5. If invalid: Set error message for this field (dispatch SET_FIELD_ERROR)
   *
   * NOTE: This function accepts an optional fieldValue parameter to validate
   * against the latest value (important for validateOnChange scenarios)
   *
   * REFACTORED: Now uses dispatch instead of setErrors
   */
  const validateField = useCallback(
    async (name: string, fieldValue?: unknown) => {
      // Guard: No validation if no schema provided
      if (!validationSchema) return;

      try {
        // Type guard for validation schema
        if (typeof validationSchema !== 'object' || validationSchema === null) return;

        // Get the schema for this specific field
        const schemaWithFields = validationSchema as { fields?: Record<string, { validate: (value: unknown, options?: unknown) => Promise<unknown> }> };
        const fieldSchema = schemaWithFields.fields?.[name];

        if (fieldSchema) {
          // Use provided value or current value from state
          const valueToValidate = fieldValue !== undefined ? fieldValue : values[name];

          // Validate the field value
          await fieldSchema.validate(valueToValidate, { abortEarly: false });

          // Validation passed: Clear any existing error
          dispatch({ type: 'CLEAR_FIELD_ERROR', payload: { name } });
        }
      } catch (error: unknown) {
        // Validation failed: Set error message
        // Type guard for Yup validation errors
        if (
          error &&
          typeof error === 'object' &&
          'errors' in error &&
          Array.isArray((error as { errors: unknown }).errors) &&
          (error as { errors: unknown[] }).errors.length > 0
        ) {
          const yupError = error as { errors: string[] };
          dispatch({
            type: 'SET_FIELD_ERROR',
            payload: { name, error: yupError.errors[0] }
          });
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
   * 1. Update the field value in state (dispatch SET_FIELD_VALUE)
   * 2. If validateOnChange is true, validate the field with the new value
   * 3. Re-render components that depend on this value
   *
   * REFACTORED: Now uses dispatch instead of setValues
   */
  const setFieldValue = useCallback(
    (name: string, value: unknown) => {
      // Update field value using dispatch
      dispatch({ type: 'SET_FIELD_VALUE', payload: { name, value } });

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
   * 1. Mark field as touched (dispatch SET_FIELD_TOUCHED)
   * 2. If validateOnBlur is true and field is touched, validate it
   *
   * REFACTORED: Now uses dispatch instead of setTouched
   */
  const setFieldTouched = useCallback(
    (name: string, isTouched: boolean) => {
      // Update touched state using dispatch
      dispatch({ type: 'SET_FIELD_TOUCHED', payload: { name, touched: isTouched } });

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
   *
   * REFACTORED: Now uses dispatch instead of setErrors
   */
  const setFieldError = useCallback((name: string, error: string) => {
    dispatch({ type: 'SET_FIELD_ERROR', payload: { name, error } });
  }, []);

  /**
   * validateForm - Validate all fields in the form
   *
   * Validates the entire form against the Yup schema.
   *
   * EXECUTION FLOW:
   * 1. Check if validation schema exists
   * 2. Denormalize values (Yup expects nested structure)
   * 3. Validate denormalized values against the schema
   * 4. If valid: Clear all errors (dispatch SET_ERRORS with empty object), return true
   * 5. If invalid: Set all error messages (dispatch SET_ERRORS), return false
   *
   * RETURNS:
   * - true if form is valid
   * - false if form has validation errors
   *
   * REFACTORED: Now uses dispatch instead of setErrors
   * NORMALIZED STATE: Denormalizes before validation
   */
  const validateForm = useCallback(async (): Promise<boolean> => {
    // Guard: No validation if no schema provided
    if (!validationSchema) return true;

    try {
      // Type guard for validation schema
      if (typeof validationSchema !== 'object' || validationSchema === null) return true;

      // Denormalize values for validation (Yup expects nested structure)
      const denormalizedValues = denormalizeFormValues(values, arrayMetadata);

      // Validate all form values
      const schemaWithValidate = validationSchema as { validate: (values: unknown, options?: unknown) => Promise<unknown> };
      await schemaWithValidate.validate(denormalizedValues, { abortEarly: false });

      // Validation passed: Clear all errors
      dispatch({ type: 'SET_ERRORS', payload: {} });
      return true;
    } catch (error: unknown) {
      // Validation failed: Collect all errors
      const validationErrors: FormErrors = {};

      // Type guard for Yup validation errors with inner array
      if (
        error &&
        typeof error === 'object' &&
        'inner' in error &&
        Array.isArray((error as { inner: unknown }).inner)
      ) {
        const yupError = error as { inner: Array<{ path?: string; message?: string }> };
        yupError.inner.forEach((err) => {
          if (err.path && err.message) {
            validationErrors[err.path] = err.message;
          }
        });
      }

      // Set all errors
      dispatch({ type: 'SET_ERRORS', payload: validationErrors });
      return false;
    }
  }, [validationSchema, values, arrayMetadata]);

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
   * 4. If valid: Denormalize values and call onSubmit callback
   * 5. If invalid: Do nothing (errors are displayed)
   *
   * EXECUTION FLOW:
   * 1. User clicks submit button
   * 2. Prevent browser's default form submission
   * 3. Set isSubmitting to true (dispatch SUBMIT_START)
   * 4. Mark all fields as touched (dispatch SET_TOUCHED)
   * 5. Validate entire form
   * 6. If valid: Denormalize values and call onSubmit
   * 7. Set isSubmitting to false (dispatch SUBMIT_END)
   *
   * REFACTORED: Now uses dispatch instead of setIsSubmitting and setTouched
   * NORMALIZED STATE: Denormalizes before submission
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      // Prevent default browser form submission
      e.preventDefault();

      // Set submitting state
      dispatch({ type: 'SUBMIT_START' });

      // Mark all fields as touched to show all errors
      const allTouched: FormTouched = {};
      Object.keys(values).forEach((key) => {
        allTouched[key] = true;
      });
      dispatch({ type: 'SET_TOUCHED', payload: allTouched });

      // Validate entire form
      const isValid = await validateForm();

      if (isValid) {
        // Form is valid: Denormalize values and call onSubmit callback
        try {
          const denormalizedValues = denormalizeFormValues(values, arrayMetadata);
          await onSubmit(denormalizedValues);
        } catch (error) {
          console.error('Form submission error:', error);
        }
      }

      // Clear submitting state
      dispatch({ type: 'SUBMIT_END' });
    },
    [values, arrayMetadata, validateForm, onSubmit]
  );

  /**
   * resetForm - Reset form to initial values
   *
   * Clears all values, errors, and touched state.
   *
   * REFACTORED: Now uses dispatch with RESET_FORM action
   */
  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM', payload: initialValues });
  }, [initialValues]);

  // ==========================================================================
  // ARRAY FIELD METHODS
  // ==========================================================================
  /**
   * addArrayItem - Add a new item to a field array
   *
   * Adds a new item to an array field using normalized state.
   * Instead of spreading the entire array, we add individual field keys.
   *
   * EXECUTION FLOW (NORMALIZED):
   * 1. Get next available index from metadata
   * 2. Add flat field paths for new item (e.g., 'emergencyContacts[2].name')
   * 3. Update array metadata (increment length, add index)
   *
   * PERFORMANCE BENEFIT:
   * - O(1) operation instead of O(n) array spreading
   * - Only adds new keys, doesn't touch existing items
   *
   * PARAMETERS:
   * - fieldName: Name of the array field
   * - defaultValue: Default value for the new item (optional, should be an object)
   *
   * EXAMPLE:
   * addArrayItem('emergencyContacts', { name: '', phone: '', relationship: '' })
   * // Adds: 'emergencyContacts[2].name', 'emergencyContacts[2].phone', etc.
   */
  const addArrayItem = useCallback(
    (fieldName: string, defaultValue: unknown = {}) => {
      // Get next available index
      const nextIndex = getNextArrayIndex(arrayMetadata, fieldName);

      // Create new values object with added fields
      const newValues = { ...values };

      // Add flat field paths for new item
      if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
        const itemValue = defaultValue as Record<string, unknown>;
        for (const [key, value] of Object.entries(itemValue)) {
          newValues[`${fieldName}[${nextIndex}].${key}`] = value;
        }
      }

      // Update array metadata
      const currentMeta = arrayMetadata[fieldName] || { length: 0, indices: [] };
      const newMetadata = {
        ...arrayMetadata,
        [fieldName]: {
          length: currentMeta.length + 1,
          indices: [...currentMeta.indices, nextIndex],
        },
      };

      // Dispatch both updates
      dispatch({ type: 'SET_VALUES', payload: newValues });
      dispatch({ type: 'SET_ARRAY_METADATA', payload: newMetadata });
    },
    [values, arrayMetadata]
  );

  /**
   * removeArrayItem - Remove an item from a field array
   *
   * Removes an item at the specified index from an array field using normalized state.
   * Instead of filtering the array, we delete individual field keys.
   *
   * EXECUTION FLOW (NORMALIZED):
   * 1. Delete all flat field paths for the item (e.g., 'emergencyContacts[1].name')
   * 2. Update array metadata (decrement length, remove index)
   * 3. Clean up errors and touched state for removed item
   *
   * PERFORMANCE BENEFIT:
   * - O(1) operation instead of O(n) array filtering
   * - Only deletes specific keys, doesn't touch other items
   *
   * PARAMETERS:
   * - fieldName: Name of the array field
   * - index: Index of the item to remove
   *
   * EXAMPLE:
   * removeArrayItem('emergencyContacts', 1) // Removes second contact
   */
  const removeArrayItem = useCallback(
    (fieldName: string, index: number) => {
      const currentMeta = arrayMetadata[fieldName];
      if (!currentMeta || !currentMeta.indices.includes(index)) {
        return; // Index doesn't exist
      }

      // Create new values object with removed fields
      const newValues = { ...values };
      const newErrors = { ...errors };
      const newTouched = { ...touched };

      // Delete all flat field paths for this index
      const prefix = `${fieldName}[${index}].`;
      Object.keys(newValues).forEach((key) => {
        if (key.startsWith(prefix)) {
          delete newValues[key];
        }
      });

      // Clean up errors for this index
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith(prefix)) {
          delete newErrors[key];
        }
      });

      // Clean up touched state for this index
      Object.keys(newTouched).forEach((key) => {
        if (key.startsWith(prefix)) {
          delete newTouched[key];
        }
      });

      // Update array metadata
      const newMetadata = {
        ...arrayMetadata,
        [fieldName]: {
          length: currentMeta.length - 1,
          indices: currentMeta.indices.filter((i) => i !== index),
        },
      };

      // Dispatch all updates
      dispatch({ type: 'SET_VALUES', payload: newValues });
      dispatch({ type: 'SET_ERRORS', payload: newErrors });
      dispatch({ type: 'SET_TOUCHED', payload: newTouched });
      dispatch({ type: 'SET_ARRAY_METADATA', payload: newMetadata });
    },
    [values, errors, touched, arrayMetadata]
  );

  /**
   * moveArrayItem - Reorder items in a field array
   *
   * Moves an item from one index to another in an array field using normalized state.
   * This requires renaming field keys to reflect the new indices.
   *
   * EXECUTION FLOW (NORMALIZED):
   * 1. Validate indices exist in metadata
   * 2. Swap field keys between fromIndex and toIndex
   * 3. Update array metadata indices order (no length change)
   *
   * PERFORMANCE NOTE:
   * - Still O(n) due to key renaming, but avoids array spreading
   * - More efficient than nested array approach
   *
   * PARAMETERS:
   * - fieldName: Name of the array field
   * - fromIndex: Current index of the item
   * - toIndex: Destination index for the item
   *
   * EXAMPLE:
   * moveArrayItem('emergencyContacts', 0, 2) // Move first contact to third position
   */
  const moveArrayItem = useCallback(
    (fieldName: string, fromIndex: number, toIndex: number) => {
      const currentMeta = arrayMetadata[fieldName];
      if (!currentMeta ||
          !currentMeta.indices.includes(fromIndex) ||
          !currentMeta.indices.includes(toIndex)) {
        return; // Invalid indices
      }

      // For simplicity, we'll use denormalize -> reorder -> normalize approach
      // This is acceptable since moveArrayItem is less frequently used than add/remove
      const items = getArrayItems(values, arrayMetadata, fieldName);

      // Reorder items
      const reorderedItems = [...items];
      const fromIdx = currentMeta.indices.indexOf(fromIndex);
      const toIdx = currentMeta.indices.indexOf(toIndex);
      const [movedItem] = reorderedItems.splice(fromIdx, 1);
      reorderedItems.splice(toIdx, 0, movedItem);

      // Rebuild normalized structure for this array field
      const newValues = { ...values };
      const newMetadata = { ...arrayMetadata };

      // Remove old keys for this field
      Object.keys(newValues).forEach((key) => {
        if (key.startsWith(`${fieldName}[`)) {
          delete newValues[key];
        }
      });

      // Add new keys with reordered indices
      reorderedItems.forEach((item, idx) => {
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          const itemObj = item as Record<string, unknown>;
          for (const [key, value] of Object.entries(itemObj)) {
            newValues[`${fieldName}[${idx}].${key}`] = value;
          }
        }
      });

      // Update metadata with new indices
      newMetadata[fieldName] = {
        length: reorderedItems.length,
        indices: reorderedItems.map((_, idx) => idx),
      };

      // Dispatch updates
      dispatch({ type: 'SET_VALUES', payload: newValues });
      dispatch({ type: 'SET_ARRAY_METADATA', payload: newMetadata });
    },
    [values, arrayMetadata]
  );

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
    addArrayItem,
    removeArrayItem,
    moveArrayItem,
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

