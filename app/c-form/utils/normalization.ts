// ============================================================================
// FORM STATE NORMALIZATION UTILITIES
// ============================================================================
// This module provides utilities to normalize and denormalize form state.
//
// NORMALIZATION STRATEGY:
// - Convert nested arrays to flat field paths with indices
// - Track array metadata separately (length, indices)
// - Enable O(1) field updates instead of O(n) array spreading
//
// EXAMPLE:
// Nested:   { emergencyContacts: [{ name: 'John', phone: '555-1234' }] }
// Flat:     { 'emergencyContacts[0].name': 'John', 'emergencyContacts[0].phone': '555-1234' }
// Metadata: { emergencyContacts: { length: 1, indices: [0] } }
// ============================================================================

import type { FormValues } from '../types';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * ArrayMetadata - Tracks structure of array fields
 * 
 * Maps array field names to their metadata:
 * - length: Number of items in the array
 * - indices: Array of indices (e.g., [0, 1, 2])
 */
export type ArrayMetadata = Record<string, {
  length: number;
  indices: number[];
}>;

/**
 * NormalizedFormState - Form state with normalized values
 * 
 * Contains:
 * - values: Flat field paths (e.g., 'emergencyContacts[0].name')
 * - arrayMetadata: Metadata about array fields
 */
