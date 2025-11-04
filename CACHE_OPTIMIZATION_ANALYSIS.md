# Cache Invalidation & Optimistic UI Update Analysis

## Executive Summary

This document identifies all potential locations in the virtual table component and C-form page where cache invalidation strategies and optimistic UI updates could be implemented. The analysis focuses on **identification only** - no implementation changes are proposed at this stage.

---

## Current Data Fetching Patterns

### Virtual Table (app/page.tsx)
- **Pattern**: Manual state management with `useState` and `useCallback`
- **Caching**: Simple in-memory Map cache (`dataCache.current`)
- **No formal caching library**: No React Query, SWR, or similar
- **Data flow**: Direct `fetch()` calls → manual state updates

### C-Form (app/c-form/page.tsx)
- **Pattern**: Local form state with custom reducer
- **No server integration**: Form only logs to console (demo mode)
- **No data fetching**: Currently no API calls

---

## Part 1: Virtual Table - Cache Invalidation Opportunities

### 1.1 Search Query Changes
**Location**: `app/page.tsx` lines 507-514

**Current Behavior**:
```typescript
useEffect(() => {
  dataCache.current.clear();  // Manual cache clearing
  loadPatients(50, 0, sortColumn, sortOrder, debouncedSearchQuery);
}, [debouncedSearchQuery, sortColumn, sortOrder]);
```

**Trigger**: User types in search box → debounced query changes
**Data Affected**: All patient records (search results differ from previous query)
**Current Strategy**: Clear entire cache, fetch new data
**Invalidation Need**: ✅ Already implemented (manual cache clear)

**Potential Improvement**:
- Could use query-based cache keys instead of clearing everything
- Example: `cache.get('patients-query-Smith')` vs `cache.get('patients-query-Jones')`

---

### 1.2 Sort Column/Order Changes
**Location**: `app/page.tsx` lines 507-514 (same useEffect)

**Trigger**: User clicks column header to sort
**Data Affected**: All patient records (order changes, but data is same)
**Current Strategy**: Clear cache, re-fetch with new sort params
**Invalidation Need**: ✅ Already implemented

**Potential Improvement**:
- Could cache by sort key: `cache.get('patients-name-asc')` vs `cache.get('patients-date-desc')`
- Avoid re-fetching if data already cached for that sort combination

---

### 1.3 Infinite Scroll - Load More Data
**Location**: `app/page.tsx` lines 362-387 (`loadMoreData` function)

**Trigger**: User scrolls down past 50% threshold
**Data Affected**: Next 50 records appended to current dataset
**Current Strategy**: 
- Fetch new page
- Cache individual records in `dataCache`
- Append to `patients` state array
- Implement sliding window (remove old records when > 100 items)

**Cache Behavior**:
```typescript
data.rows.forEach((patient: PatientRecord) => {
  dataCache.current.set(patient.id, patient);  // Cache by ID
});
```

**Invalidation Need**: ❌ No invalidation needed (append-only operation)

**Note**: Sliding window removes items from state but keeps them in cache for potential re-access

---

### 1.4 Bidirectional Scroll - Load Previous Data
**Location**: `app/page.tsx` lines 389-430 (`loadPreviousData` function)

**Trigger**: User scrolls up past 25% threshold
**Data Affected**: Previous 50 records prepended to current dataset
**Current Strategy**: Similar to load more, but prepends instead of appends

**Invalidation Need**: ❌ No invalidation needed (prepend-only operation)

---

### 1.5 Sliding Window Cache Cleanup
**Location**: `app/page.tsx` lines 286-304 (within `loadPatients`)

**Trigger**: Window size exceeds MAX_WINDOW_SIZE (100 records)
**Data Affected**: Oldest records removed from state
**Current Strategy**:
```typescript
for (let i = 0; i < rowsToRemove; i++) {
  const removedPatient = newData[i];
  dataCache.current.delete(removedPatient.id);  // Manual cache cleanup
}
```

**Invalidation Need**: ✅ Already implemented (manual cache deletion)

**Purpose**: Memory management - prevents cache from growing indefinitely

