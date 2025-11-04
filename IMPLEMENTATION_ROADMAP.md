# Cache Invalidation & Optimistic Updates - Implementation Roadmap

## 🎯 Executive Summary

This document provides a phased implementation plan for adding cache invalidation strategies and optimistic UI updates to the virtual table and C-form components.

**Current State**: Manual cache management with no mutation endpoints  
**Goal State**: Robust caching with optimistic updates for all CRUD operations  
**Estimated Effort**: 3-5 days (depending on approach)

---

## 📊 Analysis Summary

### What We Found

#### ✅ Already Implemented
1. **Manual cache clearing** on search/sort changes
2. **Cache cleanup** for sliding window memory management
3. **Optimistic form updates** (local state only, no server sync)

#### ❌ Missing
1. **Mutation API endpoints** (POST, PUT, DELETE)
2. **Optimistic updates** for server mutations
3. **Structured cache invalidation** strategy
4. **Error handling** for failed mutations
5. **Rollback mechanisms** for optimistic updates

#### 🔍 Key Insights
- Form operations are already optimistic (instant UI feedback)
- Virtual table has basic caching but no mutation support
- No data fetching library (React Query, SWR) currently used
- Cache grows indefinitely (no size limits or TTL)

---

## 🗺️ Implementation Phases

### Phase 1: Foundation (Day 1)
**Goal**: Create mutation API endpoints

#### Tasks
1. **Create Patient Endpoint**
   - File: `app/api/patients/route.ts`
   - Add `POST` handler
   - Validate input with Yup schema
   - Insert into SQLite database
   - Return created patient with ID

2. **Update Patient Endpoint**
   - File: `app/api/patients/[id]/route.ts`
   - Add `PUT` handler
   - Validate input
   - Update database record
   - Return updated patient

3. **Delete Patient Endpoint**
   - File: `app/api/patients/[id]/route.ts`
   - Add `DELETE` handler
   - Delete from database
   - Return success status

#### Acceptance Criteria
- [ ] All endpoints return proper HTTP status codes
- [ ] Input validation works correctly
- [ ] Database operations are atomic
- [ ] Error responses include helpful messages
- [ ] Endpoints tested with curl/Postman

---

### Phase 2A: Manual Cache Invalidation (Day 2)
**Goal**: Implement cache invalidation without library

**Choose this if**: You want to keep current architecture

#### Tasks
1. **Enhance Cache Structure**
   ```typescript
   // Current: Simple Map
   const dataCache = useRef<Map<string, PatientRecord>>(new Map());
   
   // Enhanced: Query-based cache
   const dataCache = useRef<Map<string, CacheEntry>>(new Map());
   
   type CacheEntry = {
     data: PatientRecord[];
     timestamp: number;
     queryKey: string;
   };
   ```

2. **Add Cache Invalidation Helpers**
   ```typescript
   const invalidateCache = (pattern: string) => {
     for (const [key, value] of dataCache.current.entries()) {
       if (key.includes(pattern)) {
         dataCache.current.delete(key);
       }
     }
   };
   ```

3. **Implement Optimistic Updates**
   - Create patient: Add temp record → POST → Replace with real ID
   - Update patient: Update local → PUT → Revert on error
   - Delete patient: Remove local → DELETE → Re-add on error

#### Acceptance Criteria
- [ ] Cache invalidates on mutations
- [ ] Optimistic updates provide instant feedback
- [ ] Rollback works on errors
- [ ] Cache size is limited (LRU eviction)
- [ ] TTL prevents stale data

---

### Phase 2B: React Query Migration (Day 2-3)
**Goal**: Migrate to React Query for automatic cache management

**Choose this if**: You want industry-standard solution

#### Tasks
1. **Install Dependencies**
   ```bash
   npm install @tanstack/react-query @tanstack/react-query-devtools
   ```

2. **Setup Query Client**
   - Create `app/providers.tsx`
   - Wrap app with `QueryClientProvider`
   - Add devtools in development

