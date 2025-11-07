# Cache Invalidation & Optimistic Updates - Quick Reference

## 📋 Quick Lookup Tables

### Virtual Table - Existing Cache Operations

| Operation | File | Line(s) | Function | Current Implementation |
|-----------|------|---------|----------|------------------------|
| **Clear cache on search** | `app/page.tsx` | 509 | `useEffect` | `dataCache.current.clear()` |
| **Clear cache on sort** | `app/page.tsx` | 509 | `useEffect` | `dataCache.current.clear()` |
| **Add to cache** | `app/page.tsx` | 205-207 | `loadPatients` | `dataCache.current.set(patient.id, patient)` |
| **Remove from cache** | `app/page.tsx` | 298-300 | `loadPatients` | `dataCache.current.delete(removedPatient.id)` |
| **Cache lookup** | `app/page.tsx` | 139 | Ref initialization | `useRef<Map<string, PatientRecord>>(new Map())` |

---

### Virtual Table - Data Fetching Locations

| Trigger | File | Line(s) | Function | API Call | Cache Impact |
|---------|------|---------|----------|----------|--------------|
| **Initial load** | `app/page.tsx` | 512 | `useEffect` | `loadPatients(50, 0, ...)` | Clears cache, adds new data |
| **Search change** | `app/page.tsx` | 512 | `useEffect` | `loadPatients(50, 0, ...)` | Clears cache, adds new data |
| **Sort change** | `app/page.tsx` | 512 | `useEffect` | `loadPatients(50, 0, ...)` | Clears cache, adds new data |
| **Scroll down** | `app/page.tsx` | 379 | `loadMoreData` | `loadPatients(50, offset, ...)` | Adds to cache |
| **Scroll up** | `app/page.tsx` | 413 | `loadPreviousData` | `loadPatients(50, offset, ..., true)` | Adds to cache |

---

### C-Form - State Update Locations

| Operation | File | Line(s) | Function | Trigger | Server Impact |
|-----------|------|---------|----------|---------|---------------|
| **Form submit** | `app/c-form/page.tsx` | 178-187 | `handleSubmit` | Submit button | ❌ None (demo only) |
| **Add array item** | `app/c-form/components/FormContext.tsx` | 656-687 | `addArrayItem` | Add button | ❌ None (local only) |
| **Remove array item** | `app/c-form/components/FormContext.tsx` | 711-761 | `removeArrayItem` | Remove button | ❌ None (local only) |
| **Move array item** | `app/c-form/components/FormContext.tsx` | 786-841 | `moveArrayItem` | Drag/drop | ❌ None (local only) |
| **Set field value** | `app/c-form/components/FormContext.tsx` | 447-470 | `setFieldValue` | User input | ❌ None (local only) |
| **Reset form** | `app/c-form/components/FormContext.tsx` | 626-628 | `resetForm` | Reset button | ❌ None (local only) |

---

### API Endpoints - Current Status

| Endpoint | Method | File | Status | Purpose |
|----------|--------|------|--------|---------|
| `/api/patients` | GET | `app/api/patients/route.ts` | ✅ Exists | List patients (paginated, sorted, filtered) |
| `/api/patients/[id]` | GET | `app/api/patients/[id]/route.ts` | ✅ Exists | Get single patient |
| `/api/patients/bulk` | POST | `app/api/patients/bulk/route.ts` | ✅ Exists | Get multiple patients by IDs |
| `/api/patients` | POST | N/A | ❌ Missing | Create patient |
| `/api/patients/[id]` | PUT | N/A | ❌ Missing | Update patient |
| `/api/patients/[id]` | DELETE | N/A | ❌ Missing | Delete patient |
| `/api/patients/bulk-update` | POST | N/A | ❌ Missing | Bulk update patients |
| `/api/patients/bulk-delete` | POST | N/A | ❌ Missing | Bulk delete patients |

---

### Proposed Optimistic Update Locations

| Operation | Endpoint Needed | Files to Modify | State Updates Required |
|-----------|----------------|-----------------|------------------------|
| **Create patient** | `POST /api/patients` | `app/page.tsx`, `app/c-form/page.tsx` | Add to `patients`, `dataCache`, increment `totalCount` |
| **Update patient** | `PUT /api/patients/[id]` | `app/page.tsx` | Update in `patients`, `dataCache` |
| **Delete patient** | `DELETE /api/patients/[id]` | `app/page.tsx` | Remove from `patients`, `dataCache`, decrement `totalCount` |
| **Bulk delete** | `POST /api/patients/bulk-delete` | `app/page.tsx` | Remove multiple from `patients`, `dataCache`, update `totalCount` |

---

### Cache Invalidation Strategies - Comparison

| Strategy | Current | With React Query | Pros | Cons |
|----------|---------|------------------|------|------|
| **Manual clear** | ✅ Used | N/A | Simple, explicit control | Must remember to clear |
| **Query-based keys** | ❌ Not used | ✅ Built-in | Granular invalidation | More complex cache structure |
| **Time-based (TTL)** | ❌ Not used | ✅ Built-in | Auto-refresh stale data | May fetch unnecessarily |
| **Mutation-based** | ❌ Not used | ✅ Built-in | Invalidate on changes | Requires mutation setup |
| **Optimistic updates** | ❌ Not used | ✅ Built-in | Instant UI feedback | Rollback complexity |

---

### Data Flow - Current Architecture

```
User Action (Search/Sort)
    ↓
useEffect triggers (app/page.tsx:507-514)
    ↓
dataCache.current.clear() (line 509)
    ↓
loadPatients() called (line 512)
    ↓
fetchPatients() API call (lib/api/patientApi.ts:50)
    ↓
fetch('/api/patients?...') (line 95)
    ↓
GET /api/patients route handler (app/api/patients/route.ts:4)
    ↓
SQLite query (line 40-53)
    ↓
Response: { total, rows } (line 55-58)
    ↓
Cache individual records (app/page.tsx:205-207)
    ↓
Update state: setPatients(), setTotalCount() (line 212-217)
    ↓
VirtualTable re-renders with new data
```

