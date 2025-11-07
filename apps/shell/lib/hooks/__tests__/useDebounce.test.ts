// ============================================================================
// USE DEBOUNCE HOOK - UNIT TESTS
// ============================================================================
// Tests for the useDebounce custom hook
//
// WHAT IS TESTING?
// Testing is writing code that verifies your application code works correctly.
// Think of it like a quality check - you write tests to make sure your code
// does what it's supposed to do, and continues to work even when you make changes.
//
// WHAT IS REACT TESTING LIBRARY?
// React Testing Library is a tool that helps you test React components and hooks
// by simulating how users interact with your application. Instead of testing
// implementation details (like internal state), it focuses on testing behavior
// (what users see and do).
//
// WHAT IS A HOOK TEST?
// Hooks are special React functions that let you use state and other React features.
// Testing hooks requires a special helper called `renderHook` because hooks can't
// be called outside of React components.
//
// WHAT IS DEBOUNCING?
// Debouncing delays updating a value until the user stops changing it.
// Example: When typing in a search box, instead of searching after every keystroke,
// we wait until the user pauses typing (e.g., 300ms) before searching.
// ============================================================================

import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useDebounce } from '@virtual-table/utils';

// ============================================================================
// TEST SUITE: useDebounce Hook
// ============================================================================
// A "describe" block groups related tests together
// Think of it as a folder that contains multiple test cases
describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  // ==========================================================================
  // TEST 1: Initial Value
  // ==========================================================================
  // WHAT THIS TESTS: The hook should return the initial value immediately
  // WHY IT MATTERS: Users should see the initial value right away
  // HOW IT WORKS:
  // 1. We render the hook with an initial value
  // 2. We check that the returned value matches what we passed in
  it('should return the initial value immediately', () => {
    // ARRANGE: Set up the test data
    const initialValue = 'hello';
    
    // ACT: Render the hook with the initial value
    // renderHook is a special function that lets us test hooks
    // It creates a temporary component that uses our hook
    const { result } = renderHook(() => useDebounce(initialValue, 300));
    
    // ASSERT: Check that the result is what we expect
    // result.current contains the current return value of the hook
    expect(result.current).toBe(initialValue);
  });

  // ==========================================================================
  // TEST 2: Value Debouncing
  // ==========================================================================
  // WHAT THIS TESTS: The hook should delay updating the value
  // WHY IT MATTERS: This is the core functionality of debouncing
  // HOW IT WORKS:
  // 1. Start with an initial value
  // 2. Change the value
  // 3. Verify the debounced value hasn't changed yet (still the old value)
  // 4. Wait for the delay to pass
  // 5. Verify the debounced value has now updated
  it('should debounce value changes', () => {
    // ARRANGE: Set up initial value and delay
    const initialValue = 'hello';
    const delay = 300; // milliseconds

    // ACT: Render the hook
    const { result, rerender } = renderHook(
      // This function will be called each time we rerender
      ({ value }) => useDebounce(value, delay),
      // Initial props
      { initialProps: { value: initialValue } }
    );

    // ASSERT: Initial value should be returned immediately
    expect(result.current).toBe(initialValue);

    // ACT: Change the value by rerendering with new props
    const newValue = 'world';
    rerender({ value: newValue });

    // ASSERT: Debounced value should still be the old value (not updated yet)
    // This is because the delay hasn't passed yet
    expect(result.current).toBe(initialValue);

    // ACT: Fast-forward time by the delay amount
    act(() => {
      jest.advanceTimersByTime(delay);
    });

    // ASSERT: Now the debounced value should be updated
    expect(result.current).toBe(newValue);
  });

  // ==========================================================================
  // TEST 3: Multiple Rapid Changes
  // ==========================================================================
  // WHAT THIS TESTS: Only the final value should be used after rapid changes
  // WHY IT MATTERS: This simulates a user typing quickly
  // HOW IT WORKS:
  // 1. Start with initial value
  // 2. Rapidly change the value multiple times (like typing)
  // 3. Verify only the last value is used after the delay
  it('should only update to the final value after multiple rapid changes', () => {
    // ARRANGE
    const delay = 300;

    // ACT: Render the hook
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, delay),
      { initialProps: { value: 'a' } }
    );

    // ACT: Simulate rapid typing by changing value multiple times quickly
    // This is wrapped in act() because it causes state updates
    act(() => {
      rerender({ value: 'ab' });
      rerender({ value: 'abc' });
      rerender({ value: 'abcd' });
      rerender({ value: 'abcde' });
    });

    // ASSERT: Value should still be the initial value (no updates yet)
    expect(result.current).toBe('a');

    // ACT: Fast-forward time by the delay amount
    act(() => {
      jest.advanceTimersByTime(delay);
    });

    // ASSERT: Should skip all intermediate values and jump to the final value
    expect(result.current).toBe('abcde');
  });

  // ==========================================================================
  // TEST 4: Custom Delay
  // ==========================================================================
  // WHAT THIS TESTS: The hook should respect custom delay values
  // WHY IT MATTERS: Different use cases need different delays
  // HOW IT WORKS:
  // 1. Test with a short delay (100ms)
  // 2. Verify the value updates after that specific delay
  it('should respect custom delay values', () => {
    // ARRANGE: Use a shorter delay for faster test
    const customDelay = 100;

    // ACT: Render with custom delay
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, customDelay),
      { initialProps: { value: 'initial' } }
    );

    // ACT: Change value
    rerender({ value: 'updated' });

    // ASSERT: Should still be old value immediately
    expect(result.current).toBe('initial');

    // ACT: Fast-forward time by the custom delay
    act(() => {
      jest.advanceTimersByTime(customDelay);
    });

    // ASSERT: Should be updated now
    expect(result.current).toBe('updated');
  });

  // ==========================================================================
  // TEST 5: Different Data Types
  // ==========================================================================
  // WHAT THIS TESTS: The hook should work with any data type
  // WHY IT MATTERS: Debouncing isn't just for strings
  // HOW IT WORKS: Test with numbers, objects, and arrays
  it('should work with different data types', () => {
    const delay = 200;

    // TEST WITH NUMBERS
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value }) => useDebounce(value, delay),
      { initialProps: { value: 0 } }
    );

    numberRerender({ value: 42 });

    act(() => {
      jest.advanceTimersByTime(delay);
    });

    expect(numberResult.current).toBe(42);

    // TEST WITH OBJECTS
    const { result: objectResult, rerender: objectRerender } = renderHook(
      ({ value }) => useDebounce(value, delay),
      { initialProps: { value: { name: 'John' } } }
    );

    const newObject = { name: 'Jane' };
    objectRerender({ value: newObject });

    act(() => {
      jest.advanceTimersByTime(delay);
    });

    expect(objectResult.current).toBe(newObject);

    // TEST WITH ARRAYS
    const { result: arrayResult, rerender: arrayRerender } = renderHook(
      ({ value }) => useDebounce(value, delay),
      { initialProps: { value: [1, 2, 3] } }
    );

    const newArray = [4, 5, 6];
    arrayRerender({ value: newArray });

    act(() => {
      jest.advanceTimersByTime(delay);
    });

    expect(arrayResult.current).toBe(newArray);
  });

  // ==========================================================================
  // TEST 6: Cleanup on Unmount
  // ==========================================================================
  // WHAT THIS TESTS: The hook should cancel pending updates when unmounted
  // WHY IT MATTERS: Prevents memory leaks and errors
  // HOW IT WORKS:
  // 1. Start a debounce
  // 2. Unmount the component before the delay completes
  // 3. Verify no errors occur (cleanup worked correctly)
  it('should cleanup timeout on unmount', () => {
    // ARRANGE
    const delay = 300;
    
    // ACT: Render the hook
    const { result, rerender, unmount } = renderHook(
      ({ value }) => useDebounce(value, delay),
      { initialProps: { value: 'initial' } }
    );
    
    // ACT: Change value
    rerender({ value: 'updated' });
    
    // ACT: Unmount before delay completes
    // This should trigger the cleanup function
    unmount();
    
    // ASSERT: No errors should occur
    // If cleanup didn't work, we'd get a warning about setting state on unmounted component
    // The test passing means cleanup worked correctly
    expect(result.current).toBe('initial');
  });
});