---

## Part 2: Virtual Table - Optimistic UI Update Opportunities

### 2.1 Patient Record Updates (NOT CURRENTLY IMPLEMENTED)
**Potential Location**: Would need new API endpoint `PUT /api/patients/[id]`

**User Action**: Edit patient name, MRN, or summary
**Optimistic Update Strategy**:
1. Immediately update local state (`patients` array)
2. Update `dataCache` with new values
3. Send PUT request to server
4. On success: Keep optimistic update
5. On failure: Revert to original values, show error

**Data to Update**:
- `patients` state array (find by ID, update fields)
- `dataCache.current.set(id, updatedPatient)`

**Current Status**: ❌ No mutation endpoints exist
**Benefit**: Instant feedback for user edits

---

### 2.2 Patient Record Deletion (NOT CURRENTLY IMPLEMENTED)
**Potential Location**: Would need new API endpoint `DELETE /api/patients/[id]`

**User Action**: Delete a patient record
**Optimistic Update Strategy**:
1. Immediately remove from `patients` array
2. Remove from `dataCache`
3. Decrement `totalCount`
4. Send DELETE request
5. On failure: Re-insert record, show error

**Data to Update**:
- `patients.filter(p => p.id !== deletedId)`
- `dataCache.current.delete(deletedId)`
- `setTotalCount(prev => prev - 1)`

**Current Status**: ❌ No mutation endpoints exist
**Benefit**: Instant removal from UI

---

### 2.3 Patient Record Creation (NOT CURRENTLY IMPLEMENTED)
**Potential Location**: Would need new API endpoint `POST /api/patients`

**User Action**: Create new patient record
**Optimistic Update Strategy**:
1. Generate temporary ID (e.g., `temp-${Date.now()}`)
2. Add to `patients` array with optimistic data
3. Add to `dataCache`
4. Increment `totalCount`
5. Send POST request
6. On success: Replace temp ID with real server ID
7. On failure: Remove optimistic record, show error

**Data to Update**:
- `setPatients(prev => [newPatient, ...prev])`
- `dataCache.current.set(tempId, newPatient)`
- `setTotalCount(prev => prev + 1)`

**Current Status**: ❌ No mutation endpoints exist
**Benefit**: Instant addition to UI

---

### 2.4 Bulk Operations (NOT CURRENTLY IMPLEMENTED)
**Potential Location**: Would need new API endpoint `POST /api/patients/bulk-update`

**User Action**: Select multiple patients, perform bulk action (delete, update status, etc.)
**Optimistic Update Strategy**:
1. Update all selected records in local state
2. Update `dataCache` for each
3. Send bulk request
4. On partial failure: Revert failed items, keep successful ones

**Current Status**: ❌ No mutation endpoints exist (only bulk GET exists)
**Benefit**: Instant feedback for bulk operations

---

## Part 3: C-Form - Cache Invalidation Opportunities

### 3.1 Form Submission (CURRENTLY DEMO ONLY)
**Location**: `app/c-form/page.tsx` lines 178-187 (`handleSubmit`)

**Current Behavior**:
```typescript
const handleSubmit = (values: FormValues) => {
  console.log('Form Values:', JSON.stringify(values, null, 2));
  alert('Form submitted successfully!');
};
```

**Trigger**: User clicks "Submit Patient Information"
**Data Affected**: Would create new patient record (if connected to API)

**Potential Cache Invalidation** (if API connected):
- Invalidate patient list cache (new record added)
- Invalidate total count
- Invalidate search results if new patient matches current query

**Current Status**: ❌ No API integration
**Future Implementation**:
```typescript
const handleSubmit = async (values: FormValues) => {
  // Optimistic: Add to local cache immediately
  const tempPatient = { id: 'temp-...', ...values };
  
  // Send to API
  const response = await fetch('/api/patients', {
    method: 'POST',
    body: JSON.stringify(values)
  });
  
  // Invalidate caches
  // - Patient list cache
  // - Search results cache
  // - Total count cache
};
```

---

### 3.2 Form Field Array Operations
**Location**: `app/c-form/components/FormContext.tsx`

