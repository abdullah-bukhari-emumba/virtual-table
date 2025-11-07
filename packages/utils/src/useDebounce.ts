// ============================================================================
// USE DEBOUNCE HOOK
// ============================================================================
// Reusable custom hook for debouncing values
//
// DEBOUNCING: Delays updating a value until user stops changing it
// - Waits for a pause in value changes before triggering update
// - Reduces excessive function calls (e.g., API calls while typing)
//
// EXAMPLE USE CASE:
// - User types "Smith" (5 keystrokes)
// - Without debounce: 5 API calls (wasteful, slow)
// - With 300ms debounce: 1 API call (efficient, fast)
//
// USAGE:
// ```typescript
// const [searchQuery, setSearchQuery] = useState('');
// const debouncedQuery = useDebounce(searchQuery, 300);
//
// useEffect(() => {
//   // This only runs 300ms after user stops typing
//   fetchData(debouncedQuery);
// }, [debouncedQuery]);
// ```
// ============================================================================

import { useState, useEffect } from 'react';

/**
 * useDebounce - Debounces a value
 * 
 * @param value - The value to debounce (can be any type)
 * @param delay - Delay in milliseconds before updating (default: 300ms)
 * @returns The debounced value
 * 
 * EXECUTION FLOW:
 * 1. Component renders with new value
 * 2. Hook receives new value
 * 3. Sets timeout to update debouncedValue after delay
 * 4. If value changes again before delay expires:
 *    - Cleanup function cancels previous timeout
 *    - New timeout is set
 * 5. If delay expires without new changes:
 *    - debouncedValue updates
 *    - Triggers re-render of components using this value
 * 
 * EXAMPLE TIMELINE:
 * - t=0ms:   value="S"     → Set 300ms timer
 * - t=50ms:  value="Sm"    → Cancel previous, set new 300ms timer
 * - t=100ms: value="Smi"   → Cancel previous, set new 300ms timer
 * - t=150ms: value="Smit"  → Cancel previous, set new 300ms timer
 * - t=200ms: value="Smith" → Cancel previous, set new 300ms timer
 * - t=500ms: Timer fires   → debouncedValue="Smith"
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timeout to update debounced value after delay
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function: Cancel timeout if value changes or component unmounts
    // This is critical for debouncing - it prevents the old timeout from firing
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]); // Re-run effect when value or delay changes

  return debouncedValue;
}

