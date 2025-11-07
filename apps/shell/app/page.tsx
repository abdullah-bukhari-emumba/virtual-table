// ============================================================================
// PATIENT VIRTUAL TABLE - SERVER COMPONENT (MAIN PAGE)
// ============================================================================
// This is the main page component that demonstrates high-performance virtual
// table rendering with 100,000+ patient records.
//
// MULTI-ZONE ARCHITECTURE:
// - This is the SHELL ZONE (main zone) that hosts the patient virtual table
// - Routes to other zones (e.g., /forms) are handled via rewrites in next.config.ts
// - Cross-zone navigation uses <a> tags instead of Next.js <Link>
//
// ARCHITECTURE (Server Components + Streaming SSR + Partial Hydration):
// - This component is an ASYNC SERVER COMPONENT (no 'use client')
// - Fetches initial patient data directly from database (no HTTP overhead)
// - Passes initial data to Client Component via props
// - Wrapped in Suspense boundary for streaming SSR
// - Only the interactive Client Component hydrates on the client
// ============================================================================

import { Suspense } from 'react';
import { getInitialPatients } from '@virtual-table/database';
import PatientsPageClient from '@/components/PatientsPageClient';
import PatientsPageSkeleton from '@/components/PatientsPageSkeleton';

export default async function Home() {
  // Fetch initial patient data directly from database
  // This runs ONLY on the server, never on the client
  const Initial_Patient_Count = 50;
  const initialData = await getInitialPatients(Initial_Patient_Count, 'last_visit_date', 'desc');

  return (
    <Suspense fallback={<PatientsPageSkeleton />}>
      <PatientsPageClient initialData={initialData} />
    </Suspense>
  );
}