#### 3.2.1 Add Array Item
**Function**: `addArrayItem` (lines 656-687)
**Trigger**: User clicks "Add Another Contact" button
**Data Affected**: Local form state only (no server interaction)

**Current Behavior**:
```typescript
const addArrayItem = useCallback((fieldName: string, defaultValue: unknown) => {
  const nextIndex = getNextArrayIndex(arrayMetadata, fieldName);
  const newValues = { ...values };
  // Add flat field paths for new item
  dispatch({ type: 'SET_VALUES', payload: newValues });
  dispatch({ type: 'SET_ARRAY_METADATA', payload: newMetadata });
}, [values, arrayMetadata]);
```

**Invalidation Need**: ❌ No cache invalidation needed (local state only)
**Optimistic Update**: ✅ Already optimistic (immediate UI update)

---

#### 3.2.2 Remove Array Item
**Function**: `removeArrayItem` (lines 711-761)
**Trigger**: User clicks "Remove" button on emergency contact
**Data Affected**: Local form state only

**Current Behavior**:
```typescript
const removeArrayItem = useCallback((fieldName: string, index: number) => {
  // Delete all flat field paths for this index
  const prefix = `${fieldName}[${index}].`;
  Object.keys(newValues).forEach((key) => {
    if (key.startsWith(prefix)) {
      delete newValues[key];
    }
  });
  dispatch({ type: 'SET_VALUES', payload: newValues });
}, [values, arrayMetadata, errors, touched]);
```

**Invalidation Need**: ❌ No cache invalidation needed (local state only)
**Optimistic Update**: ✅ Already optimistic (immediate UI update)

---

#### 3.2.3 Move Array Item
**Function**: `moveArrayItem` (lines 786-841)
**Trigger**: User reorders emergency contacts (if drag-drop implemented)
**Data Affected**: Local form state only

**Invalidation Need**: ❌ No cache invalidation needed (local state only)
**Optimistic Update**: ✅ Already optimistic (immediate UI update)

---

### 3.3 Form Reset
**Location**: `app/c-form/components/FormContext.tsx` lines 626-628

**Function**: `resetForm`
**Trigger**: User clicks reset button (if implemented)
**Data Affected**: All form state reset to initial values

**Current Behavior**:
```typescript
const resetForm = useCallback(() => {
  dispatch({ type: 'RESET_FORM', payload: initialValues });
}, [initialValues]);
```

**Invalidation Need**: ❌ No cache invalidation needed (local state only)
**Optimistic Update**: ✅ Already optimistic (immediate UI update)

---

### 3.4 Field Value Changes
**Location**: `app/c-form/components/FormContext.tsx` lines 447-470

**Function**: `setFieldValue`
**Trigger**: User types in any form field
**Data Affected**: Single field value in local state

**Current Behavior**:
```typescript
const setFieldValue = useCallback((name: string, value: unknown) => {
  dispatch({ type: 'SET_FIELD_VALUE', payload: { name, value } });
  
  // Optional: Validate on change
  if (validateOnChange) {
    validateField(name, value);
  }
}, [validateOnChange, validateField]);
```

**Invalidation Need**: ❌ No cache invalidation needed (local state only)
**Optimistic Update**: ✅ Already optimistic (immediate UI update)

---

## Part 4: Potential Future Mutations Requiring Cache Invalidation

### 4.1 Patient Record Edit (Virtual Table)
**Endpoint**: `PUT /api/patients/[id]` (NOT IMPLEMENTED)

**Cache Invalidation Strategy**:
1. Update record in `dataCache.current`
2. Update record in `patients` array
3. If using React Query: `queryClient.invalidateQueries(['patients'])`

**Optimistic Update**:
- Update local state immediately
- Revert on error

---

### 4.2 Patient Record Delete (Virtual Table)
**Endpoint**: `DELETE /api/patients/[id]` (NOT IMPLEMENTED)

**Cache Invalidation Strategy**:
1. Remove from `dataCache.current`
2. Remove from `patients` array
3. Decrement `totalCount`
4. If using React Query: `queryClient.invalidateQueries(['patients'])`

