# Custom Form System - Compound Component Pattern

This directory contains a custom form implementation built from scratch using the **compound component pattern** with Yup validation and conditional field rendering.

## 🎯 Features

- ✅ **Compound Component Pattern**: Form components that work together seamlessly
- ✅ **Yup Schema Validation**: Declarative validation with clear error messages
- ✅ **Conditional Fields**: Show/hide fields based on other field values
- ✅ **Real-time Validation**: Validate on change and on blur
- ✅ **Type Safety**: Full TypeScript support
- ✅ **No External Form Libraries**: Built from scratch without react-hook-form or Formik

## 📖 Code Reading Guide - Start Here!

If you're learning the compound component pattern or want to understand this codebase, **follow this reading order**:

### Step 1: Understand the Types (5 minutes)
**File**: `types/index.ts`

**Why first?** Understanding the data structures and interfaces gives you the mental model for everything else.

**What to focus on:**
- `FormValues`: The shape of form data (key-value pairs)
- `FormErrors`: How errors are stored (field name → error message)
- `FormContextValue`: The complete API that components share (this is the "contract")
- Component prop types: What each component expects

**Key insight**: The `FormContextValue` interface is the heart of the compound component pattern - it defines everything that gets shared between components.

---

### Step 2: See the Pattern in Action (10 minutes)
**File**: `page.tsx`

**Why second?** Seeing how the components are *used* before diving into implementation makes the code easier to understand.

**What to focus on:**
- How `<Form>` wraps everything and provides `initialValues`, `onSubmit`, and `validationSchema`
- How `<Form.Field>` wraps inputs and handles labels/errors
- How `<Form.Input>`, `<Form.Select>`, etc. are nested inside `<Form.Field>`
- The `showWhen` prop for conditional fields (lines ~250-260)
- How simple the API is - no prop drilling, no manual state management

**Key insight**: Notice how you never pass `values`, `errors`, or `setFieldValue` as props - they're automatically available via context!

---

### Step 3: Understand the State Management (15 minutes)
**File**: `components/FormContext.tsx`

**Why third?** Now that you've seen the types and usage, you can understand how the state is managed and shared.

**What to focus on:**
- **Lines 1-40**: The Context creation and custom hook pattern
- **Lines 70-120**: State initialization (values, errors, touched, isSubmitting)
- **Lines 123-230**: The core methods:
  - `validateField`: How a single field is validated
  - `setFieldValue`: How field values are updated (and validated on change)
  - `setFieldTouched`: How we track which fields the user has interacted with
- **Lines 232-280**: `validateForm` and `handleSubmit` - the form submission flow
- **Lines 330-370**: `isFieldVisible` - how conditional fields work

**Key insight**: The `useCallback` hooks prevent unnecessary re-renders. The `setTimeout` in validation ensures state updates complete before validation runs.

---

### Step 4: See How Components Connect to Context (15 minutes)
**File**: `components/Form.tsx`

**Why fourth?** Now you understand the context, so you can see how individual components consume it.

**What to focus on:**
- **Lines 1-50**: The `FormRoot` component that provides the context
- **Lines 130-185**: `FormField` - how labels, errors, and conditional visibility work together
- **Lines 187-252**: `FormInput` - the simplest example of a connected component:
  - Gets `values`, `errors`, `touched` from context
  - Calls `setFieldValue` on change
  - Calls `setFieldTouched` on blur
- **Lines 254-321**: `FormSelect` - same pattern, different HTML element
- **Lines 490-519**: The compound component export - how `Form.Field`, `Form.Input`, etc. are created

**Key insight**: Every input component follows the same pattern:
1. Get state from `useFormContext()`
2. Render with current value
3. Call `setFieldValue` on change
4. Call `setFieldTouched` on blur

---

### Step 5: Understand the Validation Schema (10 minutes)
**File**: `schemas/patientFormSchema.ts`

**Why last?** You now understand how validation is triggered and errors are displayed, so you can see how the rules are defined.

**What to focus on:**
- Basic validation: `required()`, `min()`, `max()`, `email()`
- Conditional validation: The `when()` method (lines ~80-100)
- How error messages are customized
- How the schema structure mirrors the form structure

**Key insight**: Yup's `when()` method enables conditional validation - a field can be required only when another field has a specific value.

---

## 🎓 Learning Path Summary

