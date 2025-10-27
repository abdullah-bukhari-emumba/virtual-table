// ============================================================================
// FORM INPUT COMPONENTS
// ============================================================================
// Input components for the compound form builder
// ============================================================================

'use client';

import React, { useEffect, ChangeEvent, FocusEvent } from 'react';
import { useFormContext } from './FormContext';
import { FormField } from './FormField';
import type { BaseFieldProps, SelectOption, RadioOption } from './types';

// ============================================================================
// BASE INPUT STYLES - PROFESSIONAL & MODERN
// ============================================================================
// Enhanced input styling with better visual feedback and accessibility
// - Smooth transitions for all interactive states
// - Clear focus indicators with ring and border changes
// - Proper disabled state styling
// - Error state with red accents
// - Hover effects for better UX
// ============================================================================

const baseInputStyles = `
  block w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5
  text-gray-900 placeholder-gray-400
  shadow-sm transition-all duration-200
  hover:border-gray-400 hover:shadow-md
  focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none
  disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 disabled:border-gray-200
  sm:text-sm
`;

const errorInputStyles = `
  border-red-400 bg-red-50/50 text-red-900 placeholder-red-400
  hover:border-red-500
  focus:border-red-500 focus:ring-4 focus:ring-red-500/10
`;

// ============================================================================
// FORM INPUT (text, email, password, number, etc.)
// ============================================================================

interface FormInputProps extends BaseFieldProps {
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'datetime-local' | 'time';
  /** Placeholder text */
  placeholder?: string;
  /** Autocomplete attribute */
  autoComplete?: string;
  /** Min value (for number/date inputs) */
  min?: number | string;
  /** Max value (for number/date inputs) */
  max?: number | string;
  /** Step value (for number inputs) */
  step?: number | string;
  /** Max length (for text inputs) */
  maxLength?: number;
}

export function FormInput({
  name,
  label,
  helpText,
  required = false,
  disabled = false,
  className = '',
  type = 'text',
  placeholder,
  autoComplete,
  min,
  max,
  step,
  maxLength,
  validate,
}: FormInputProps) {
  const {
    registerField,
    unregisterField,
    getFieldValue,
    getFieldError,
    setFieldValue,
    setFieldTouched,
    validateField,
    validationTiming,
  } = useFormContext();

  const value = getFieldValue(name) as string | number | undefined;
  const error = getFieldError(name);

  // Register field on mount
  useEffect(() => {
    registerField(name);
    return () => unregisterField(name);
  }, [name, registerField, unregisterField]);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFieldValue(name, newValue);

    // Validate on change if enabled
    if (validationTiming.onChange) {
      await validateField(name);
    }

    // Custom validation
    if (validate) {
      const error = await validate(newValue);
      if (error) {
        // Handle custom validation error
      }
    }
  };

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    setFieldTouched(name, true);

    // Validate on blur if enabled
    if (validationTiming.onBlur) {
      await validateField(name);
    }
  };

  return (
    <FormField
      name={name}
      label={label}
      helpText={helpText}
      required={required}
      className={className}
    >
      <input
        type={type}
        value={value ?? ''}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        min={min}
        max={max}
        step={step}
        maxLength={maxLength}
        className={`${baseInputStyles} ${error ? errorInputStyles : ''}`}
      />
    </FormField>
  );
}

// ============================================================================
// FORM TEXTAREA
// ============================================================================

interface FormTextareaProps extends BaseFieldProps {
  /** Placeholder text */
  placeholder?: string;
  /** Number of rows */
  rows?: number;
  /** Max length */
  maxLength?: number;
}

export function FormTextarea({
  name,
  label,
  helpText,
  required = false,
  disabled = false,
  className = '',
  placeholder,
  rows = 4,
  maxLength,
  validate,
}: FormTextareaProps) {
  const {
    registerField,
    unregisterField,
    getFieldValue,
    getFieldError,
    setFieldValue,
    setFieldTouched,
    validateField,
    validationTiming,
  } = useFormContext();

  const value = getFieldValue(name) as string | undefined;
  const error = getFieldError(name);

  useEffect(() => {
    registerField(name);
    return () => unregisterField(name);
  }, [name, registerField, unregisterField]);

  const handleChange = async (e: ChangeEvent<HTMLTextAreaElement>) => {
    setFieldValue(name, e.target.value);

    if (validationTiming.onChange) {
      await validateField(name);
    }

    if (validate) {
      const error = await validate(e.target.value);
      if (error) {
        // Handle custom validation error
      }
    }
  };

  const handleBlur = async (e: FocusEvent<HTMLTextAreaElement>) => {
    setFieldTouched(name, true);

    if (validationTiming.onBlur) {
      await validateField(name);
    }
  };

  return (
    <FormField
      name={name}
      label={label}
      helpText={helpText}
      required={required}
      className={className}
    >
      <textarea
        value={value ?? ''}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`${baseInputStyles} ${error ? errorInputStyles : ''}`}
      />
    </FormField>
  );
}

// ============================================================================
// FORM SELECT
// ============================================================================