export type NormalizedFormState = {
  values: FormValues;
  arrayMetadata: ArrayMetadata;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * isPlainObject - Check if value is a plain object (not array, not null)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

/**
 * isArrayField - Check if a value is an array of objects
 * 
 * We only normalize arrays of objects (like emergencyContacts).
 * Arrays of primitives (like ['red', 'blue']) are kept as-is.
 */
function isArrayField(value: unknown): value is Record<string, unknown>[] {
  if (!Array.isArray(value)) return false;
  if (value.length === 0) return true; // Empty arrays are considered array fields
  
  // Check if first item is a plain object
  return isPlainObject(value[0]);
}

// ============================================================================
// NORMALIZATION FUNCTIONS
// ============================================================================

/**
 * normalizeFormValues - Convert nested form values to flat structure
 * 
 * EXECUTION FLOW:
 * 1. Iterate through all form values
 * 2. For simple fields: copy as-is
 * 3. For array fields: flatten to indexed paths
 * 4. Track array metadata (length, indices)
 * 
 * EXAMPLE:
 * Input:
 * {
 *   firstName: 'John',
 *   emergencyContacts: [
 *     { name: 'Jane', phone: '555-1234' },
 *     { name: 'Bob', phone: '555-5678' }
 *   ]
 * }
 * 
 * Output:
 * {
 *   values: {
 *     firstName: 'John',
 *     'emergencyContacts[0].name': 'Jane',
 *     'emergencyContacts[0].phone': '555-1234',
 *     'emergencyContacts[1].name': 'Bob',
 *     'emergencyContacts[1].phone': '555-5678'
 *   },
 *   arrayMetadata: {
 *     emergencyContacts: { length: 2, indices: [0, 1] }
 *   }
 * }
 */
export function normalizeFormValues(nested: FormValues): NormalizedFormState {
  const values: FormValues = {};
  const arrayMetadata: ArrayMetadata = {};

  // Iterate through all top-level fields
  for (const [key, value] of Object.entries(nested)) {
    // Case 1: Array field (array of objects)
    if (isArrayField(value)) {
      const arrayValue = value as Record<string, unknown>[];
      
      // Track array metadata
      arrayMetadata[key] = {
        length: arrayValue.length,
        indices: arrayValue.map((_, index) => index),
      };

      // Flatten array items to indexed paths
      arrayValue.forEach((item, index) => {
        if (isPlainObject(item)) {
          // Flatten object properties
          for (const [itemKey, itemValue] of Object.entries(item)) {
            values[`${key}[${index}].${itemKey}`] = itemValue;
          }
        }
      });
    }
    // Case 2: Simple field (string, number, boolean, etc.)
    else {
      values[key] = value;
    }
  }

  return { values, arrayMetadata };
}

/**
 * denormalizeFormValues - Convert flat structure back to nested form values
 * 
 * EXECUTION FLOW:
 * 1. Iterate through flat values
 * 2. For simple fields: copy as-is
 * 3. For array field paths: reconstruct nested arrays
 * 4. Use array metadata to determine array structure
 * 
 * EXAMPLE:
 * Input:
 * {
 *   values: {
 *     firstName: 'John',
 *     'emergencyContacts[0].name': 'Jane',
 *     'emergencyContacts[0].phone': '555-1234',
 *     'emergencyContacts[1].name': 'Bob',
 *     'emergencyContacts[1].phone': '555-5678'
 *   },
 *   arrayMetadata: {
 *     emergencyContacts: { length: 2, indices: [0, 1] }
 *   }
 * }
 * 
 * Output:
 * {
 *   firstName: 'John',
 *   emergencyContacts: [
 *     { name: 'Jane', phone: '555-1234' },
 *     { name: 'Bob', phone: '555-5678' }
 *   ]
 * }
 */
export function denormalizeFormValues(
  flat: FormValues,
  metadata: ArrayMetadata
): FormValues {
  const nested: FormValues = {};

  // First, initialize all array fields as empty arrays
  for (const [arrayFieldName, arrayMeta] of Object.entries(metadata)) {
    nested[arrayFieldName] = Array(arrayMeta.length).fill(null).map(() => ({}));
  }

  // Iterate through flat values
  for (const [key, value] of Object.entries(flat)) {
    // Check if this is an array field path (e.g., 'emergencyContacts[0].name')
    const arrayMatch = key.match(/^(.+?)\[(\d+)\]\.(.+)$/);
    
    if (arrayMatch) {
      // Extract: arrayFieldName = 'emergencyContacts', index = 0, itemKey = 'name'
      const [, arrayFieldName, indexStr, itemKey] = arrayMatch;
      const index = parseInt(indexStr, 10);

      // Ensure array exists
      if (!Array.isArray(nested[arrayFieldName])) {
        nested[arrayFieldName] = [];
      }

      // Ensure object at index exists
      const array = nested[arrayFieldName] as Record<string, unknown>[];
      if (!array[index]) {
        array[index] = {};
      }

      // Set the value
      array[index][itemKey] = value;
    } else {
      // Simple field - copy as-is
      nested[key] = value;
    }
  }

  return nested;
}

/**
 * getArrayItems - Get array items for a specific field
 * 
 * Extracts all items from a normalized array field.
 * 
 * PARAMETERS:
 * - values: Flat form values
 * - metadata: Array metadata
 * - fieldName: Name of the array field (e.g., 'emergencyContacts')
 * 
 * RETURNS:
 * Array of items (each item is an object with the field's properties)
 * 
 * EXAMPLE:
 * getArrayItems(values, metadata, 'emergencyContacts')
 * // Returns: [{ name: 'Jane', phone: '555-1234' }, { name: 'Bob', phone: '555-5678' }]
 */
export function getArrayItems(
  values: FormValues,
  metadata: ArrayMetadata,
  fieldName: string
): unknown[] {
  const arrayMeta = metadata[fieldName];
  
  // If no metadata, return empty array
  if (!arrayMeta) {
    return [];
  }

  // Build array from flat values
  const items: Record<string, unknown>[] = [];
  
  for (let i = 0; i < arrayMeta.length; i++) {
    const item: Record<string, unknown> = {};
    
    // Find all keys for this index
    const prefix = `${fieldName}[${i}].`;
    for (const [key, value] of Object.entries(values)) {
      if (key.startsWith(prefix)) {
        const itemKey = key.substring(prefix.length);
        item[itemKey] = value;
      }
    }
    
    items.push(item);
  }

  return items;
}

/**
 * getNextArrayIndex - Get the next available index for an array field
 * 
 * PARAMETERS:
 * - metadata: Array metadata
 * - fieldName: Name of the array field
 * 
 * RETURNS:
 * Next available index (e.g., if array has [0, 1, 2], returns 3)
 */
export function getNextArrayIndex(
  metadata: ArrayMetadata,
  fieldName: string
): number {
  const arrayMeta = metadata[fieldName];
  
  if (!arrayMeta || arrayMeta.indices.length === 0) {
    return 0;
  }

  // Return max index + 1
  return Math.max(...arrayMeta.indices) + 1;
}