---

### Form Submission Flow - Current vs Proposed

#### Current (Demo Mode)
```
User clicks Submit
    ↓
handleSubmit() called (app/c-form/page.tsx:178)
    ↓
console.log(values) (line 182)
    ↓
alert('Success!') (line 186)
    ↓
END (no server interaction)
```

#### Proposed (With API Integration)
```
User clicks Submit
    ↓
handleSubmit() called
    ↓
OPTIMISTIC: Add temp patient to virtual table
    ↓
POST /api/patients (background)
    ↓
SUCCESS: Replace temp ID with real ID
    ↓
INVALIDATE: Patient list cache
    ↓
REFRESH: Virtual table shows new patient
```

---

### State Management - Current Patterns

| Component | State Pattern | Library | Caching |
|-----------|--------------|---------|---------|
| **Virtual Table** | `useState` + `useCallback` | React built-in | Manual Map cache |
| **C-Form** | `useReducer` + Context | React built-in | None (local only) |
| **API Client** | N/A | Native `fetch()` | None |

---

### Performance Characteristics

| Metric | Current Value | Location | Notes |
|--------|---------------|----------|-------|
| **Cache size limit** | None | N/A | Grows indefinitely |
| **Window size** | 100 records | `app/page.tsx:63` | `MAX_WINDOW_SIZE` constant |
| **Fetch batch size** | 50 records | `app/page.tsx:512` | `loadPatients(50, ...)` |
| **Debounce delay** | 300ms | `app/page.tsx:131` | `useDebounce(searchQuery, 300)` |
| **Scroll threshold (down)** | 50% | `components/VirtualTable.tsx:96` | `loadMoreThreshold = 0.5` |
| **Scroll threshold (up)** | 25% | `components/VirtualTable.tsx:98` | `loadPreviousThreshold = 0.25` |

---

### Code Snippets - Common Operations

#### Clear Cache
```typescript
// Location: app/page.tsx:509
dataCache.current.clear();
```

#### Add to Cache
```typescript
// Location: app/page.tsx:205-207
data.rows.forEach((patient: PatientRecord) => {
  dataCache.current.set(patient.id, patient);
});
```

#### Remove from Cache
```typescript
// Location: app/page.tsx:298-300
for (let i = 0; i < rowsToRemove; i++) {
  const removedPatient = newData[i];
  dataCache.current.delete(removedPatient.id);
}
```

#### Fetch Patients
```typescript
// Location: app/page.tsx:195-201
const data = await fetchPatients({
  limit,
  offset,
  sort,
  order,
  query: query || undefined,
});
```

---

### Migration Path to React Query

#### Step 1: Install Dependencies
```bash
npm install @tanstack/react-query
```

#### Step 2: Setup Query Client
```typescript
// app/providers.tsx (new file)
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

#### Step 3: Replace Manual Fetching
```typescript
// Before (app/page.tsx:181-321)
const loadPatients = useCallback(async (...) => {
  const data = await fetchPatients(...);
  dataCache.current.set(...);
  setPatients(...);
}, [...]);

// After
const { data, isLoading } = useQuery({
  queryKey: ['patients', { limit, offset, sort, order, query }],
  queryFn: () => fetchPatients({ limit, offset, sort, order, query }),
});
```

#### Step 4: Add Mutations
```typescript
// Create patient mutation
const createMutation = useMutation({
  mutationFn: (newPatient) => fetch('/api/patients', {
    method: 'POST',
    body: JSON.stringify(newPatient),
  }),
  onMutate: async (newPatient) => {
    // Optimistic update
    await queryClient.cancelQueries(['patients']);
    const previous = queryClient.getQueryData(['patients']);
    queryClient.setQueryData(['patients'], (old) => ({
      ...old,
      rows: [newPatient, ...old.rows],
    }));
    return { previous };
  },
  onError: (err, newPatient, context) => {
    // Rollback on error
    queryClient.setQueryData(['patients'], context.previous);
  },
  onSettled: () => {
    // Refetch to ensure consistency
    queryClient.invalidateQueries(['patients']);
  },
});
```

---

### Testing Checklist

When implementing cache invalidation/optimistic updates:

- [ ] Test successful mutation (happy path)
- [ ] Test failed mutation (error handling)
- [ ] Test network timeout (loading states)
- [ ] Test concurrent mutations (race conditions)
- [ ] Test cache consistency after rollback
- [ ] Test UI feedback (loading, success, error)
- [ ] Test with slow network (throttling)
- [ ] Test with offline mode
- [ ] Test cache size limits
- [ ] Test memory leaks (long sessions)

---

### Key Files Reference

| File | Purpose | Lines of Interest |
|------|---------|-------------------|
| `app/page.tsx` | Virtual table page | 181-321 (data fetching), 507-514 (cache clearing) |
| `app/c-form/page.tsx` | Patient form | 178-187 (form submission) |
| `app/c-form/components/FormContext.tsx` | Form state management | 447-841 (all state operations) |
| `lib/api/patientApi.ts` | API client | 50-114 (fetchPatients function) |
| `app/api/patients/route.ts` | List endpoint | 4-66 (GET handler) |
| `app/api/patients/[id]/route.ts` | Detail endpoint | 4-35 (GET handler) |
| `components/VirtualTable.tsx` | Virtual table component | 85-240 (main component) |

---

**Last Updated**: 2025-11-02  
**Version**: 1.0  
**Status**: Reference Document

