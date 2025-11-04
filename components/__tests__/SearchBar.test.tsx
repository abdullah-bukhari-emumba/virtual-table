// ============================================================================
// SEARCH BAR COMPONENT - UNIT TESTS
// ============================================================================
// Tests for the SearchBar component
//
// WHAT IS COMPONENT TESTING?
// Component testing verifies that a React component renders correctly and
// responds to user interactions as expected. We test what users see and do,
// not how the component works internally.
//
// REACT TESTING LIBRARY PHILOSOPHY:
// "The more your tests resemble the way your software is used, the more
// confidence they can give you."
//
// This means we:
// 1. Render the component like React would
// 2. Find elements like a user would (by labels, text, roles)
// 3. Interact like a user would (typing, clicking)
// 4. Assert what a user would see (text, values, visibility)
//
// KEY CONCEPTS:
// - render(): Renders a component into a virtual DOM for testing
// - screen: Object with queries to find elements (getByRole, getByText, etc.)
// - userEvent: Simulates user interactions (typing, clicking, etc.)
// - expect(): Makes assertions about what should be true
// ============================================================================

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SearchBar } from '../SearchBar';

// ============================================================================
// TEST SUITE: SearchBar Component
// ============================================================================
describe('SearchBar', () => {
  
  // ==========================================================================
  // TEST 1: Renders with Default Placeholder
  // ==========================================================================
  // WHAT THIS TESTS: Component renders with default placeholder text
  // WHY IT MATTERS: Users need to know what the search box is for
  // HOW IT WORKS:
  // 1. Render the component
  // 2. Find the input element
  // 3. Verify it has the default placeholder
  it('should render with default placeholder', () => {
    // ARRANGE: Create a mock onChange function
    // jest.fn() creates a "spy" function that tracks how it's called
    const mockOnChange = jest.fn();
    
    // ACT: Render the component
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    // ASSERT: Find the input and check its placeholder
    // getByRole finds elements by their ARIA role (accessibility)
    // This is the preferred way to find elements in React Testing Library
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Search...');
  });

  // ==========================================================================
  // TEST 2: Renders with Custom Placeholder
  // ==========================================================================
  // WHAT THIS TESTS: Component accepts custom placeholder text
  // WHY IT MATTERS: Different contexts need different placeholder text
  it('should render with custom placeholder', () => {
    // ARRANGE
    const mockOnChange = jest.fn();
    const customPlaceholder = 'Search by name or MRN...';
    
    // ACT: Render with custom placeholder
    render(
      <SearchBar 
        value="" 
        onChange={mockOnChange} 
        placeholder={customPlaceholder}
      />
    );
    
    // ASSERT
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', customPlaceholder);
  });

  // ==========================================================================
  // TEST 3: Displays Current Value
  // ==========================================================================
  // WHAT THIS TESTS: Component displays the current search value
  // WHY IT MATTERS: Users need to see what they've typed
  it('should display the current value', () => {
    // ARRANGE
    const mockOnChange = jest.fn();
    const currentValue = 'John Doe';
    
    // ACT: Render with a value
    render(<SearchBar value={currentValue} onChange={mockOnChange} />);
    
    // ASSERT: Input should show the value
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe(currentValue);
  });

  // ==========================================================================
  // TEST 4: Calls onChange When User Types
  // ==========================================================================
  // WHAT THIS TESTS: Component calls onChange callback when user types
  // WHY IT MATTERS: Parent component needs to know when search changes
  // HOW IT WORKS:
  // 1. Render the component
  // 2. Simulate user typing
  // 3. Verify onChange was called with the new value
  it('should call onChange when user types', async () => {
    // ARRANGE
    const mockOnChange = jest.fn();
    
    // Create a user event instance
    // This simulates real user interactions more accurately than fireEvent
    const user = userEvent.setup();
    
    // ACT: Render the component
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    // Find the input
    const input = screen.getByRole('textbox');
    
    // ACT: Simulate user typing
    // type() simulates typing character by character
    await user.type(input, 'Smith');
    
    // ASSERT: onChange should be called for each character
    // When typing "Smith", onChange is called 5 times (S, m, i, t, h)
    expect(mockOnChange).toHaveBeenCalledTimes(5);

    // Verify each character was passed individually
    expect(mockOnChange).toHaveBeenNthCalledWith(1, 'S');
    expect(mockOnChange).toHaveBeenNthCalledWith(2, 'm');
    expect(mockOnChange).toHaveBeenNthCalledWith(3, 'i');
    expect(mockOnChange).toHaveBeenNthCalledWith(4, 't');
    expect(mockOnChange).toHaveBeenNthCalledWith(5, 'h');
  });

  // ==========================================================================
  // TEST 5: Calls onChange with Each Character
  // ==========================================================================
  // WHAT THIS TESTS: onChange is called for each keystroke
  // WHY IT MATTERS: Ensures real-time search updates
  it('should call onChange for each character typed', async () => {
    // ARRANGE
    const mockOnChange = jest.fn();
    const user = userEvent.setup();
    
    // ACT
    render(<SearchBar value="" onChange={mockOnChange} />);
    const input = screen.getByRole('textbox');
    
    // Type one character at a time
    await user.type(input, 'abc');
    
    // ASSERT: Verify onChange was called with each character
    expect(mockOnChange).toHaveBeenCalledTimes(3);
    expect(mockOnChange).toHaveBeenNthCalledWith(1, 'a');
    expect(mockOnChange).toHaveBeenNthCalledWith(2, 'b');
    expect(mockOnChange).toHaveBeenNthCalledWith(3, 'c');
  });

  // ==========================================================================
  // TEST 6: Clears Value When User Deletes
  // ==========================================================================
  // WHAT THIS TESTS: Component handles deletion correctly
  // WHY IT MATTERS: Users need to be able to clear their search
  it('should handle clearing the input', async () => {
    // ARRANGE
    const mockOnChange = jest.fn();
    const user = userEvent.setup();
    
    // ACT: Render with initial value
    render(<SearchBar value="test" onChange={mockOnChange} />);
    const input = screen.getByRole('textbox');
    
    // ACT: Clear the input
    // clear() simulates selecting all text and deleting it
    await user.clear(input);
    
    // ASSERT: onChange should be called with empty string
    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  // ==========================================================================
  // TEST 7: Has Accessible Label
  // ==========================================================================
  // WHAT THIS TESTS: Component has proper accessibility attributes
  // WHY IT MATTERS: Screen readers need labels to describe inputs
  // HOW IT WORKS: Verify aria-label attribute is present
  it('should have accessible label', () => {
    // ARRANGE
    const mockOnChange = jest.fn();
    
    // ACT
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    // ASSERT: Input should have aria-label
    // This helps screen readers announce what the input is for
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-label', 'Search');
  });

  // ==========================================================================
  // TEST 8: Applies Custom ClassName
  // ==========================================================================
  // WHAT THIS TESTS: Component accepts custom CSS classes
  // WHY IT MATTERS: Allows styling customization
  it('should apply custom className', () => {
    // ARRANGE
    const mockOnChange = jest.fn();
    const customClass = 'my-custom-class';
    
    // ACT
    render(
      <SearchBar 
        value="" 
        onChange={mockOnChange} 
        className={customClass}
      />
    );
    
    // ASSERT: Container div should have the custom class
    const container = screen.getByRole('textbox').parentElement;
    expect(container).toHaveClass(customClass);
  });

  // ==========================================================================
  // TEST 9: Input Type is Text
  // ==========================================================================
  // WHAT THIS TESTS: Input has correct type attribute
  // WHY IT MATTERS: Ensures proper keyboard and mobile behavior
  it('should have type="text"', () => {
    // ARRANGE
    const mockOnChange = jest.fn();
    
    // ACT
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    // ASSERT
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'text');
  });

  // ==========================================================================
  // TEST 10: Handles Empty String Value
  // ==========================================================================
  // WHAT THIS TESTS: Component handles empty value correctly
  // WHY IT MATTERS: Initial state is often empty
  it('should handle empty string value', () => {
    // ARRANGE
    const mockOnChange = jest.fn();
    
    // ACT
    render(<SearchBar value="" onChange={mockOnChange} />);
    
    // ASSERT
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  // ==========================================================================
  // TEST 11: Handles Special Characters
  // ==========================================================================
  // WHAT THIS TESTS: Component handles special characters in search
  // WHY IT MATTERS: Users might search for names with special characters
  it('should handle special characters', async () => {
    // ARRANGE
    const mockOnChange = jest.fn();
    const user = userEvent.setup();
    
    // ACT
    render(<SearchBar value="" onChange={mockOnChange} />);
    const input = screen.getByRole('textbox');
    
    // Type special characters
    await user.type(input, "O'Brien");

    // ASSERT: Should be called 7 times (O, ', B, r, i, e, n)
    expect(mockOnChange).toHaveBeenCalledTimes(7);
    expect(mockOnChange).toHaveBeenNthCalledWith(7, 'n');
  });

  // ==========================================================================
  // TEST 12: Handles Numbers in Search
  // ==========================================================================
  // WHAT THIS TESTS: Component handles numeric input (like MRN numbers)
  // WHY IT MATTERS: Users search by medical record numbers
  it('should handle numeric input', async () => {
    // ARRANGE
    const mockOnChange = jest.fn();
    const user = userEvent.setup();
    
    // ACT
    render(<SearchBar value="" onChange={mockOnChange} />);
    const input = screen.getByRole('textbox');
    
    // Type numbers
    await user.type(input, '12345');

    // ASSERT: Should be called 5 times (1, 2, 3, 4, 5)
    expect(mockOnChange).toHaveBeenCalledTimes(5);
    expect(mockOnChange).toHaveBeenNthCalledWith(5, '5');
  });
});