```
1. types/index.ts          → Learn the data structures
2. page.tsx                → See the pattern in action
3. FormContext.tsx         → Understand state management
4. Form.tsx                → See how components connect
5. patientFormSchema.ts    → Understand validation rules
```

**Total reading time**: ~55 minutes for deep understanding

**Quick overview**: Read just the comments in each file (~15 minutes)

---

## 🔗 How the Files Connect

```
page.tsx
  └─ Uses <Form> component
       └─ Form.tsx (FormRoot)
            └─ Provides FormContext
                 └─ FormContext.tsx
                      ├─ Manages state (values, errors, touched)
                      ├─ Validates using patientFormSchema.ts
                      └─ Shares state with all child components
                           └─ Form.Field, Form.Input, Form.Select, etc.
                                └─ Use useFormContext() to access state
```

---

## 📁 File Structure

```
app/c-form/
├── components/
│   ├── FormContext.tsx      # React Context for form state management
│   └── Form.tsx              # Compound components (Form, Form.Field, Form.Input, etc.)
├── schemas/
│   └── patientFormSchema.ts  # Yup validation schema
├── types/
│   └── index.ts              # TypeScript type definitions
├── page.tsx                  # Main form page (patient intake form)
└── README.md                 # This file
```

## 🏗️ Architecture

### Compound Component Pattern

The form system uses the compound component pattern where a parent component (`Form`) shares state with child components (`Form.Field`, `Form.Input`, etc.) via React Context.

**Benefits:**
- Clean, intuitive API
- Automatic state sharing between components
- No prop drilling
- Flexible composition

**Usage Example:**
```tsx
<Form initialValues={...} onSubmit={...} validationSchema={schema}>
  <Form.Field name="email" label="Email" required>
    <Form.Input name="email" type="email" />
  </Form.Field>
</Form>
```

### Components

#### 1. **Form** (Parent Component)
- Wraps all form fields
- Provides form context to children
- Handles form submission
- Manages validation

#### 2. **Form.Field** (Field Wrapper)
- Displays field label
- Shows validation errors
- Handles conditional visibility
- Shows required indicator (*)

#### 3. **Form.Input** (Text Input)
- Standard text input
- Supports: text, email, password, number, tel, date
- Auto-connects to form context

#### 4. **Form.Select** (Dropdown)
- Dropdown select with options
- Supports placeholder

#### 5. **Form.Textarea** (Multi-line Text)
- Multi-line text input
- Configurable rows

#### 6. **Form.Checkbox** (Checkbox)
- Boolean input (true/false)
- Includes own label

#### 7. **Form.RadioGroup** (Radio Buttons)
- Select one option from multiple choices
- Grouped radio buttons

## 🔍 Key Concepts

### 1. Form Context

The `FormContext` provides shared state to all form components:

```typescript
type FormContextValue = {
  values: FormValues;              // Current field values
  errors: FormErrors;              // Validation errors
  touched: FormTouched;            // Which fields have been touched
  isSubmitting: boolean;           // Is form submitting?
  setFieldValue: (name, value) => void;
  setFieldTouched: (name, touched) => void;
  validateField: (name) => Promise<void>;
  validateForm: () => Promise<boolean>;
  handleSubmit: (e) => void;
  resetForm: () => void;
  isFieldVisible: (rules) => boolean;
};
```

### 2. Validation with Yup

Validation is handled by Yup schemas:

```typescript
const schema = yup.object().shape({
  email: yup.string()
    .required('Email is required')
    .email('Invalid email format'),
  
  age: yup.number()
    .required('Age is required')
    .min(18, 'Must be 18 or older'),
});
```

### 3. Conditional Fields

Fields can be shown/hidden based on other field values:

```tsx
<Form.Field 
  name="allergies" 
  label="Allergy Details"
  showWhen={[{ field: 'hasAllergies', value: true }]}
>
  <Form.Textarea name="allergies" />
</Form.Field>
```

**Conditional Rule Types:**
- `equals`: Field value must equal specified value
- `notEquals`: Field value must not equal specified value
- `includes`: Field value (array) must include specified value

### 4. Validation Timing

- **validateOnChange**: Validate as user types (default: true)
- **validateOnBlur**: Validate when user leaves field (default: true)
- **On Submit**: Always validates entire form before submission

### 5. Error Display

Errors are only shown for **touched** fields to avoid overwhelming users:

```typescript
// Field is "touched" when user has interacted with it (focused and blurred)
const error = touched[name] ? errors[name] : undefined;
```