interface FormSelectProps extends BaseFieldProps {
  /** Select options */
  options: SelectOption[];
  /** Placeholder option */
  placeholder?: string;
}

export function FormSelect({
  name,
  label,
  helpText,
  required = false,
  disabled = false,
  className = '',
  options,
  placeholder,
  validate,
}: FormSelectProps) {
  const {
    registerField,
    unregisterField,
    getFieldValue,
    getFieldError,
    setFieldValue,
    setFieldTouched,
    validateField,
    validationTiming,
  } = useFormContext();

  const value = getFieldValue(name) as string | number | undefined;
  const error = getFieldError(name);

  useEffect(() => {
    registerField(name);
    return () => unregisterField(name);
  }, [name, registerField, unregisterField]);

  const handleChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    setFieldValue(name, e.target.value);

    if (validationTiming.onChange) {
      await validateField(name);
    }

    if (validate) {
      const error = await validate(e.target.value);
      if (error) {
        // Handle custom validation error
      }
    }
  };

  const handleBlur = async (e: FocusEvent<HTMLSelectElement>) => {
    setFieldTouched(name, true);

    if (validationTiming.onBlur) {
      await validateField(name);
    }
  };

  return (
    <FormField
      name={name}
      label={label}
      helpText={helpText}
      required={required}
      className={className}
    >
      <select
        value={value ?? ''}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        className={`${baseInputStyles} ${error ? errorInputStyles : ''}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

// ============================================================================
// FORM CHECKBOX
// ============================================================================

interface FormCheckboxProps extends Omit<BaseFieldProps, 'label'> {
  /** Checkbox label (appears next to checkbox) */
  label: string;
  /** Description text */
  description?: string;
}

export function FormCheckbox({
  name,
  label,
  helpText,
  description,
  required = false,
  disabled = false,
  className = '',
  validate,
}: FormCheckboxProps) {
  const {
    registerField,
    unregisterField,
    getFieldValue,
    setFieldValue,
    setFieldTouched,
    validateField,
    validationTiming,
  } = useFormContext();

  const value = getFieldValue(name) as boolean | undefined;

  useEffect(() => {
    registerField(name);
    return () => unregisterField(name);
  }, [name, registerField, unregisterField]);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setFieldValue(name, e.target.checked);

    if (validationTiming.onChange) {
      await validateField(name);
    }

    if (validate) {
      const error = await validate(e.target.checked);
      if (error) {
        // Handle custom validation error
      }
    }
  };

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    setFieldTouched(name, true);

    if (validationTiming.onBlur) {
      await validateField(name);
    }
  };

  const fieldId = `field-${name}`;

  return (
    <div className={`relative flex items-start ${className}`}>
      <div className="flex h-6 items-center">
        <input
          id={fieldId}
          name={name}
          type="checkbox"
          checked={value ?? false}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 disabled:cursor-not-allowed disabled:bg-gray-50"
        />
      </div>
      <div className="ml-3 text-sm leading-6">
        <label htmlFor={fieldId} className="font-medium text-gray-900">
          {label}
          {required && (
            <span className="ml-1 text-red-600" aria-label="required">
              *
            </span>
          )}
        </label>
        {description && (
          <p className="text-gray-500">{description}</p>
        )}
        {helpText && (
          <p className="text-gray-500">{helpText}</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// FORM RADIO GROUP
// ============================================================================

interface FormRadioProps extends BaseFieldProps {
  /** Radio options */
  options: RadioOption[];
  /** Layout direction */
  direction?: 'vertical' | 'horizontal';
}

export function FormRadio({
  name,
  label,
  helpText,
  required = false,
  disabled = false,
  className = '',
  options,
  direction = 'vertical',
  validate,
}: FormRadioProps) {
  const {
    registerField,
    unregisterField,
    getFieldValue,
    getFieldError,
    setFieldValue,
    setFieldTouched,
    validateField,
    validationTiming,
  } = useFormContext();

  const value = getFieldValue(name) as string | number | undefined;
  const error = getFieldError(name);

  useEffect(() => {
    registerField(name);
    return () => unregisterField(name);
  }, [name, registerField, unregisterField]);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setFieldValue(name, e.target.value);

    if (validationTiming.onChange) {
      await validateField(name);
    }

    if (validate) {
      const error = await validate(e.target.value);
      if (error) {
        // Handle custom validation error
      }
    }
  };

  const handleBlur = async (e: FocusEvent<HTMLInputElement>) => {
    setFieldTouched(name, true);

    if (validationTiming.onBlur) {
      await validateField(name);
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
          {required && (
            <span className="ml-1 text-red-600" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      <div
        className={direction === 'horizontal' ? 'flex gap-4' : 'space-y-2'}
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          return (
            <div key={option.value} className="flex items-center">
              <input
                id={optionId}
                name={name}
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={disabled || option.disabled}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600 disabled:cursor-not-allowed disabled:bg-gray-50"
              />
              <label
                htmlFor={optionId}
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>

      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helpText}</p>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert" aria-live="polite">
          {error.message}
        </p>
      )}
    </div>
  );
}