**Optimistic Update**:
- Remove from UI immediately
- Re-insert on error

---

### 4.3 Patient Form Submission (C-Form)
**Endpoint**: `POST /api/patients` (NOT IMPLEMENTED)

**Cache Invalidation Strategy**:
1. Invalidate patient list cache
2. Invalidate search results
3. Invalidate total count
4. If using React Query: `queryClient.invalidateQueries(['patients'])`

**Optimistic Update**:
- Add temp record to virtual table
- Replace with real record on success
- Remove on error

---

## Part 5: Summary of Findings

### Existing Cache Invalidation (Manual)
| Location | Trigger | Strategy | Status |
|----------|---------|----------|--------|
| Search/Sort change | User input | Clear entire cache | ✅ Implemented |
| Sliding window cleanup | Window overflow | Delete removed records | ✅ Implemented |

### Missing Cache Invalidation (No Mutations Exist)
| Operation | Endpoint Needed | Cache Impact | Priority |
|-----------|----------------|--------------|----------|
| Create patient | POST /api/patients | Invalidate list, count | High |
| Update patient | PUT /api/patients/[id] | Update specific record | Medium |
| Delete patient | DELETE /api/patients/[id] | Remove from cache | Medium |
| Bulk operations | POST /api/patients/bulk | Invalidate multiple | Low |

### Optimistic UI Opportunities (Require API Endpoints)
| Operation | Current Status | Benefit | Complexity |
|-----------|---------------|---------|------------|
| Create patient | ❌ No endpoint | Instant feedback | Medium |
| Update patient | ❌ No endpoint | Instant edits | Low |
| Delete patient | ❌ No endpoint | Instant removal | Low |
| Bulk operations | ❌ No endpoint | Batch feedback | High |

### Form Operations (Already Optimistic)
| Operation | Location | Status |
|-----------|----------|--------|
| Add array item | FormContext.tsx:656 | ✅ Optimistic |
| Remove array item | FormContext.tsx:711 | ✅ Optimistic |
| Move array item | FormContext.tsx:786 | ✅ Optimistic |
| Field value change | FormContext.tsx:447 | ✅ Optimistic |
| Form reset | FormContext.tsx:626 | ✅ Optimistic |

---

## Part 6: Recommendations for Discussion

### 1. Implement Mutation Endpoints First
Before adding cache invalidation, create:
- `POST /api/patients` - Create patient
- `PUT /api/patients/[id]` - Update patient
- `DELETE /api/patients/[id]` - Delete patient

### 2. Consider React Query Migration
**Benefits**:
- Automatic cache management
- Built-in optimistic updates
- Request deduplication
- Background refetching
- Stale-while-revalidate pattern

**Current Manual Approach**:
```typescript
// Manual cache management
dataCache.current.set(id, patient);
dataCache.current.delete(id);
dataCache.current.clear();
```

**With React Query**:
```typescript
// Automatic cache management
const { data } = useQuery(['patients', params], fetchPatients);
queryClient.invalidateQueries(['patients']);
queryClient.setQueryData(['patients', id], updatedPatient);
```

### 3. Implement Optimistic Updates for Mutations
Once endpoints exist, add optimistic updates for:
1. **High Priority**: Create/Delete (most common operations)
2. **Medium Priority**: Update (less frequent)
3. **Low Priority**: Bulk operations (rare)

### 4. Enhance Current Cache Strategy
Even without React Query:
- Use query-based cache keys instead of clearing everything
- Implement cache TTL (time-to-live)
- Add cache size limits
- Implement LRU (Least Recently Used) eviction

---

## Next Steps

1. **Discuss** which mutations are needed for the application
2. **Prioritize** which optimistic updates provide most value
3. **Decide** whether to use React Query or enhance manual caching
4. **Implement** mutation endpoints before cache strategies
5. **Test** optimistic updates with error scenarios

---

**Document Version**: 1.0  
**Date**: 2025-11-02  
**Status**: Analysis Complete - Awaiting Discussion

