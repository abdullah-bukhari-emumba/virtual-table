// ============================================================================
// FORM COMPOUND COMPONENTS
// ============================================================================
// This file implements the compound component pattern for forms.
// It exports a main Form component with attached sub-components:
// - Form (parent wrapper)
// - Form.Field (field wrapper with label and error display)
// - Form.Input (text input)
// - Form.Select (dropdown)
// - Form.Textarea (multi-line text)
// - Form.Checkbox (checkbox input)
// - Form.RadioGroup (radio button group)
//
// COMPOUND COMPONENT PATTERN:
// Instead of importing multiple separate components, users import one Form
// component and access sub-components as properties (Form.Input, Form.Field, etc.).
// This creates a clear API and ensures components work together seamlessly.
//
// USAGE EXAMPLE:
// <Form initialValues={...} onSubmit={...}>
//   <Form.Field name="email" label="Email">
//     <Form.Input name="email" type="email" />
//   </Form.Field>
// </Form>
// ============================================================================

'use client';

import React from 'react';
import { FormProvider, useFormContext } from './FormContext';
import type {
  FormProps,
  FormFieldProps,
  FormInputProps,
  FormSelectProps,
  FormTextareaProps,
  FormCheckboxProps,
  FormRadioGroupProps,
} from '../types';

// ============================================================================
// MAIN FORM COMPONENT (Parent)
// ============================================================================
/**
 * Form - Main form wrapper component
 * 
 * This is the parent component that wraps all form fields. It provides
 * form context to all child components through the FormProvider.
 * 
 * RESPONSIBILITIES:
 * - Initialize form state with initial values
 * - Provide validation schema to context
 * - Handle form submission
 * - Render HTML form element
 * 
 * PROPS:
 * - initialValues: Starting values for all form fields
 * - onSubmit: Callback when form is successfully submitted
 * - validationSchema: Yup schema for validation (optional)
 * - validateOnChange: Validate as user types (default: true)
 * - validateOnBlur: Validate when user leaves field (default: true)
 * - children: Form fields and other content
 * - className: Additional CSS classes
 */
function FormRoot({
  initialValues,
  onSubmit,
  validationSchema,
  validateOnChange = true,
  validateOnBlur = true,
  children,
  className = '',
}: FormProps) {
  return (
    // Wrap form in FormProvider to provide context to all children
    <FormProvider
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      validateOnChange={validateOnChange}
      validateOnBlur={validateOnBlur}
    >
      {/* Access handleSubmit from context to handle form submission */}
      <FormSubmitWrapper className={className}>
        {children}
      </FormSubmitWrapper>
    </FormProvider>
  );
}

/**
 * FormSubmitWrapper - Internal component to access context for form submission
 * 
 * This component is needed because we need to access useFormContext,
 * which must be called inside the FormProvider.
 */
function FormSubmitWrapper({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className: string;
}) {
  // Access form context to get handleSubmit
  const { handleSubmit } = useFormContext();
  
  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      {children}
    </form>
  );
}

// ============================================================================
// FORM.FIELD - Field wrapper with label and error display
// ============================================================================
/**
 * FormField - Wrapper component for form fields
 * 
 * This component wraps input components and provides:
 * - Label display
 * - Error message display
 * - Conditional visibility (show/hide based on other field values)
 * - Required field indicator (*)
 * 
 * RESPONSIBILITIES:
 * - Display field label
 * - Show validation errors (only if field is touched)
 * - Handle conditional visibility
 * - Provide consistent styling
 * 
 * PROPS:
 * - name: Field name (must match key in form values)
 * - label: Display label for the field
 * - children: The input component (Form.Input, Form.Select, etc.)
 * - required: Show asterisk (*) for required fields
 * - showWhen: Conditional rules for showing this field
 * - className: Additional CSS classes
 */
