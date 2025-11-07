# State Normalization Testing Checklist

## Test Environment
- URL: http://localhost:3000/c-form
- Browser: Chrome DevTools Console

## Phase 6: End-to-End Testing

### Test 1: Initial State Verification
**Goal:** Verify that initial values are properly normalized on mount

**Steps:**
1. Open browser DevTools Console
2. Navigate to http://localhost:3000/c-form
3. In console, type: `window.__FORM_STATE__` (if we add debugging)
4. Or inspect React DevTools to see FormContext state

**Expected Result:**
- Initial `emergencyContacts` array should be normalized to flat paths:
  - `emergencyContacts[0].name: ''`
  - `emergencyContacts[0].phone: ''`
  - `emergencyContacts[0].relationship: ''`
- `arrayMetadata.emergencyContacts` should exist with `{ length: 1, indices: [0] }`

**Status:** ⏳ Pending

---

### Test 2: Add Emergency Contact
**Goal:** Verify addArrayItem works with normalized state (O(1) performance)

**Steps:**
1. Click the "+ Add Emergency Contact" button
2. Verify a new empty contact appears
3. Check console for any errors

**Expected Result:**
- New contact fields appear immediately
- No console errors
- Form should now have 2 emergency contacts
- Normalized state should have:
  - `emergencyContacts[1].name: ''`
  - `emergencyContacts[1].phone: ''`
  - `emergencyContacts[1].relationship: ''`
- `arrayMetadata.emergencyContacts.length: 2`
- `arrayMetadata.emergencyContacts.indices: [0, 1]`

**Status:** ⏳ Pending

---

### Test 3: Fill Emergency Contact Fields
**Goal:** Verify field updates work with normalized state

**Steps:**
1. Fill in first emergency contact:
   - Name: "John Doe"
   - Phone: "555-1234"
   - Relationship: "Spouse"
2. Fill in second emergency contact:
   - Name: "Jane Smith"
   - Phone: "555-5678"
   - Relationship: "Parent"

**Expected Result:**
- Values update immediately in the UI
- No console errors
- Normalized state should have:
  - `emergencyContacts[0].name: 'John Doe'`
  - `emergencyContacts[0].phone: '555-1234'`
  - `emergencyContacts[0].relationship: 'Spouse'`
  - `emergencyContacts[1].name: 'Jane Smith'`
  - `emergencyContacts[1].phone: '555-5678'`
  - `emergencyContacts[1].relationship: 'Parent'`

**Status:** ⏳ Pending

---

### Test 4: Remove Emergency Contact
**Goal:** Verify removeArrayItem works with normalized state (O(1) performance)

**Steps:**
1. Click "Remove" button on the first emergency contact
2. Verify the contact is removed
3. Check that the second contact is still present

**Expected Result:**
- First contact (John Doe) is removed
- Second contact (Jane Smith) remains and is still at index 1
- No console errors
- Normalized state should have:
  - `emergencyContacts[1].name: 'Jane Smith'` (still at index 1)
  - `emergencyContacts[1].phone: '555-5678'`
  - `emergencyContacts[1].relationship: 'Parent'`
  - No keys for `emergencyContacts[0].*`
- `arrayMetadata.emergencyContacts.length: 1`
- `arrayMetadata.emergencyContacts.indices: [1]` (index 0 removed)

**Status:** ⏳ Pending

---

### Test 5: Form Validation with Array Fields
**Goal:** Verify validation works with denormalized values

**Steps:**
1. Leave emergency contact name empty
2. Fill in other required fields (firstName, lastName, email, phone)
3. Click "Submit Patient Information"

**Expected Result:**
- Validation should run on denormalized structure
- Error should appear for empty emergency contact name
- Form should NOT submit
- No console errors

**Status:** ⏳ Pending

---

### Test 6: Form Submission with Denormalized Values
**Goal:** Verify onSubmit receives properly denormalized nested structure

**Steps:**
1. Fill in all required fields including emergency contact
2. Click "Submit Patient Information"
3. Check console output

**Expected Result:**
- Form submits successfully
- Console shows "FORM SUBMITTED SUCCESSFULLY"
- Form values in console should show NESTED structure:
  ```json
  {
    "firstName": "...",
    "lastName": "...",
    "emergencyContacts": [
      {
        "name": "Jane Smith",
        "phone": "555-5678",
        "relationship": "Parent"
      }
    ]
  }
  ```
- NOT flat structure (no `emergencyContacts[1].name` keys)
- Alert appears: "Form submitted successfully!"

**Status:** ⏳ Pending

---

### Test 7: Add Multiple Contacts and Remove Middle One
**Goal:** Verify complex array operations work correctly

**Steps:**
1. Add 3 emergency contacts
2. Fill them with different data
3. Remove the middle contact (index 1)
4. Verify indices are correct

**Expected Result:**
- All 3 contacts appear
- Middle contact is removed
- Remaining contacts maintain their data
- Indices in metadata reflect the removal

**Status:** ⏳ Pending

---

### Test 8: Performance Verification
**Goal:** Verify no performance regressions

**Steps:**
1. Open Chrome DevTools Performance tab
2. Start recording
3. Add 10 emergency contacts rapidly
4. Stop recording
5. Check for any long tasks or jank

**Expected Result:**
- No long tasks (>50ms)
- Smooth UI updates
- No visible lag

**Status:** ⏳ Pending

---

## Summary

**Total Tests:** 8
**Passed:** 0
**Failed:** 0
**Pending:** 8

## Notes
- All tests should be performed manually in the browser
- Check console for errors after each test
- Verify React DevTools shows correct state structure

