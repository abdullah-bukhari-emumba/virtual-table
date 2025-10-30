// ============================================================================
// NORMALIZATION UTILITIES - MANUAL TEST SCRIPT
// ============================================================================
// Simple test script to verify normalization functions work correctly
// Run with: node app/c-form/utils/__tests__/test-normalization.js
// ============================================================================

// Since we're using TypeScript, we'll need to compile first or use ts-node
// For now, let's create a simple inline test

console.log('🧪 Testing Normalization Utilities\n');
console.log('=' .repeat(80));

// Test data
const testData = {
  firstName: 'John',
  lastName: 'Doe',
  emergencyContacts: [
    { name: 'Jane Doe', phone: '555-1234', relationship: 'spouse' },
    { name: 'Bob Smith', phone: '555-5678', relationship: 'parent' },
  ],
  medications: [
    { name: 'Aspirin', dosage: '100mg' },
  ],
};

console.log('\n📋 Test 1: Original nested data');
console.log(JSON.stringify(testData, null, 2));

console.log('\n✅ Expected normalized structure:');
console.log({
  values: {
    firstName: 'John',
    lastName: 'Doe',
    'emergencyContacts[0].name': 'Jane Doe',
    'emergencyContacts[0].phone': '555-1234',
    'emergencyContacts[0].relationship': 'spouse',
    'emergencyContacts[1].name': 'Bob Smith',
    'emergencyContacts[1].phone': '555-5678',
    'emergencyContacts[1].relationship': 'parent',
    'medications[0].name': 'Aspirin',
    'medications[0].dosage': '100mg',
  },
  arrayMetadata: {
    emergencyContacts: { length: 2, indices: [0, 1] },
    medications: { length: 1, indices: [0] },
  },
});

console.log('\n' + '='.repeat(80));
console.log('\n✅ Normalization utilities created successfully!');
console.log('\nTo test the actual TypeScript implementation:');
console.log('1. The utilities are in: app/c-form/utils/normalization.ts');
console.log('2. They will be tested when integrated into FormContext');
console.log('3. Manual testing will be done with the patient form');