function FormField({
  name,
  label,
  children,
  required = false,
  showWhen,
  className = '',
}: FormFieldProps) {
  // Access form context to get errors, touched, and visibility check
  const { errors, touched, isFieldVisible } = useFormContext();
  
  // Check if field should be visible based on conditional rules
  const isVisible = isFieldVisible(showWhen);
  
  // Don't render if field is hidden by conditional rules
  if (!isVisible) return null;
  
  // Get error message for this field (only show if field is touched)
  const error = touched[name] ? errors[name] : undefined;
  const hasError = !!error;
  
  return (
    <div className={`mb-6 ${className}`}>
      {/* Field Label */}
      <label 
        htmlFor={name} 
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
        {/* Required indicator */}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {/* Input Component (passed as children) */}
      {children}
      
      {/* Error Message */}
      {hasError && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// FORM.INPUT - Text input component
// ============================================================================
/**
 * FormInput - Text input field
 * 
 * Standard text input with validation support.
 * Automatically connects to form context for value and change handling.
 * 
 * RESPONSIBILITIES:
 * - Display input field
 * - Update form value on change
 * - Mark field as touched on blur
 * - Show error state with red border
 * 
 * PROPS:
 * - name: Field name (must match key in form values)
 * - type: Input type (text, email, password, number, tel, date)
 * - placeholder: Placeholder text
 * - disabled: Is input disabled?
 * - className: Additional CSS classes
 */
function FormInput({
  name,
  type = 'text',
  placeholder,
  disabled = false,
  className = '',
}: FormInputProps) {
  // Access form context
  const { values, errors, touched, setFieldValue, setFieldTouched } = useFormContext();
  
  // Get current value and error state
  const value = values[name] || '';
  const hasError = touched[name] && !!errors[name];
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(name, e.target.value);
  };
  
  // Handle input blur (mark as touched)
  const handleBlur = () => {
    setFieldTouched(name, true);
  };
  
  return (
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={`
        w-full px-4 py-2 border rounded-lg
        text-gray-900 placeholder:text-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500
        disabled:bg-gray-100 disabled:cursor-not-allowed
        ${hasError ? 'border-red-500' : 'border-gray-300'}
        ${className}
      `}
    />
  );
}

// ============================================================================
// FORM.SELECT - Dropdown select component
// ============================================================================
/**
 * FormSelect - Dropdown select field
 * 
 * Dropdown with predefined options.
 * 
 * PROPS:
 * - name: Field name
 * - options: Array of {value, label} objects
 * - placeholder: Placeholder text for empty selection
 * - disabled: Is select disabled?
 * - className: Additional CSS classes
 */
function FormSelect({
  name,
  options,
  placeholder,
  disabled = false,
  className = '',
}: FormSelectProps) {
  const { values, errors, touched, setFieldValue, setFieldTouched } = useFormContext();
  
  const value = values[name] || '';
  const hasError = touched[name] && !!errors[name];
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFieldValue(name, e.target.value);
  };
  
  const handleBlur = () => {
    setFieldTouched(name, true);
  };
  
  return (
    <select
      id={name}
      name={name}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      className={`
        w-full px-4 py-2 border rounded-lg
        text-gray-900
        focus:outline-none focus:ring-2 focus:ring-blue-500
        disabled:bg-gray-100 disabled:cursor-not-allowed
        ${hasError ? 'border-red-500' : 'border-gray-300'}
        ${className}
      `}
    >
      {/* Placeholder option */}
      {placeholder && (
        <option value="" disabled className="text-gray-400">
          {placeholder}
        </option>
      )}
      
      {/* Render all options */}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// ============================================================================
// FORM.TEXTAREA - Multi-line text input
// ============================================================================
/**
 * FormTextarea - Multi-line text input field
 * 
 * PROPS:
 * - name: Field name
 * - placeholder: Placeholder text
 * - rows: Number of visible rows (default: 4)
 * - disabled: Is textarea disabled?
 * - className: Additional CSS classes
 */
function FormTextarea({
  name,
  placeholder,
  rows = 4,
  disabled = false,
  className = '',
}: FormTextareaProps) {
  const { values, errors, touched, setFieldValue, setFieldTouched } = useFormContext();

  const value = values[name] || '';
  const hasError = touched[name] && !!errors[name];

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFieldValue(name, e.target.value);
  };

  const handleBlur = () => {
    setFieldTouched(name, true);
  };

  return (
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`
        w-full px-4 py-2 border rounded-lg
        text-gray-900 placeholder:text-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500
        disabled:bg-gray-100 disabled:cursor-not-allowed
        resize-vertical
        ${hasError ? 'border-red-500' : 'border-gray-300'}
        ${className}
      `}
    />
  );
}

// ============================================================================
// FORM.CHECKBOX - Checkbox input component
// ============================================================================
/**
 * FormCheckbox - Checkbox input for boolean values
 *
 * Used for yes/no, true/false selections.
 * Note: This component includes its own label, so it doesn't need Form.Field wrapper.
 *
 * PROPS:
 * - name: Field name
 * - label: Checkbox label text
 * - disabled: Is checkbox disabled?
 * - className: Additional CSS classes
 */
function FormCheckbox({
  name,
  label,
  disabled = false,
  className = '',
}: FormCheckboxProps) {
  const { values, setFieldValue, setFieldTouched } = useFormContext();

  // Checkbox value is boolean
  const checked = !!values[name];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(name, e.target.checked);
  };

  const handleBlur = () => {
    setFieldTouched(name, true);
  };

  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <label
        htmlFor={name}
        className="ml-2 text-sm text-gray-700"
      >
        {label}
      </label>
    </div>
  );
}

// ============================================================================
// FORM.RADIOGROUP - Radio button group component
// ============================================================================
/**
 * FormRadioGroup - Radio button group for selecting one option
 *
 * Displays multiple radio buttons where only one can be selected.
 *
 * PROPS:
 * - name: Field name
 * - options: Array of {value, label} objects
 * - disabled: Are all radios disabled?
 * - className: Additional CSS classes
 */
function FormRadioGroup({
  name,
  options,
  disabled = false,
  className = '',
}: FormRadioGroupProps) {
  const { values, setFieldValue, setFieldTouched } = useFormContext();

  const selectedValue = values[name] || '';

  const handleChange = (value: string) => {
    setFieldValue(name, value);
  };

  const handleBlur = () => {
    setFieldTouched(name, true);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {options.map((option) => (
        <div key={option.value} className="flex items-center">
          <input
            id={`${name}-${option.value}`}
            name={name}
            type="radio"
            value={option.value}
            checked={selectedValue === option.value}
            onChange={() => handleChange(option.value)}
            onBlur={handleBlur}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <label
            htmlFor={`${name}-${option.value}`}
            className="ml-2 text-sm text-gray-700"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// COMPOUND COMPONENT EXPORT
// ============================================================================
/**
 * Export Form with attached sub-components
 *
 * This creates the compound component pattern where all related components
 * are accessed through a single Form namespace:
 *
 * USAGE:
 * import { Form } from './components/Form';
 *
 * <Form initialValues={...} onSubmit={...}>
 *   <Form.Field name="email" label="Email">
 *     <Form.Input name="email" type="email" />
 *   </Form.Field>
 *   <Form.Checkbox name="agree" label="I agree to terms" />
 * </Form>
 */
export const Form = Object.assign(FormRoot, {
  Field: FormField,
  Input: FormInput,
  Select: FormSelect,
  Textarea: FormTextarea,
  Checkbox: FormCheckbox,
  RadioGroup: FormRadioGroup,
});