## 🎨 Styling

The form uses Tailwind CSS for styling:
- Clean, modern design
- Responsive layout
- Error states (red borders)
- Focus states (blue ring)
- Disabled states (gray background)

## 🚀 Usage

### Basic Form

```tsx
import { Form } from './components/Form';
import * as yup from 'yup';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email().required('Email is required'),
});

function MyForm() {
  const initialValues = { name: '', email: '' };
  
  const handleSubmit = (values) => {
    console.log('Form submitted:', values);
  };
  
  return (
    <Form 
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={schema}
    >
      <Form.Field name="name" label="Name" required>
        <Form.Input name="name" type="text" />
      </Form.Field>
      
      <Form.Field name="email" label="Email" required>
        <Form.Input name="email" type="email" />
      </Form.Field>
      
      <button type="submit">Submit</button>
    </Form>
  );
}
```

### Conditional Fields

```tsx
<Form.Checkbox name="hasInsurance" label="I have insurance" />

<Form.Field 
  name="insuranceProvider" 
  label="Insurance Provider"
  showWhen={[{ field: 'hasInsurance', value: true }]}
>
  <Form.Input name="insuranceProvider" type="text" />
</Form.Field>
```

## 📝 Patient Intake Form Example

The main page (`page.tsx`) demonstrates a comprehensive patient intake form with:

1. **Personal Information**: Name, DOB, Gender
2. **Contact Information**: Email, Phone, Address
3. **Medical Information**: Blood Type, Allergies, Chronic Conditions
4. **Insurance Information**: Provider, Policy Number (conditional)
5. **Emergency Contact**: Name, Phone, Relationship

**Conditional Fields:**
- Allergy details (shown when "I have allergies" is checked)
- Chronic condition details (shown when "I have chronic conditions" is checked)
- Insurance details (shown when "I have insurance" is checked)

## 🧪 Testing

To test the form:

1. Navigate to `/c-form` in your browser
2. Try submitting without filling fields (see validation errors)
3. Fill in fields and watch errors disappear
4. Toggle checkboxes to see conditional fields appear/disappear
5. Submit valid form and check console for logged data

## 🎓 Learning Resources

This implementation serves as a learning resource for:

- **Compound Component Pattern**: How to build flexible, composable components
- **React Context**: Sharing state without prop drilling
- **Form State Management**: Handling values, errors, touched state
- **Validation**: Integrating Yup with custom forms
- **Conditional Rendering**: Dynamic form fields
- **TypeScript**: Type-safe form systems

## 🔧 Customization

### Adding New Input Types

To add a new input type (e.g., `Form.DatePicker`):

1. Define props type in `types/index.ts`
2. Create component in `Form.tsx`
3. Connect to form context using `useFormContext()`
4. Add to compound component export

### Custom Validation

You can add custom validation logic:

```typescript
const schema = yup.object().shape({
  password: yup.string()
    .required('Password is required')
    .test('strong-password', 'Password must be strong', (value) => {
      // Custom validation logic
      return /[A-Z]/.test(value) && /[0-9]/.test(value);
    }),
});
```

## 📊 Performance

- **Minimal Re-renders**: Uses `useCallback` and `useMemo` where appropriate
- **Efficient Validation**: Only validates changed fields (when validateOnChange is true)
- **Lazy Error Display**: Only shows errors for touched fields
- **Optimized Context**: Context value is memoized to prevent unnecessary re-renders

## 🎯 Best Practices

1. **Always provide initialValues**: Even if empty, define all fields
2. **Use meaningful field names**: Match schema keys exactly
3. **Mark required fields**: Use `required` prop on Form.Field
4. **Provide clear error messages**: Write user-friendly validation messages
5. **Test conditional logic**: Ensure conditional fields work as expected

## 🚫 Limitations

- No built-in async validation (can be added)
- No field-level validation schemas (validates entire form)
- No built-in file upload support (can be added)
- No built-in array/dynamic field support (can be added)

## 📚 Further Reading

- [Compound Component Pattern](https://kentcdodds.com/blog/compound-components-with-react-hooks)
- [React Context](https://react.dev/learn/passing-data-deeply-with-context)
- [Yup Validation](https://github.com/jquense/yup)
- [Form Best Practices](https://www.smashingmagazine.com/2018/08/best-practices-for-mobile-form-design/)

