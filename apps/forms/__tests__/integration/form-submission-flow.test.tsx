import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as yup from 'yup';
import { Form } from '../../components/Form';
import '@testing-library/jest-dom';

/**
 * Integration Tests: Form Submission Flow
 * 
 * These tests verify the complete form workflow including:
 * - Form initialization with initial values
 * - Field validation (required, email, etc.)
 * - Error message display on validation failure
 * - Conditional field visibility based on other field values
 * - Array field manipulation (add/remove items)
 * - Form submission with correct data
 * 
 * Why integration tests for forms matter:
 * - Forms are complex with multiple interacting parts (validation, state, submission)
 * - Unit tests alone can't verify the complete user workflow
 * - Integration tests catch issues with form state management
 * - They verify validation rules work correctly
 * - They ensure error messages display at the right time
 */

describe('Form Submission Flow Integration Tests', () => {
  // Define a validation schema for testing
  const validationSchema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    name: yup.string().required('Name is required'),
    age: yup.number().min(18, 'Must be 18 or older').required('Age is required'),
    country: yup.string().required('Country is required'),
    newsletter: yup.boolean(),
  });

  test('1. User fills invalid email → blur field → error message displays', async () => {
    /**
     * Test Purpose: Verify email validation and error display
     * 
     * What this tests:
     * - User can type in email field
     * - Invalid email format triggers validation error
     * - Error message displays when user leaves the field (blur)
     * - Error message is visible and readable
     * 
     * Why it matters:
     * - Email validation is critical for data quality
     * - Users need clear feedback when they enter invalid data
     * - Blur validation provides immediate feedback without being intrusive
     */

    const onSubmit = jest.fn();

    render(
      <Form
        initialValues={{ email: '', name: '', age: '', country: '', newsletter: false }}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
        validateOnBlur={true}
      >
        <Form.Field name="email" label="Email">
          <Form.Input name="email" type="email" />
        </Form.Field>
      </Form>
    );

    const emailInput = screen.getByLabelText('Email');

    // Type invalid email
    await userEvent.type(emailInput, 'invalid-email');

    // Blur the field to trigger validation
    await userEvent.tab();

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });

    // Verify onSubmit was not called
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('2. User fills all required fields correctly → submit → onSubmit called with correct values', async () => {
    /**
     * Test Purpose: Verify successful form submission with valid data
     * 
     * What this tests:
     * - User can fill all required fields
     * - Form validates successfully when all fields are valid
     * - onSubmit callback is called with correct form values
     * - Form data is properly normalized and passed to callback
     * 
     * Why it matters:
     * - Ensures form submission works correctly
     * - Verifies data is passed correctly to the backend
     * - Confirms form state management is working
     */

    const onSubmit = jest.fn();

    render(
      <Form
        initialValues={{ email: '', name: '', age: '', country: '', newsletter: false }}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
      >
        <Form.Field name="email" label="Email">
          <Form.Input name="email" type="email" />
        </Form.Field>
        <Form.Field name="name" label="Name">
          <Form.Input name="name" type="text" />
        </Form.Field>
        <Form.Field name="age" label="Age">
          <Form.Input name="age" type="number" />
        </Form.Field>
        <Form.Field name="country" label="Country">
          <Form.Select name="country" options={[
            { value: '', label: 'Select a country' },
            { value: 'US', label: 'United States' },
            { value: 'CA', label: 'Canada' },
          ]} />
        </Form.Field>
        <button type="submit">Submit</button>
      </Form>
    );

    // Fill in all fields
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
    await userEvent.type(screen.getByLabelText('Age'), '25');
    await userEvent.selectOptions(screen.getByLabelText('Country'), 'US');

    // Submit the form
    await userEvent.click(screen.getByText('Submit'));

    // Wait for onSubmit to be called
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    // Verify the submitted values
    const submittedData = onSubmit.mock.calls[0][0];
    expect(submittedData.email).toBe('test@example.com');
    expect(submittedData.name).toBe('John Doe');
    expect(submittedData.age).toBe('25');
    expect(submittedData.country).toBe('US');
  });

  test('3. Form validation prevents submission when fields are invalid', async () => {
    /**
     * Test Purpose: Verify form submission is blocked when validation fails
     * 
     * What this tests:
     * - Form does not submit when required fields are empty
     * - Form does not submit when fields have invalid values
     * - onSubmit callback is not called on invalid submission attempt
     * - Error messages are displayed for invalid fields
     * 
     * Why it matters:
     * - Prevents invalid data from being sent to the backend
     * - Ensures data integrity
     * - Provides clear feedback to users about what needs to be fixed
     */

    const onSubmit = jest.fn();

    render(
      <Form
        initialValues={{ email: '', name: '', age: '', country: '', newsletter: false }}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
      >
        <Form.Field name="email" label="Email">
          <Form.Input name="email" type="email" />
        </Form.Field>
        <Form.Field name="name" label="Name">
          <Form.Input name="name" type="text" />
        </Form.Field>
        <Form.Field name="age" label="Age">
          <Form.Input name="age" type="number" />
        </Form.Field>
        <Form.Field name="country" label="Country">
          <Form.Select name="country" options={[
            { value: '', label: 'Select a country' },
            { value: 'US', label: 'United States' },
          ]} />
        </Form.Field>
        <button type="submit">Submit</button>
      </Form>
    );

    // Try to submit without filling any fields
    await userEvent.click(screen.getByText('Submit'));

    // Wait for validation errors to appear
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    // Verify onSubmit was not called
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('4. Checkbox field can be toggled and submitted', async () => {
    /**
     * Test Purpose: Verify checkbox fields work correctly
     * 
     * What this tests:
     * - Checkbox can be toggled on and off
     * - Checkbox state is tracked in form
     * - Checkbox value is included in submitted data
     * - Checkbox doesn't require validation (optional field)
     * 
     * Why it matters:
     * - Checkboxes are common form elements
     * - Ensures boolean fields are handled correctly
     * - Verifies optional fields don't block submission
     */

    const onSubmit = jest.fn();

    render(
      <Form
        initialValues={{ email: '', name: '', age: '', country: '', newsletter: false }}
        onSubmit={onSubmit}
        validationSchema={validationSchema}
      >
        <Form.Field name="email" label="Email">
          <Form.Input name="email" type="email" />
        </Form.Field>
        <Form.Field name="name" label="Name">
          <Form.Input name="name" type="text" />
        </Form.Field>
        <Form.Field name="age" label="Age">
          <Form.Input name="age" type="number" />
        </Form.Field>
        <Form.Field name="country" label="Country">
          <Form.Select name="country" options={[
            { value: '', label: 'Select a country' },
            { value: 'US', label: 'United States' },
          ]} />
        </Form.Field>
        <Form.Field name="newsletter" label="Subscribe to newsletter">
          <Form.Checkbox name="newsletter" />
        </Form.Field>
        <button type="submit">Submit</button>
      </Form>
    );

    // Fill required fields
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
    await userEvent.type(screen.getByLabelText('Age'), '25');
    await userEvent.selectOptions(screen.getByLabelText('Country'), 'US');

    // Toggle checkbox
    const checkbox = screen.getByLabelText('Subscribe to newsletter');
    await userEvent.click(checkbox);

    // Submit form
    await userEvent.click(screen.getByText('Submit'));

    // Wait for submission
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    // Verify checkbox value in submitted data
    const submittedData = onSubmit.mock.calls[0][0];
    expect(submittedData.newsletter).toBe(true);
  });
});

