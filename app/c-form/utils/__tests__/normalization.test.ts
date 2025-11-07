// ============================================================================
// NORMALIZATION UTILITIES - UNIT TESTS
// ============================================================================
// Tests for form state normalization and denormalization functions
// ============================================================================

import {
  normalizeFormValues,
  denormalizeFormValues,
  getArrayItems,
  getNextArrayIndex,
  type ArrayMetadata,
} from '../normalization';
import type { FormValues } from '../../types';

describe('normalizeFormValues', () => {
  it('should normalize simple fields without changes', () => {
    const input: FormValues = {
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
      isActive: true,
    };

    const result = normalizeFormValues(input);

    expect(result.values).toEqual(input);
    expect(result.arrayMetadata).toEqual({});
  });

  it('should normalize array fields to flat paths', () => {
    const input: FormValues = {
      firstName: 'John',
      emergencyContacts: [
        { name: 'Jane Doe', phone: '555-1234', relationship: 'spouse' },
        { name: 'Bob Smith', phone: '555-5678', relationship: 'parent' },
      ],
    };

    const result = normalizeFormValues(input);

    expect(result.values).toEqual({
      firstName: 'John',
      'emergencyContacts[0].name': 'Jane Doe',
      'emergencyContacts[0].phone': '555-1234',
      'emergencyContacts[0].relationship': 'spouse',
      'emergencyContacts[1].name': 'Bob Smith',
      'emergencyContacts[1].phone': '555-5678',
      'emergencyContacts[1].relationship': 'parent',
    });

    expect(result.arrayMetadata).toEqual({
      emergencyContacts: {
        length: 2,
        indices: [0, 1],
      },
    });
  });

  it('should handle empty arrays', () => {
    const input: FormValues = {
      firstName: 'John',
      emergencyContacts: [],
    };

    const result = normalizeFormValues(input);

    expect(result.values).toEqual({
      firstName: 'John',
    });

    expect(result.arrayMetadata).toEqual({
      emergencyContacts: {
        length: 0,
        indices: [],
      },
    });
  });

  it('should handle multiple array fields', () => {
    const input: FormValues = {
      emergencyContacts: [
        { name: 'Jane', phone: '555-1234' },
      ],
      medications: [
        { name: 'Aspirin', dosage: '100mg' },
        { name: 'Ibuprofen', dosage: '200mg' },
      ],
    };

    const result = normalizeFormValues(input);

    expect(result.arrayMetadata).toEqual({
      emergencyContacts: { length: 1, indices: [0] },
      medications: { length: 2, indices: [0, 1] },
    });

    expect(result.values['emergencyContacts[0].name']).toBe('Jane');
    expect(result.values['medications[0].name']).toBe('Aspirin');
    expect(result.values['medications[1].name']).toBe('Ibuprofen');
  });
});

describe('denormalizeFormValues', () => {
  it('should denormalize simple fields without changes', () => {
    const flat: FormValues = {
      firstName: 'John',
      lastName: 'Doe',
      age: 30,
    };
    const metadata: ArrayMetadata = {};

    const result = denormalizeFormValues(flat, metadata);

    expect(result).toEqual(flat);
  });

  it('should denormalize flat paths back to nested arrays', () => {
    const flat: FormValues = {
      firstName: 'John',
      'emergencyContacts[0].name': 'Jane Doe',
      'emergencyContacts[0].phone': '555-1234',
      'emergencyContacts[0].relationship': 'spouse',
      'emergencyContacts[1].name': 'Bob Smith',
      'emergencyContacts[1].phone': '555-5678',
      'emergencyContacts[1].relationship': 'parent',
    };
    const metadata: ArrayMetadata = {
      emergencyContacts: {
        length: 2,
        indices: [0, 1],
      },
    };

    const result = denormalizeFormValues(flat, metadata);

    expect(result).toEqual({
      firstName: 'John',
      emergencyContacts: [
        { name: 'Jane Doe', phone: '555-1234', relationship: 'spouse' },
        { name: 'Bob Smith', phone: '555-5678', relationship: 'parent' },
      ],
    });
  });

  it('should handle empty arrays', () => {
    const flat: FormValues = {
      firstName: 'John',
    };
    const metadata: ArrayMetadata = {
      emergencyContacts: {
        length: 0,
        indices: [],
      },
    };

    const result = denormalizeFormValues(flat, metadata);

    expect(result).toEqual({
      firstName: 'John',
      emergencyContacts: [],
    });
  });

  it('should round-trip normalize -> denormalize correctly', () => {
    const original: FormValues = {
      firstName: 'John',
      lastName: 'Doe',
      emergencyContacts: [
        { name: 'Jane', phone: '555-1234', relationship: 'spouse' },
        { name: 'Bob', phone: '555-5678', relationship: 'parent' },
      ],
      medications: [
        { name: 'Aspirin', dosage: '100mg' },
      ],
    };

    const normalized = normalizeFormValues(original);
    const denormalized = denormalizeFormValues(normalized.values, normalized.arrayMetadata);

    expect(denormalized).toEqual(original);
  });
});

describe('getArrayItems', () => {
  it('should extract array items from flat values', () => {
    const values: FormValues = {
      firstName: 'John',
      'emergencyContacts[0].name': 'Jane',
      'emergencyContacts[0].phone': '555-1234',
      'emergencyContacts[1].name': 'Bob',
      'emergencyContacts[1].phone': '555-5678',
    };
    const metadata: ArrayMetadata = {
      emergencyContacts: {
        length: 2,
        indices: [0, 1],
      },
    };

    const items = getArrayItems(values, metadata, 'emergencyContacts');

    expect(items).toEqual([
      { name: 'Jane', phone: '555-1234' },
      { name: 'Bob', phone: '555-5678' },
    ]);
  });

  it('should return empty array if field does not exist', () => {
    const values: FormValues = {
      firstName: 'John',
    };
    const metadata: ArrayMetadata = {};

    const items = getArrayItems(values, metadata, 'emergencyContacts');

    expect(items).toEqual([]);
  });

  it('should handle empty arrays', () => {
    const values: FormValues = {
      firstName: 'John',
    };
    const metadata: ArrayMetadata = {
      emergencyContacts: {
        length: 0,
        indices: [],
      },
    };

    const items = getArrayItems(values, metadata, 'emergencyContacts');

    expect(items).toEqual([]);
  });
});

describe('getNextArrayIndex', () => {
  it('should return 0 for new array field', () => {
    const metadata: ArrayMetadata = {};

    const nextIndex = getNextArrayIndex(metadata, 'emergencyContacts');

    expect(nextIndex).toBe(0);
  });

  it('should return next index for existing array', () => {
    const metadata: ArrayMetadata = {
      emergencyContacts: {
        length: 2,
        indices: [0, 1],
      },
    };

    const nextIndex = getNextArrayIndex(metadata, 'emergencyContacts');

    expect(nextIndex).toBe(2);
  });

  it('should return correct index after items are removed', () => {
    // Simulate removing index 1, leaving [0, 2]
    const metadata: ArrayMetadata = {
      emergencyContacts: {
        length: 2,
        indices: [0, 2],
      },
    };

    const nextIndex = getNextArrayIndex(metadata, 'emergencyContacts');

    expect(nextIndex).toBe(3); // Max index (2) + 1
  });
});

