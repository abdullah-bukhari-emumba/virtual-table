// ============================================================================
// VIRTUALIZATION TYPE DEFINITIONS
// ============================================================================
// This file contains all TypeScript types used throughout the virtualization
// system. These types are framework-agnostic and can be reused across
// different table implementations.
// ============================================================================

// ============================================================================
// PATIENT RECORD TYPES
// ============================================================================

/**
 * PatientRecord - Represents a single patient record from the API
 * 
 * IMPORTANT: This now includes the FULL summary (not preview) because we
 * changed the API behavior to return complete summaries in the list endpoint.
 * 
 * Fields:
 * - id: Unique identifier (UUID format)
 * - name: Patient full name
 * - mrn: Medical Record Number (alphanumeric)
 * - last_visit_date: ISO date string (YYYY-MM-DD)
 * - summary: FULL patient summary (12 to 2000+ characters)
 */
export type PatientRecord = {
  id: string;
  name: string;
  mrn: string;
  last_visit_date: string;
  summary: string; // Full summary, not preview
};

// ============================================================================
// SORTING TYPES
// ============================================================================

/**
 * SortColumn - Columns that can be sorted
 * 
 * These correspond to the sortable fields in the PatientRecord type.
 * The API endpoint supports sorting by these columns.
 */
export type SortColumn = 'name' | 'mrn' | 'last_visit_date';

/**
 * SortOrder - Sort direction
 * 
 * - 'asc': Ascending order (A-Z, 0-9, oldest-newest)
 * - 'desc': Descending order (Z-A, 9-0, newest-oldest)
 */
export type SortOrder = 'asc' | 'desc';

// ============================================================================
// VIRTUALIZATION TYPES
// ============================================================================

/**
 * VirtualWindow - Result of virtualization calculation
 * 
 * This is the core data structure returned by the virtualization algorithm.
 * It tells the renderer which rows to display and where to position them.
 * 
 * Fields:
 * - startIndex: First row to render (includes overscan buffer)
 * - endIndex: Last row to render (includes overscan buffer)
 * - totalHeight: Total scrollable height in pixels (sum of all row heights)
 * - offsets: Array of top positions for each row (for absolute positioning)
 * 
 * Example:
 * If we have 1000 rows and user scrolled to row 100:
 * {
 *   startIndex: 95,      // Row 100 minus 5 overscan
 *   endIndex: 118,       // Visible rows plus 5 overscan
 *   totalHeight: 48000,  // 1000 rows * 48px average
 *   offsets: [0, 48, 96, 144, ...] // Cumulative heights
 * }
 */
export type VirtualWindow = {
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsets: number[];
};

/**
 * RowHeightGetter - Function type for calculating row heights
 * 
 * This function is called during virtualization to determine the height
 * of each row. It can return:
 * - Cached height (if row was previously measured)
 * - Estimated height (based on content length)
 * - Default height (fallback)
 * 
 * @param rowId - Unique identifier for the row
 * @returns Height in pixels
 */
export type RowHeightGetter = (rowId: string) => number;

/**
 * VirtualizationConfig - Configuration for virtualization behavior
 * 
 * These parameters control how the virtualization algorithm works.
 * 
 * Fields:
 * - defaultRowHeight: Default height for unmeasured rows (typically 48px)
 * - overscan: Number of extra rows to render above/below viewport
 *             Higher values = smoother scrolling but more DOM nodes
 *             Recommended: 3-10 rows
 * - containerHeight: Height of the scrollable container in pixels
 * - scrollTop: Current scroll position in pixels
 */
export type VirtualizationConfig = {
  defaultRowHeight: number;
  overscan: number;
  containerHeight: number;
  scrollTop: number;
};

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * PatientsApiResponse - Response from the list endpoint
 * 
 * The API returns paginated results with total count.
 * 
 * Example response:
 * {
 *   total: 100000,
 *   rows: [
 *     { id: "...", name: "John Doe", mrn: "12345", ... },
 *     { id: "...", name: "Jane Smith", mrn: "67890", ... },
 *     ...
 *   ]
 * }
 */
export type PatientsApiResponse = {
  total: number;
  rows: PatientRecord[];
};

/**
 * FetchPatientsParams - Parameters for fetching patients
 * 
 * These parameters are passed to the API endpoint as query strings.
 * 
 * Fields:
 * - limit: Number of records to fetch (default: 200)
 * - offset: Starting position for pagination (default: 0)
 * - sort: Column to sort by (default: 'last_visit_date')
 * - order: Sort direction (default: 'desc')
 * - query: Search query for filtering (optional)
 */
export type FetchPatientsParams = {
  limit?: number;
  offset?: number;
  sort?: SortColumn;
  order?: SortOrder;
  query?: string;
};

// ============================================================================
// TABLE COLUMN TYPES (for generic VirtualTable component)
// ============================================================================

/**
 * TableColumn - Generic column definition for VirtualTable
 * 
 * This allows the VirtualTable component to be reusable with any data type.
 * 
 * Type parameter T: The row data type (e.g., PatientRecord)
 * 
 * Fields:
 * - key: Unique identifier for the column
 * - label: Display text in header
 * - sortable: Whether this column can be sorted
 * - sortKey: The field name to sort by (if different from key)
 * - render: Custom render function for cell content
 * - className: Optional CSS classes for the column
 */
export type TableColumn<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  sortKey?: keyof T;
  render: (row: T) => React.ReactNode;
  className?: string;
};

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

/**
 * UseVirtualizationReturn - Return value from useVirtualization hook
 * 
 * This hook encapsulates all virtualization logic and returns everything
 * needed to render a virtual table.
 * 
 * Fields:
 * - virtualWindow: Calculated visible range and offsets
 * - visibleRows: Subset of rows to actually render
 * - handleScroll: Scroll event handler (uses requestAnimationFrame)
 * - measureRowHeight: Callback to measure and cache row heights
 * - containerRef: Ref to attach to scrollable container
 */
export type UseVirtualizationReturn<T> = {
  virtualWindow: VirtualWindow;
  visibleRows: T[];
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  measureRowHeight: (rowId: string, element: HTMLElement | null) => void;
  containerRef: React.RefObject<HTMLDivElement>;
};

