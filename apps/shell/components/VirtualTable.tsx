// ============================================================================
// VIRTUAL TABLE COMPONENT
// ============================================================================
// Generic, reusable virtual table component that can render large datasets
// efficiently using custom virtualization logic.
//
// KEY FEATURES:
// - Generic type support (works with any data type)
// - Dynamic row heights (supports variable content)
// - Sortable columns
// - Custom row rendering
// - Performance optimized (60 FPS scrolling)
// ============================================================================

import { useVirtualization } from '../lib/virtualization/useVirtualization';
import { TableHeader } from './TableHeader';
import type { TableColumn } from '@virtual-table/database';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

type VirtualTableProps<T> = {
  // Data props
  data: T[];                              // Full dataset to render
  getItemId: (item: T) => string;         // Function to extract unique ID from each item

  // Column configuration
  columns: TableColumn<T>[];              // Column definitions (header, render function, etc.)

  // Sorting props (optional)
  sortColumn?: string;                    // Currently sorted column key
  sortOrder?: 'asc' | 'desc';             // Sort direction (ascending/descending)
  onSort?: (columnKey: string) => void;   // Sort handler callback

  // Virtualization config (optional)
  defaultRowHeight?: number;              // Default row height in pixels (default: 48px)
  overscan?: number;                      // Overscan buffer: extra rows to render above/below viewport (default: 5)
  estimateRowHeight?: (item: T) => number; // Height estimator function for dynamic row heights

  // Infinite scroll props (optional)
  onLoadMore?: () => Promise<void>;       // Async function to load more data (scroll down)
  loadMoreThreshold?: number;             // Threshold (0-1) to trigger load more (default: 0.5 = 50%)
  onLoadPrevious?: () => Promise<void>;   // Async function to load previous data (scroll up)
  loadPreviousThreshold?: number;         // Threshold (0-1) to trigger load previous (default: 0.25 = 25%)

  // Container styling (optional)
  maxHeight?: string;                     // Max height of scrollable area (default: "600px")
  className?: string;                     // Additional CSS classes for customization

  // Loading state (optional)
  loading?: boolean;                      // Show loading indicator when fetching data
};

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================

/**
 * VirtualTable - Generic virtual table component
 * 
 * EXECUTION FLOW:
 * 1. Receives data and configuration props
 * 2. Calls useVirtualization hook to calculate visible rows
 * 3. Renders table structure with:
 *    - Sortable header (TableHeader component)
 *    - Virtualized tbody with absolute positioning
 *    - Only visible rows (15-20 out of potentially 100,000+)
 * 4. Attaches scroll handler and measurement callbacks
 * 5. Updates on scroll, maintaining 60 FPS performance
 * 
 * USAGE EXAMPLE:
 * ```tsx
 * <VirtualTable
 *   data={patients}
 *   getItemId={(p) => p.id}
 *   columns={patientColumns}
 *   sortColumn="name"
 *   sortOrder="asc"
 *   onSort={handleSort}
 *   estimateRowHeight={(p) => estimatePatientRowHeight(p)}
 * />
 * ```
 */
