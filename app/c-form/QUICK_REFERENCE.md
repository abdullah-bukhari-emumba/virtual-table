# Custom Form System - Quick Reference Guide

> **Quick lookup for file locations, key functions, and common patterns**

---

## 📁 File Structure

```
app/c-form/
├── components/
│   ├── Form.tsx                    # Compound components (Form.Field, Form.Input, etc.)
│   ├── FormContext.tsx             # Context provider, reducer, state management
│   └── FormErrorBoundary.tsx       # Error boundary for form errors
├── schemas/
│   └── patientFormSchema.ts        # Yup validation schema
├── types/
│   └── index.ts                    # TypeScript type definitions
├── utils/
│   ├── normalization.ts            # State normalization utilities
│   └── __tests__/
│       ├── normalization.test.ts   # Jest tests
│       └── test-normalization.js   # Manual tests
├── page.tsx                        # Patient intake form example
├── README.md                       # Getting started guide
├── STATE_NORMALIZATION_SUMMARY.md  # Performance optimization details
├── DEVELOPER_WALKTHROUGH.md        # Complete educational guide
└── QUICK_REFERENCE.md              # This file
```

---

## 🔑 Key Files and Their Purpose

### `components/FormContext.tsx` (920 lines)
**Purpose:** Core state management and form logic

**Key Exports:**
- `FormProvider` - Context provider component
- `useFormContext` - Hook to access form state
- `formReducer` - State reducer function

**Key Functions:**
| Function | Lines | Purpose |
|----------|-------|---------|
| `formReducer` | 104-244 | Handles all state updates |
| `normalizeFormValues` (imported) | 340-342 | Converts nested to flat on mount |
| `validateForm` | 487-547 | Validates form with Yup |
| `handleSubmit` | 552-606 | Handles form submission |
| `setFieldValue` | 608-610 | Updates single field value |
| `setFieldTouched` | 612-614 | Marks field as touched |
| `addArrayItem` | 622-676 | Adds item to array (O(1)) |
| `removeArrayItem` | 689-761 | Removes item from array (O(1)) |
| `moveArrayItem` | 763-838 | Reorders array items |
| `resetForm` | 840-842 | Resets form to initial values |

**State Structure:**
```typescript
{
  values: FormValues,           // Normalized flat paths
  arrayMetadata: ArrayMetadata, // Array structure tracking
  errors: FormErrors,           // Validation errors
  touched: FormTouched,         // User interaction tracking
  isSubmitting: boolean,
  isValidating: boolean,
  submitCount: number
}
```

---

### `components/Form.tsx` (665 lines)
**Purpose:** Compound component implementation

**Key Components:**
| Component | Lines | Purpose |
|-----------|-------|---------|
| `FormComponent` | 246-265 | Main form wrapper |
| `FormField` | 267-298 | Field wrapper with label and error |
| `FormInput` | 390-410 | Text input field |
| `FormSelect` | 412-442 | Select dropdown |
| `FormTextarea` | 444-464 | Textarea field |
| `FormCheckbox` | 466-496 | Checkbox field |
| `FormFieldArray` | 631-652 | Dynamic array fields |
| `FormSubmitButton` | 498-518 | Submit button |
| `FormErrorMessage` | 520-530 | Error message display |

**Usage Pattern:**
```typescript
<Form initialValues={...} onSubmit={...} validationSchema={...}>
  <Form.Field name="firstName" label="First Name">
    <Form.Input name="firstName" />
  </Form.Field>
  
  <Form.FieldArray name="contacts">
    {(helpers) => (
      helpers.items.map((item, i) => (
        <Form.Input name={`contacts[${i}].name`} />
      ))
    )}
  </Form.FieldArray>
  
  <Form.SubmitButton>Submit</Form.SubmitButton>
</Form>
```

---

### `utils/normalization.ts` (200 lines)
**Purpose:** State normalization utilities

**Key Functions:**
| Function | Lines | Purpose |
|----------|-------|---------|
| `normalizeFormValues` | 18-58 | Nested → Flat conversion |
| `denormalizeFormValues` | 60-93 | Flat → Nested conversion |
| `getArrayItems` | 95-125 | Extract array from flat state |
| `getNextArrayIndex` | 127-138 | Get next available index |

**Example:**
```typescript
// Normalize
const { values, arrayMetadata } = normalizeFormValues({
  contacts: [{ name: 'John' }]
});
// Result: { 'contacts[0].name': 'John' }

// Denormalize
const nested = denormalizeFormValues(values, arrayMetadata);
// Result: { contacts: [{ name: 'John' }] }

// Get array items
const items = getArrayItems(values, arrayMetadata, 'contacts');
// Result: [{ name: 'John' }]
```

---

### `types/index.ts` (150 lines)
**Purpose:** TypeScript type definitions

**Key Types:**
```typescript
// Form values (any structure)
export type FormValues = Record<string, unknown>;

// Validation errors
export type FormErrors = Record<string, string>;

// Touched fields
export type FormTouched = Record<string, boolean>;

// Array metadata
export type ArrayMetadata = Record<string, {
  length: number;
  indices: number[];
}>;

// Context value
export type FormContextValue = {
  values: FormValues;
  arrayMetadata: ArrayMetadata;
  errors: FormErrors;
  touched: FormTouched;
  isSubmitting: boolean;
  isValidating: boolean;
  submitCount: number;
  setFieldValue: (name: string, value: unknown) => void;
  setFieldTouched: (name: string, touched: boolean) => void;
  validateForm: () => Promise<boolean>;
  resetForm: () => void;
  addArrayItem: (fieldName: string, defaultValue?: unknown) => void;
  removeArrayItem: (fieldName: string, index: number) => void;
  moveArrayItem: (fieldName: string, fromIndex: number, toIndex: number) => void;
};
```

