// ============================================================================
// PATIENTS PAGE SKELETON - LOADING FALLBACK
// ============================================================================
// This component displays a skeleton/placeholder UI while the Server Component
// is fetching initial patient data. It's used as a Suspense fallback.
//
// STREAMING SSR:
// - Next.js streams this skeleton to the client immediately
// - User sees instant feedback (no blank screen)
// - Once server data is ready, React replaces skeleton with actual content
// - This enables progressive rendering and better perceived performance
//
// DESIGN:
// - Matches the layout of the actual PatientsPageClient component
// - Uses animated pulse effect for visual feedback
// - Lightweight and fast to render
// ============================================================================

export default function PatientsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="mt-1 h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Search Bar Skeleton */}
          <div className="mb-4 h-10 bg-gray-200 rounded-lg animate-pulse"></div>

          {/* Table Skeleton */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            {/* Table Header Skeleton */}
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
              <div className="flex gap-4">
                <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 flex-1 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Table Rows Skeleton */}
            <div className="divide-y divide-gray-200">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="px-6 py-4">
                  <div className="flex gap-4">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 flex-1 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics Skeleton */}
          <div className="mt-4 bg-white shadow-sm border border-gray-200 rounded-lg px-6 py-3">
            <div className="flex gap-6">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

