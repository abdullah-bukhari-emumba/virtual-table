# Form Library Documentation

A comprehensive, accessible form library built with React and TypeScript using the **Compound Component Pattern**. This library provides a powerful yet flexible way to build forms with validation, conditional fields, field arrays, and full accessibility support.

## Table of Contents

- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [Components](#components)
- [Usage Examples](#usage-examples)
- [Validation](#validation)
- [Accessibility](#accessibility)
- [Best Practices](#best-practices)

## Overview

### What is the Compound Component Pattern?

The compound component pattern allows a parent component (Form) to share state with specialized child components (FormInput, FormSelect, etc.) through React Context. This creates a clean, declarative API while maintaining powerful functionality.

**Benefits:**
- Clean, intuitive API
- Flexible composition
- Shared state without prop drilling
- Type-safe with TypeScript
- Excellent developer experience

### Key Features

- ✅ **Compound Component Pattern** - Clean, composable API
- ✅ **Zod Validation** - Schema-based validation with TypeScript inference
- ✅ **Conditional Fields** - Show/hide fields based on other field values
- ✅ **Field Arrays** - Dynamic repeating field groups
- ✅ **Accessibility** - WCAG 2.1 AA compliant
- ✅ **Error Boundaries** - Graceful error handling
- ✅ **TypeScript** - Full type safety
- ✅ **Flexible Validation Timing** - onChange, onBlur, onSubmit
- ✅ **Focus Management** - Auto-focus on first error

## Core Concepts

### 1. Form State Management

The Form component manages all form state internally:

```typescript
{
  values: { email: 'user@example.com', password: '***' },
  errors: { email: { message: 'Invalid email' } },
  formState: {
    isSubmitting: false,
    isSubmitted: false,
    isValid: true,
    isDirty: false,
    isTouched: false,
    submitCount: 0,
    fields: {
      email: { touched: true, dirty: true, validating: false }
    }
  }
}
```

### 2. Field Registration

Fields automatically register/unregister when they mount/unmount:

```typescript
// Field mounts
useEffect(() => {
  registerField('email');
  return () => unregisterField('email');
}, []);
```

This enables:
- Dynamic forms (conditional fields)
- Field arrays
- Proper cleanup
- State tracking per field

### 3. Validation Timing

Control when validation occurs:

- **onSubmit** (default) - Validate only when form is submitted
- **onBlur** - Validate when field loses focus
- **onChange** - Validate on every keystroke
- **all** - Validate on all events

## Components

### Form

Main container component that manages form state and validation.

```tsx
<Form
  initialValues={{ email: '', password: '' }}
  validationSchema={schema}
  onSubmit={handleSubmit}
  validationMode="onBlur"
>
  {/* Form fields */}
</Form>
```

**Props:**
- `initialValues` - Initial form values
- `validationSchema` - Zod schema for validation
- `onSubmit` - Submit handler (receives validated values)
- `validationMode` - When to validate ('onSubmit' | 'onBlur' | 'onChange' | 'all')
- `onError` - Error handler (optional)

### FormInput

Text input field with validation and error display.

```tsx
<FormInput
  name="email"
  label="Email Address"
  type="email"
  placeholder="user@example.com"
  required
  autoComplete="email"
/>
```

**Supported Types:**
- text, email, password, number, tel, url, date, datetime-local, time

### FormTextarea

Multi-line text input.

```tsx
<FormTextarea
  name="description"
  label="Description"
  rows={4}
  placeholder="Enter description..."
/>
```

### FormSelect

Dropdown select field.

```tsx
<FormSelect
  name="country"
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' }
  ]}
/>
```

### FormRadio

Radio button group.

```tsx
<FormRadio
  name="gender"
  label="Gender"
  options={[
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' }
  ]}
  required
/>
```

### FormCheckbox

Single checkbox or checkbox group.

```tsx
<FormCheckbox
  name="terms"
  label="I agree to the terms"
  required
/>
```

### ConditionalField

Show/hide fields based on other field values.

```tsx
<ConditionalField
  condition={{
    when: 'hasAddress',
    is: (value) => value === true
  }}
>
  <FormInput name="street" label="Street Address" />
  <FormInput name="city" label="City" />
</ConditionalField>
```

**How it works:**
1. Watches the specified field (`when`)
2. Evaluates the condition function (`is`)
3. Shows children when condition is true
4. Hides children when condition is false
5. Announces changes to screen readers

### FieldArray

Dynamic arrays of form fields.

```tsx
<FieldArray
  name="contacts"
  minItems={0}
  maxItems={5}
  addButtonLabel="Add Contact"
>
  {({ index }) => (
    <div>
      <FormInput name={`contacts.${index}.name`} label="Name" />
      <FormInput name={`contacts.${index}.email`} label="Email" />
    </div>
  )}
</FieldArray>
```

**Features:**
- Add/remove items
- Min/max constraints
- Reorder items (move up/down)
- Unique keys for React
- Nested field naming

### FormSubmit & FormReset

Action buttons with form state awareness.

```tsx
<FormSubmit disabled={submitting}>
  {submitting ? 'Submitting...' : 'Submit'}
</FormSubmit>

<FormReset>Reset Form</FormReset>
```

### FormError

Display form-level errors.

```tsx
<FormError />
```

### FormErrorBoundary

Catch and display React errors gracefully.

```tsx
<FormErrorBoundary>
  <Form {...props}>
    {/* Form content */}
  </Form>
</FormErrorBoundary>
```

## Usage Examples

### Basic Form

```tsx
import { Form, FormInput, FormSubmit } from '@/lib/form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be 8+ characters')
});

function LoginForm() {
  const handleSubmit = async (values) => {
    await api.login(values);
  };

  return (
    <Form
      initialValues={{ email: '', password: '' }}
      validationSchema={schema}
      onSubmit={handleSubmit}
    >
      <FormInput name="email" label="Email" type="email" required />
      <FormInput name="password" label="Password" type="password" required />
      <FormSubmit>Login</FormSubmit>
    </Form>
  );
}
```

### Conditional Fields

```tsx
<Form initialValues={{ hasInsurance: false, policyNumber: '' }} ...>
  <FormCheckbox name="hasInsurance" label="I have insurance" />
  
  <ConditionalField
    condition={{
      when: 'hasInsurance',
      is: (value) => value === true
    }}
  >
    <FormInput name="policyNumber" label="Policy Number" />
  </ConditionalField>
</Form>
```

### Field Arrays

```tsx
<Form initialValues={{}} ...>
  <FieldArray name="phoneNumbers" minItems={1} maxItems={3}>
    {({ index }) => (
      <FormInput
        name={`phoneNumbers.${index}`}
        label={`Phone ${index + 1}`}
        type="tel"
      />
    )}
  </FieldArray>
</Form>
```

## Validation

### Zod Schema

Define validation rules using Zod:

```typescript
const schema = z.object({
  // Required field
  name: z.string().min(2, 'Name must be 2+ characters'),
  
  // Optional field
  email: z.string().email().optional().or(z.literal('')),
  
  // Custom validation
  age: z.number().refine((age) => age >= 18, 'Must be 18+'),
  
  // Enum
  status: z.enum(['active', 'inactive']),
  
  // Nested object
  address: z.object({
    street: z.string(),
    city: z.string()
  }),
  
  // Array
  tags: z.array(z.string())
});
```

### Validation Timing

```tsx
// Validate only on submit (default)
<Form validationMode="onSubmit" ...>

// Validate when field loses focus
<Form validationMode="onBlur" ...>

// Validate on every change
<Form validationMode="onChange" ...>

// Validate on all events
<Form validationMode="all" ...>
```

## Accessibility

All components follow WCAG 2.1 AA guidelines:

### Labels
- Every field has a proper `<label>` with `htmlFor`
- Required fields marked with asterisk and `aria-required`

### Error Messages
- Errors announced with `role="alert"` and `aria-live="polite"`
- Errors linked to fields with `aria-describedby`
- Invalid fields marked with `aria-invalid="true"`

### Keyboard Navigation
- Full keyboard support (Tab, Enter, Arrow keys)
- Focus management (auto-focus on first error)
- Visible focus indicators

### Screen Readers
- Descriptive labels and help text
- Error announcements
- Conditional field visibility changes announced

## Best Practices

### 1. Component Organization

Extract form sections into separate components:

```tsx
// ✅ Good
<Form>
  <PersonalInfoSection />
  <ContactInfoSection />
  <AddressInfoSection />
</Form>

// ❌ Avoid
<Form>
  {/* 500 lines of form fields */}
</Form>
```

### 2. Validation Schema

Keep validation schemas close to the form:

```tsx
// ✅ Good - Schema defined near usage
const patientSchema = z.object({ ... });

function PatientForm() {
  return <Form validationSchema={patientSchema} ...>
}
```

### 3. Initial Values

Always provide initial values for all fields:

```tsx
// ✅ Good
initialValues={{
  email: '',
  phone: '',
  status: 'active'
}}

// ❌ Avoid
initialValues={{}}
```

### 4. Error Handling

Use FormErrorBoundary to catch errors:

```tsx
<FormErrorBoundary>
  <Form ...>
    {/* Form content */}
  </Form>
</FormErrorBoundary>
```

### 5. Accessibility

- Always provide labels
- Use appropriate input types
- Add autocomplete attributes
- Provide helpful error messages
- Test with keyboard and screen reader

---

## File Structure

```
lib/form/
├── Form.tsx              # Main form component
├── FormContext.tsx       # Context and hooks
├── FormField.tsx         # Field wrapper with label/error
├── inputs.tsx            # Input components
├── ConditionalField.tsx  # Conditional rendering
├── FieldArray.tsx        # Dynamic field arrays
├── FormError.tsx         # Error display
├── ErrorBoundary.tsx     # Error boundary
├── types.ts              # TypeScript types
├── index.ts              # Barrel export
└── README.md             # This file
```

## License

MIT