---

### `schemas/patientFormSchema.ts` (80 lines)
**Purpose:** Yup validation schema

**Example:**
```typescript
export const patientFormSchema = yup.object({
  firstName: yup.string().required('First name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  
  // Nested array validation
  emergencyContacts: yup.array().of(
    yup.object({
      name: yup.string().required('Name is required'),
      phone: yup.string().required('Phone is required')
    })
  ).min(1, 'At least one contact required'),
  
  // Conditional validation
  allergies: yup.string().when('hasAllergies', {
    is: true,
    then: (schema) => schema.required('Please specify allergies'),
    otherwise: (schema) => schema.notRequired()
  })
});
```

---

## 🚀 Common Patterns

### Pattern 1: Adding a New Field

```typescript
// 1. Add to initial values
const initialValues = {
  newField: ''
};

// 2. Add to validation schema
const schema = yup.object({
  newField: yup.string().required('Required')
});

// 3. Render in form
<Form.Field name="newField" label="New Field">
  <Form.Input name="newField" />
</Form.Field>
```

### Pattern 2: Adding a New Field Type

```typescript
// 1. Create component in Form.tsx
function FormDatePicker({ name }: { name: string }) {
  const { values, setFieldValue } = useFormContext();
  
  return (
    <input
      type="date"
      value={values[name] as string}
      onChange={(e) => setFieldValue(name, e.target.value)}
    />
  );
}

// 2. Attach to Form
Form.DatePicker = FormDatePicker;

// 3. Use it
<Form.DatePicker name="dateOfBirth" />
```

### Pattern 3: Conditional Field

```typescript
// 1. Get condition value
const showField = values.someCheckbox as boolean;

// 2. Use showWhen prop
<Form.Field name="conditionalField" showWhen={showField}>
  <Form.Input name="conditionalField" />
</Form.Field>

// 3. Add conditional validation
someField: yup.string().when('someCheckbox', {
  is: true,
  then: (schema) => schema.required('Required when checked')
})
```

### Pattern 4: Dynamic Array

```typescript
<Form.FieldArray
  name="arrayName"
  label="Array Label"
  addButtonText="Add Item"
  defaultValue={{ field1: '', field2: '' }}
>
  {(helpers) => (
    <>
      {helpers.items.map((item, index) => (
        <div key={index}>
          <Form.Input name={`arrayName[${index}].field1`} />
          <Form.Input name={`arrayName[${index}].field2`} />
          <button onClick={() => helpers.remove(index)}>Remove</button>
        </div>
      ))}
    </>
  )}
</Form.FieldArray>
```

---

## 🐛 Debugging Tips

### View Current State

```typescript
// Add debug panel (development only)
{process.env.NODE_ENV === 'development' && <StateDebugPanel />}
```

### Log Reducer Actions

```typescript
// In formReducer function
function formReducer(state: FormState, action: FormAction): FormState {
  console.log('Action:', action.type, action.payload);
  console.log('State before:', state);
  
  const newState = /* ... */;
  
  console.log('State after:', newState);
  return newState;
}
```

### Check Validation Errors

```typescript
const { errors, touched } = useFormContext();
console.log('Errors:', errors);
console.log('Touched:', touched);
```

### Inspect Normalized State

```typescript
const { values, arrayMetadata } = useFormContext();
console.log('Normalized values:', values);
console.log('Array metadata:', arrayMetadata);
```

---

## 📊 Performance Metrics

| Operation | Before (Nested) | After (Normalized) | Improvement |
|-----------|----------------|-------------------|-------------|
| Add array item | O(n) | O(1) | 80-90% |
| Remove array item | O(n) | O(1) | 85-90% |
| Update field | O(n) | O(1) | 80-90% |
| Move array item | O(n) | O(n) | 30-40% |

**Scaling:**
- 10 items: ~85% faster
- 100 items: ~95% faster
- 1000 items: ~99% faster

---

## 🔗 Related Documentation

- **Getting Started:** `README.md`
- **Performance Details:** `STATE_NORMALIZATION_SUMMARY.md`
- **Complete Guide:** `DEVELOPER_WALKTHROUGH.md`
- **Code Reading Order:** `README.md` (section 4)

---

## 💡 Quick Answers

**Q: How do I add validation?**  
A: Add rules to `schemas/patientFormSchema.ts` using Yup

**Q: How do I make a field conditional?**  
A: Use `showWhen` prop on `Form.Field`

**Q: How do I handle arrays?**  
A: Use `Form.FieldArray` with render prop pattern

**Q: How do I access form state?**  
A: Use `useFormContext()` hook in any child component

**Q: How do I reset the form?**  
A: Call `resetForm()` from `useFormContext()`

**Q: How do I submit programmatically?**  
A: Call `handleSubmit()` from `useFormContext()`

**Q: How do I add custom validation?**  
A: Use Yup's `.test()` method in schema

**Q: How do I style components?**  
A: Pass `className` prop to any component

---

## 🎯 Next Steps

1. **Read:** `README.md` for overview
2. **Study:** `DEVELOPER_WALKTHROUGH.md` for deep dive
3. **Experiment:** Modify `page.tsx` to try features
4. **Debug:** Use `StateDebugPanel` to inspect state
5. **Extend:** Add new field types or validation rules

---

**Last Updated:** 2025-10-31  
**Version:** 1.0.0  
**Maintainer:** Development Team