export function VirtualTable<T>({
  data,
  getItemId,
  columns,
  sortColumn,
  sortOrder,
  onSort,
  defaultRowHeight = 48,
  overscan = 5,
  estimateRowHeight,
  onLoadMore,
  loadMoreThreshold = 0.5,
  onLoadPrevious,
  loadPreviousThreshold = 0.25,
  maxHeight = "600px",
  className = "",
  loading = false,
}: VirtualTableProps<T>) {

  // ==========================================================================
  // STEP 1: INITIALIZE VIRTUALIZATION
  // ==========================================================================
  // 1.1 - Call useVirtualization hook with configuration
  // 1.2 - Hook returns:
  //       - virtualWindow: Calculated visible range and offsets
  //       - visibleRows: Subset of data to render (only visible items)
  //       - handleScroll: Optimized scroll handler (RAF throttled)
  //       - measureRowHeight: Height measurement callback
  //       - containerRef: Ref for scrollable container
  //
  // useVirtualization: Custom hook that implements virtual scrolling
  // - Calculates which rows are visible based on scroll position
  // - Returns only visible rows to render (e.g., 15-20 out of 100,000)
  // - Uses requestAnimationFrame to throttle scroll events for 60 FPS
  //
  // INFINITE SCROLL HANDLING (BIDIRECTIONAL):
  // - We pass a custom onScrollProgress callback that checks both thresholds
  // - When progress > loadMoreThreshold (default 0.5 = 50%), trigger onLoadMore (scroll down)
  // - When progress < loadPreviousThreshold (default 0.25 = 25%), trigger onLoadPrevious (scroll up)
  // - This makes VirtualTable self-contained for bidirectional infinite scroll logic
  const {
    virtualWindow,
    visibleRows,
    handleScroll,
    measureRowHeight,
    containerRef,
  } = useVirtualization({
    items: data,
    getItemId,
    defaultRowHeight,
    overscan,
    estimateRowHeight,
    onScrollProgress: (onLoadMore || onLoadPrevious) ? (progress: number) => {
      // Downward scroll: Load more data when progress exceeds threshold
      if (onLoadMore && progress > loadMoreThreshold) {
        onLoadMore();
      }
      // Upward scroll: Load previous data when progress is below threshold
      if (onLoadPrevious && progress < loadPreviousThreshold) {
        onLoadPrevious();
      }
    } : undefined,
  });

  // ==========================================================================
  // STEP 2: RENDER TABLE STRUCTURE
  // ==========================================================================
  return (
    <div className={`bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* ====================================================================
          STEP 2.1: SCROLLABLE CONTAINER
          ====================================================================
          - ref={containerRef}: Allows hook to measure container height
          - onScroll={handleScroll}: Triggers virtualization recalculation
          - maxHeight: Limits viewport size (creates scrollable area)
          - overflow-auto: Enables scrolling when content exceeds maxHeight
      */}
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ maxHeight }}
        onScroll={handleScroll}
      >
        <table
          className="min-w-full divide-y divide-gray-200"
          style={{
            // CRITICAL: Use fixed table layout for column alignment
            // This ensures all rows use the same column widths
            // Without this, each absolutely-positioned row calculates its own widths
            tableLayout: 'fixed'
          }}
        >
          {/* ================================================================
              STEP 2.2: TABLE HEADER
              ================================================================
              - Renders sortable column headers
              - Sticky positioning keeps header visible during scroll
              - Shows sort indicators (↑/↓) for active column
          */}
          <TableHeader
            columns={columns}
            sortColumn={sortColumn}
            sortOrder={sortOrder}
            onSort={onSort}
          />

          {/* ================================================================
              STEP 2.3: VIRTUALIZED TABLE BODY
              ================================================================
              This is where the virtualization magic happens:
              
              - position: 'relative' - Creates positioning context for absolute children
              - height: virtualWindow.totalHeight - Sets total scrollable height
                Example: 100,000 rows * 48px = 4,800,000px total height
                This ensures scrollbar reflects full dataset size
              
              - Only visibleRows are rendered (typically 15-20 rows)
              - Each row is positioned absolutely at its calculated offset
              - As user scrolls, different rows are rendered/unmounted
          */}
          <tbody 
            className="bg-white divide-y divide-gray-200" 
            style={{ 
              position: 'relative', 
              height: `${virtualWindow.totalHeight}px` 
            }}
          >
            {visibleRows.map((item, idx) => {
              // ============================================================
              // STEP 2.3.1: CALCULATE ROW POSITION
              // ============================================================
              // - actualIndex: Index in full dataset (not visible subset)
              // - topOffset: Absolute top position from offsets array
              // - rowId: Unique identifier for this row
              const actualIndex = virtualWindow.startIndex + idx;
              const topOffset = virtualWindow.offsets[actualIndex];
              const rowId = getItemId(item);

              return (
                <tr
                  key={rowId}
                  ref={(el) => measureRowHeight(rowId, el)}
                  className="hover:bg-slate-50 transition-colors"
                  style={{
                    // ==================================================
                    // ABSOLUTE POSITIONING
                    // ==================================================
                    // This is critical for virtualization:
                    // - position: 'absolute' - Removes from normal flow
                    // - top: topOffset - Positions at calculated offset
                    // - left/right: 0 - Spans full width
                    // - width: '100%' - Ensures proper layout
                    //
                    // EXAMPLE:
                    // Row 0: top: 0px
                    // Row 1: top: 48px
                    // Row 2: top: 96px (if row 1 was 48px tall)
                    // Row 2: top: 228px (if row 1 was 180px tall - expanded)
                    position: 'absolute',
                    top: `${topOffset}px`,
                    left: 0,
                    right: 0,
                    width: '100%',
                  }}
                >
                  {/* ================================================
                      STEP 2.3.2: RENDER CELLS
                      ================================================
                      - Iterate through column definitions
                      - Call column.render(item) to get cell content
                      - Apply column-specific styling
                      - Apply explicit width for column alignment
                  */}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 text-sm ${column.className || ''}`}
                      style={{
                        // Apply explicit width to match header columns
                        // This ensures perfect alignment across all rows
                        width: column.width,
                      }}
                    >
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ==================================================================
            STEP 2.4: LOADING INDICATOR
            ==================================================================
            - Shows spinner when loading prop is true
            - Displayed below the table content
        */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// VISUAL REPRESENTATION OF VIRTUALIZATION
// ============================================================================
//
// FULL DATASET (100,000 rows):
// ┌─────────────────────────────────────────────────────────────────┐
// │ Row 0     (offset: 0px)                                         │
// │ Row 1     (offset: 48px)                                        │
// │ Row 2     (offset: 96px)                                        │
// │ ...                                                             │
// │ Row 99,999 (offset: 4,799,952px)                                │
// └─────────────────────────────────────────────────────────────────┘
//
// WHAT USER SEES (viewport = 600px):
// ┌─────────────────────────────────────────────────────────────────┐
// │ ┌─────────────────────────────────────────────────────────────┐ │
// │ │ Row 95  (overscan buffer - not visible)                     │ │
// │ │ Row 96  (overscan buffer - not visible)                     │ │
// │ │ Row 97  (overscan buffer - not visible)                     │ │
// │ │ Row 98  (overscan buffer - not visible)                     │ │
// │ │ Row 99  (overscan buffer - not visible)                     │ │
// │ ├─────────────────────────────────────────────────────────────┤ │ ← Viewport top
// │ │ Row 100 (visible)                                           │ │
// │ │ Row 101 (visible)                                           │ │
// │ │ Row 102 (visible)                                           │ │
// │ │ ...                                                         │ │
// │ │ Row 112 (visible)                                           │ │
// │ ├─────────────────────────────────────────────────────────────┤ │ ← Viewport bottom
// │ │ Row 113 (overscan buffer - not visible)                     │ │
// │ │ Row 114 (overscan buffer - not visible)                     │ │
// │ │ Row 115 (overscan buffer - not visible)                     │ │
// │ │ Row 116 (overscan buffer - not visible)                     │ │
// │ │ Row 117 (overscan buffer - not visible)                     │ │
// │ └─────────────────────────────────────────────────────────────┘ │
// └─────────────────────────────────────────────────────────────────┘
//
// WHAT'S RENDERED IN DOM:
// - Only rows 95-117 (23 rows total)
// - Rows 0-94 and 118-99,999 are NOT in the DOM
// - Total DOM nodes: 23 <tr> elements instead of 100,000
// - Memory savings: ~99.98% reduction in DOM nodes
// - Performance: Constant render time regardless of dataset size
//
// ============================================================================