3. **Convert Data Fetching**
   - Replace `loadPatients` with `useQuery`
   - Replace manual cache with query cache
   - Remove `dataCache` ref

4. **Add Mutations**
   - Create `useCreatePatient` mutation
   - Create `useUpdatePatient` mutation
   - Create `useDeletePatient` mutation
   - Implement optimistic updates in `onMutate`
   - Implement rollback in `onError`

#### Acceptance Criteria
- [ ] All data fetching uses `useQuery`
- [ ] All mutations use `useMutation`
- [ ] Optimistic updates work correctly
- [ ] Rollback works on errors
- [ ] Devtools show cache state
- [ ] No manual cache management code remains

---

### Phase 3: Form Integration (Day 3-4)
**Goal**: Connect C-form to patient creation endpoint

#### Tasks
1. **Update Form Submission**
   ```typescript
   // Current: Demo only
   const handleSubmit = (values: FormValues) => {
     console.log(values);
     alert('Success!');
   };
   
   // New: API integration
   const handleSubmit = async (values: FormValues) => {
     try {
       const response = await fetch('/api/patients', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(values),
       });
       
       if (!response.ok) throw new Error('Failed to create patient');
       
       const newPatient = await response.json();
       
       // Invalidate patient list cache
       // (Manual or React Query)
       
       // Show success message
       // Redirect to patient list
     } catch (error) {
       // Show error message
     }
   };
   ```

2. **Add Loading States**
   - Show spinner during submission
   - Disable form during submission
   - Show success/error messages

3. **Add Optimistic Update**
   - Add temp patient to virtual table immediately
   - Replace with real patient on success
   - Remove on error

#### Acceptance Criteria
- [ ] Form submits to API endpoint
- [ ] Loading states work correctly
- [ ] Success/error messages display
- [ ] Virtual table updates immediately
- [ ] Rollback works on errors

---

### Phase 4: Virtual Table Mutations (Day 4-5)
**Goal**: Add edit/delete functionality to virtual table

#### Tasks
1. **Add Edit Button to Table**
   - Add "Edit" button to each row
   - Open modal/drawer with form
   - Pre-populate with current values
   - Submit updates to PUT endpoint

2. **Add Delete Button to Table**
   - Add "Delete" button to each row
   - Show confirmation dialog
   - Submit to DELETE endpoint
   - Remove from table optimistically

3. **Add Bulk Operations**
   - Add checkboxes to select multiple rows
   - Add "Delete Selected" button
   - Implement bulk delete with optimistic updates

#### Acceptance Criteria
- [ ] Edit button opens form with current data
- [ ] Updates save to database
- [ ] Delete removes from table immediately
- [ ] Confirmation prevents accidental deletes
- [ ] Bulk operations work correctly
- [ ] All operations have loading states

---

### Phase 5: Polish & Testing (Day 5)
**Goal**: Ensure production-ready quality

#### Tasks
1. **Error Handling**
   - Add toast notifications for success/error
   - Add retry logic for failed requests
   - Add offline detection
   - Add network error messages

2. **Loading States**
   - Add skeleton loaders
   - Add progress indicators
   - Add optimistic UI indicators (e.g., opacity)

3. **Testing**
   - Test all happy paths
   - Test all error paths
   - Test concurrent mutations
   - Test slow network conditions
   - Test offline mode
   - Test cache consistency

4. **Documentation**
   - Update README with new features
   - Document API endpoints
   - Add code comments
   - Create user guide

#### Acceptance Criteria
- [ ] All error cases handled gracefully
- [ ] Loading states provide clear feedback
- [ ] All tests pass
- [ ] Documentation is complete
- [ ] Code is reviewed and approved

---

## 🔀 Decision Matrix

### Should I use React Query or Manual Cache?

