// ============================================================================
// FIELD ARRAY COMPONENT
// ============================================================================
// Dynamic field array for repeating field groups
// ============================================================================

'use client';

import React, { useState, useCallback } from 'react';
import type { FieldArrayProps } from './types';

/**
 * FieldArray Component
 * Manages dynamic arrays of form fields
 * 
 * @example
 * ```tsx
 * <FieldArray name="addresses" minItems={1} maxItems={5}>
 *   {({ index, remove, moveUp, moveDown, isFirst, isLast }) => (
 *     <div>
 *       <FormInput name={`addresses.${index}.street`} label="Street" />
 *       <FormInput name={`addresses.${index}.city`} label="City" />
 *       <button onClick={remove}>Remove</button>
 *     </div>
 *   )}
 * </FieldArray>
 * ```
 */
export function FieldArray({
  name,
  children,
  initialCount = 1,
  minItems = 0,
  maxItems = Infinity,
  addButtonLabel = 'Add Item',
  className = '',
}: FieldArrayProps) {
  // Track array indices
  const [items, setItems] = useState<number[]>(() =>
    Array.from({ length: initialCount }, (_, i) => i)
  );
  
  // Track next index to use (for unique keys)
  const [nextIndex, setNextIndex] = useState(initialCount);

  /**
   * Add a new item to the array
   */
  const addItem = useCallback(() => {
    if (items.length >= maxItems) {
      return;
    }

    setItems((prev) => [...prev, nextIndex]);
    setNextIndex((prev) => prev + 1);
  }, [items.length, maxItems, nextIndex]);

  /**
   * Remove an item from the array
   */
  const removeItem = useCallback((index: number) => {
    if (items.length <= minItems) {
      return;
    }

    setItems((prev) => prev.filter((item) => item !== index));
  }, [items.length, minItems]);

  /**
   * Move an item up in the array
   */
  const moveItemUp = useCallback((index: number) => {
    setItems((prev) => {
      const currentIndex = prev.indexOf(index);
      if (currentIndex <= 0) return prev;

      const newItems = [...prev];
      [newItems[currentIndex - 1], newItems[currentIndex]] = [
        newItems[currentIndex],
        newItems[currentIndex - 1],
      ];
      return newItems;
    });
  }, []);

  /**
   * Move an item down in the array
   */
  const moveItemDown = useCallback((index: number) => {
    setItems((prev) => {
      const currentIndex = prev.indexOf(index);
      if (currentIndex < 0 || currentIndex >= prev.length - 1) return prev;

      const newItems = [...prev];
      [newItems[currentIndex], newItems[currentIndex + 1]] = [
        newItems[currentIndex + 1],
        newItems[currentIndex],
      ];
      return newItems;
    });
  }, []);

  const canAdd = items.length < maxItems;
  const canRemove = items.length > minItems;

  return (
    <div className={className}>
      {/* Render array items */}
      <div className="space-y-4">
        {items.map((itemIndex, arrayIndex) => (
          <div
            key={itemIndex}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            {/* Item header with controls */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Item {arrayIndex + 1}
              </span>
              <div className="flex gap-2">
                {/* Move up button */}
                {arrayIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => moveItemUp(itemIndex)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Move up"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  </button>
                )}

                {/* Move down button */}
                {arrayIndex < items.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveItemDown(itemIndex)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Move down"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                )}

                {/* Remove button */}
                {canRemove && (
                  <button
                    type="button"
                    onClick={() => removeItem(itemIndex)}
                    className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label="Remove item"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Render item fields */}
            {children({
              index: itemIndex,
              remove: () => removeItem(itemIndex),
              moveUp: () => moveItemUp(itemIndex),
              moveDown: () => moveItemDown(itemIndex),
              isFirst: arrayIndex === 0,
              isLast: arrayIndex === items.length - 1,
            })}
          </div>
        ))}
      </div>

      {/* Add button */}
      {canAdd && (
        <button
          type="button"
          onClick={addItem}
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {addButtonLabel}
        </button>
      )}

      {/* Item count info */}
      <div className="mt-2 text-sm text-gray-500">
        {items.length} {items.length === 1 ? 'item' : 'items'}
        {minItems > 0 && ` (minimum: ${minItems})`}
        {maxItems < Infinity && ` (maximum: ${maxItems})`}
      </div>
    </div>
  );
}