| Factor | Manual Cache | React Query | Winner |
|--------|--------------|-------------|--------|
| **Learning curve** | Low (you already know it) | Medium (new library) | Manual |
| **Maintenance** | High (custom code) | Low (battle-tested) | React Query |
| **Features** | Basic (what you build) | Rich (built-in) | React Query |
| **Bundle size** | 0 KB | ~13 KB gzipped | Manual |
| **Development time** | Longer (build everything) | Shorter (use built-in) | React Query |
| **Community support** | None (custom code) | Large (popular library) | React Query |
| **Debugging** | Manual logging | DevTools included | React Query |
| **Future-proof** | Depends on you | Industry standard | React Query |

**Recommendation**: Use React Query unless bundle size is critical

---

## 📝 Code Examples

### Example 1: Create Patient with Manual Cache

```typescript
// app/page.tsx
const createPatient = async (patientData: FormValues) => {
  // Generate temp ID
  const tempId = `temp-${Date.now()}`;
  const tempPatient = { id: tempId, ...patientData };
  
  // Optimistic update
  setPatients(prev => [tempPatient, ...prev]);
  dataCache.current.set(tempId, tempPatient);
  setTotalCount(prev => prev + 1);
  
  try {
    // API call
    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });
    
    if (!response.ok) throw new Error('Failed to create patient');
    
    const newPatient = await response.json();
    
    // Replace temp with real
    setPatients(prev => prev.map(p => 
      p.id === tempId ? newPatient : p
    ));
    dataCache.current.delete(tempId);
    dataCache.current.set(newPatient.id, newPatient);
    
    return newPatient;
  } catch (error) {
    // Rollback on error
    setPatients(prev => prev.filter(p => p.id !== tempId));
    dataCache.current.delete(tempId);
    setTotalCount(prev => prev - 1);
    throw error;
  }
};
```

### Example 2: Create Patient with React Query

```typescript
// hooks/useCreatePatient.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreatePatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (patientData: FormValues) => {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      });
      
      if (!response.ok) throw new Error('Failed to create patient');
      return response.json();
    },
    
    onMutate: async (newPatient) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['patients'] });
      
      // Snapshot previous value
      const previous = queryClient.getQueryData(['patients']);
      
      // Optimistically update
      queryClient.setQueryData(['patients'], (old: any) => ({
        ...old,
        total: old.total + 1,
        rows: [{ id: `temp-${Date.now()}`, ...newPatient }, ...old.rows],
      }));
      
      return { previous };
    },
    
    onError: (err, newPatient, context) => {
      // Rollback on error
      queryClient.setQueryData(['patients'], context?.previous);
    },
    
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

// Usage in component
const createMutation = useCreatePatient();

const handleSubmit = async (values: FormValues) => {
  try {
    await createMutation.mutateAsync(values);
    toast.success('Patient created!');
  } catch (error) {
    toast.error('Failed to create patient');
  }
};
```

---

## ✅ Success Metrics

After implementation, you should see:

1. **User Experience**
   - ✅ Instant feedback on all actions (< 50ms perceived latency)
   - ✅ Clear loading states during network requests
   - ✅ Helpful error messages on failures
   - ✅ Smooth rollback on errors (no jarring UI changes)

2. **Performance**
   - ✅ No unnecessary API calls (proper caching)
   - ✅ Fast UI updates (optimistic updates)
   - ✅ Controlled memory usage (cache limits)
   - ✅ 60 FPS maintained during mutations

3. **Code Quality**
   - ✅ Clear separation of concerns
   - ✅ Reusable mutation hooks
   - ✅ Comprehensive error handling
   - ✅ Well-documented code

---

## 🚀 Next Steps

1. **Review this roadmap** with your team
2. **Choose approach**: Manual cache vs React Query
3. **Prioritize phases**: Which features are most important?
4. **Set timeline**: When do you want this completed?
5. **Assign tasks**: Who will work on each phase?
6. **Start with Phase 1**: Create API endpoints first

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-02  
**Status**: Ready for Review

