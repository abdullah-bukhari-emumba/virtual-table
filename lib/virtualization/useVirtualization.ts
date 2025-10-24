// ============================================================================
// CUSTOM VIRTUALIZATION HOOK
// ============================================================================
// This hook encapsulates all virtualization logic for rendering large lists
// efficiently. It calculates which rows are visible, manages row heights,
// and handles scroll events with optimal performance.
//
// KEY FEATURES:
// - Dynamic row heights (supports variable content lengths)
// - Overscan buffer (renders extra rows for smooth scrolling)
// - requestAnimationFrame optimization (maintains 60 FPS)
// - Height caching (avoids redundant measurements)
// - Framework-agnostic algorithm (can be adapted to other frameworks)
// ============================================================================

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import type { VirtualWindow, RowHeightGetter } from './types';

// ============================================================================
// HOOK PARAMETERS TYPE
// ============================================================================

type UseVirtualizationParams<T> = {
  items: T[];                           // Full dataset (e.g., all 100,000 patient records)
  getItemId: (item: T) => string;       // Function to extract unique ID from each item
  defaultRowHeight?: number;            // Default height for unmeasured rows in pixels (default: 48px)
  overscan?: number;                    // Overscan: extra rows to render above/below viewport for smooth scrolling (default: 5)
  estimateRowHeight?: (item: T) => number; // Optional function to estimate height based on content length
  onScrollProgress?: (progress: number) => void; // Optional callback for infinite scroll (receives 0-1 progress)
};

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useVirtualization<T>({
  items,
  getItemId,
  defaultRowHeight = 48,
  overscan = 5,
  estimateRowHeight,
  onScrollProgress,
}: UseVirtualizationParams<T>) {
  
  // ==========================================================================
  // STEP 1: STATE INITIALIZATION
  // ==========================================================================
  // 1.1 - scrollTop: Current scroll position in pixels (0 = top of list)
  // 1.2 - containerHeight: Height of visible viewport in pixels (typically 600px)
  // 1.3 - These values are updated on scroll and trigger virtualization recalculation
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  // ==========================================================================
  // STEP 2: REF INITIALIZATION
  // ==========================================================================
  // 2.1 - containerRef: Reference to the scrollable container DOM element
  //       Used to measure container height and attach scroll listener
  const containerRef = useRef<HTMLDivElement>(null);

  // 2.2 - rowHeightCache: Map storing measured heights for each row
  //       Key: row ID (string), Value: height in pixels (number)
  //       This cache persists across re-renders to avoid re-measuring
  //       Example: Map { "patient-123" => 180, "patient-456" => 48 }
  const rowHeightCache = useRef<Map<string, number>>(new Map());

  // 2.3 - rowRefs: Map storing DOM element references for each rendered row
  //       Used to measure actual heights after render
  //       Example: Map { "patient-123" => <tr> element }
  const rowRefs = useRef<Map<string, HTMLElement>>(new Map());

  // 2.4 - rafRef: Reference to requestAnimationFrame ID
  //       requestAnimationFrame (RAF): Browser API that syncs callbacks with screen refresh (60 FPS)
  //       - Ensures smooth animations by running code before next repaint
  //       - Automatically throttles to monitor refresh rate (typically 60 Hz)
  //       - More efficient than setTimeout for visual updates
  //       Used to cancel pending animation frames when new scroll events arrive
  //       This prevents multiple RAF callbacks from queuing up
  const rafRef = useRef<number | undefined>(undefined);

  // ==========================================================================
  // STEP 3: ROW HEIGHT CALCULATION FUNCTION
  // ==========================================================================
  // This function determines the height of a row. It follows this priority:
  // 3.1 - Check cache first (fastest - O(1) lookup)
  // 3.2 - Use custom estimator if provided (fast - simple calculation)
  // 3.3 - Fall back to default height (fallback)
  //
  // WHY THIS MATTERS:
  // - Accurate heights are critical for correct scroll positioning
  // - Cached heights prevent layout thrashing
  // - Estimated heights provide good initial values before measurement
  const getRowHeight: RowHeightGetter = useCallback((rowId: string) => {
    // 3.1 - Check if we've already measured this row
    const cached = rowHeightCache.current.get(rowId);
    if (cached !== undefined) {
      return cached; // Return cached value (most accurate)
    }

    // 3.2 - If custom estimator provided, use it to estimate height
    //       This is useful for rows with variable content (e.g., long text)
    if (estimateRowHeight) {
      const item = items.find(i => getItemId(i) === rowId);
      if (item) {
        return estimateRowHeight(item);
      }
    }

    // 3.3 - Fall back to default height
    //       This is used for rows that haven't been rendered yet
    return defaultRowHeight;
  }, [items, getItemId, estimateRowHeight, defaultRowHeight]);

  // ==========================================================================
  // STEP 4: VIRTUALIZATION CALCULATION (CORE ALGORITHM)
  // ==========================================================================
  // This is the heart of the virtualization system. It calculates:
  // - Which rows should be rendered (startIndex to endIndex)
  // - Where each row should be positioned (offsets array)
  // - Total scrollable height (for correct scrollbar behavior)
  //
  // DEPENDENCIES:
  // - items: When data changes, recalculate everything
  // - scrollTop: When user scrolls, recalculate visible range
  // - containerHeight: When viewport resizes, recalculate visible range
  // - getRowHeight: When height calculation logic changes, recalculate
  //
  // PERFORMANCE: This runs on every scroll event, so it must be fast.
  // useMemo: React hook that memoizes (caches) expensive calculations
  // - Only recalculates when dependencies change
  // - Returns cached result if dependencies haven't changed
  // - Critical for performance: prevents recalculating on every render
  // - Without useMemo, this would run 60+ times per second during scrolling
  const virtualWindow: VirtualWindow = useMemo(() => {
    // ========================================================================
    // STEP 4.1: INITIALIZE VARIABLES
    // ========================================================================
    let currentOffset = 0;  // Running total of heights as we iterate through rows
    let startIndex = 0;     // First row to render (including overscan buffer)
    let endIndex = 0;       // Last row to render (including overscan buffer)

    // ========================================================================
    // STEP 4.2: FIND START INDEX
    // ========================================================================
    // Goal: Find the first row that intersects with the viewport top
    //
    // Algorithm:
    // - Iterate through all rows from top to bottom
    // - For each row, add its height to currentOffset
    // - When currentOffset + rowHeight > scrollTop, we found the first visible row
    // - Subtract overscan to include buffer rows above viewport
    //
    // VISUAL EXAMPLE (scrollTop = 500px, rowHeight = 48px):
    // Row 0:  offset 0-48     (currentOffset = 48)   < 500? Continue
    // Row 1:  offset 48-96    (currentOffset = 96)   < 500? Continue
    // ...
    // Row 10: offset 480-528  (currentOffset = 528)  > 500? FOUND!
    // startIndex = 10 - 5 (overscan) = 5
    for (let i = 0; i < items.length; i++) {  // i = index of current row being checked
      const rowId = getItemId(items[i]);
      const rowHeight = getRowHeight(rowId);

      // Check if this row intersects with viewport top
      if (currentOffset + rowHeight > scrollTop) {
        // Found first visible row - subtract overscan for buffer
        // overscan: extra rows rendered above viewport for smooth scrolling
        startIndex = Math.max(0, i - overscan);
        break;
      }

      currentOffset += rowHeight;  // Accumulate height for next iteration
    }

    // ========================================================================
    // STEP 4.3: FIND END INDEX
    // ========================================================================
    // Goal: Find the last row that intersects with the viewport bottom
    //
    // Algorithm:
    // - Reset currentOffset and iterate from top again
    // - For each row, add its height to currentOffset
    // - When currentOffset > scrollTop + containerHeight, we found the last visible row
    // - Add overscan to include buffer rows below viewport
    //
    // VISUAL EXAMPLE (scrollTop = 500px, containerHeight = 600px):
    // Viewport bottom = 500 + 600 = 1100px
    // Row 0:  offset 0-48     (currentOffset = 48)    < 1100? Continue
    // ...
    // Row 23: offset 1104-1152 (currentOffset = 1152) > 1100? FOUND!
    // endIndex = 23 + 5 (overscan) + 1 = 29
    currentOffset = 0;
    for (let i = 0; i < items.length; i++) {
      const rowId = getItemId(items[i]);
      const rowHeight = getRowHeight(rowId);
      currentOffset += rowHeight;

      // Check if we've passed viewport bottom
      if (currentOffset > scrollTop + containerHeight) {
        // Found last visible row - add overscan for buffer
        endIndex = Math.min(items.length, i + overscan + 1);
        break;
      }
    }

    // If we never found end (list is shorter than viewport), render all rows
    if (endIndex === 0) {
      endIndex = items.length;
    }

    // ========================================================================
    // STEP 4.4: CALCULATE TOTAL HEIGHT AND OFFSETS
    // ========================================================================
    // Goal: Calculate absolute position for each row
    //
    // Why we need this:
    // - Rows are positioned absolutely (position: absolute; top: Xpx)
    // - We need to know the exact top position for each row
    // - Total height determines scrollbar size
    //
    // Algorithm:
    // - Iterate through ALL rows (not just visible ones)
    // - For each row, store current totalHeight as its offset
    // - Add row height to totalHeight
    //
    // EXAMPLE (3 rows with heights 48, 180, 48):
    // Row 0: offset = 0,   totalHeight = 0 + 48 = 48
    // Row 1: offset = 48,  totalHeight = 48 + 180 = 228
    // Row 2: offset = 228, totalHeight = 228 + 48 = 276
    // Final totalHeight = 276px
    let totalHeight = 0;
    const offsets: number[] = [];

    for (let i = 0; i < items.length; i++) {
      // Store current totalHeight as this row's top position
      offsets.push(totalHeight);

      // Add this row's height to running total
      const rowId = getItemId(items[i]);
      const rowHeight = getRowHeight(rowId);
      totalHeight += rowHeight;
    }

    // ========================================================================
    // STEP 4.5: RETURN VIRTUALIZATION RESULT
    // ========================================================================
    return {
      startIndex,   // First row to render (e.g., 5)
      endIndex,     // Last row to render (e.g., 29)
      totalHeight,  // Total scrollable height (e.g., 48000px for 1000 rows)
      offsets,      // Array of top positions [0, 48, 96, ...]
    };
  }, [items, scrollTop, containerHeight, getRowHeight, overscan, getItemId]);

  // ==========================================================================
  // STEP 5: CALCULATE VISIBLE ROWS
  // ==========================================================================
  // Extract the subset of items that should actually be rendered
  // This is a simple array slice based on the calculated indices
  //
  // EXAMPLE:
  // items = [patient0, patient1, ..., patient999]
  // startIndex = 5, endIndex = 29
  // visibleRows = [patient5, patient6, ..., patient28]
  // Only these 24 rows will be rendered in the DOM
  //
  // useMemo: Caches the sliced array to avoid recreating it on every render
  // - Only recalculates when items or indices change
  // - Prevents unnecessary re-renders of child components
  const visibleRows = useMemo(() => {
    return items.slice(virtualWindow.startIndex, virtualWindow.endIndex);
  }, [items, virtualWindow.startIndex, virtualWindow.endIndex]);

  // ==========================================================================
  // STEP 6: SCROLL EVENT HANDLER
  // ==========================================================================
  // Handles scroll events with requestAnimationFrame optimization
  //
  // requestAnimationFrame (RAF): Browser API for smooth animations
  // - Syncs callbacks with screen refresh rate (typically 60 Hz = 60 FPS)
  // - Automatically pauses when tab is not visible (saves CPU/battery)
  // - Guarantees callback runs before next repaint (no visual tearing)
  //
  // WHY requestAnimationFrame?
  // - Scroll events fire very frequently (100+ times per second)
  // - Updating state on every event causes excessive re-renders
  // - RAF throttles updates to browser's repaint cycle (60 FPS)
  // - This prevents dropped frames and maintains smooth scrolling
  //
  // EXECUTION FLOW:
  // 6.1 - User scrolls
  // 6.2 - Browser fires scroll event
  // 6.3 - Cancel any pending RAF callback (prevents queue buildup)
  // 6.4 - Schedule new RAF callback
  // 6.5 - Browser calls callback before next repaint (~16ms later)
  // 6.6 - Update state with new scroll position
  // 6.7 - Component re-renders with new virtualWindow calculation
  //
  // useCallback: Memoizes this function to maintain stable reference
  // - Prevents VirtualTable from re-rendering when parent re-renders
  // - Critical for performance: scroll handler is called 100+ times/second
  // - Empty dependency array = function never changes
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;  // The scrollable div element

    // 6.3 - Cancel previous RAF if it hasn't executed yet
    // This prevents multiple RAF callbacks from queuing up during fast scrolling
    if (rafRef.current !== undefined) {
      cancelAnimationFrame(rafRef.current);
    }

    // 6.4 - Schedule new RAF callback
    // requestAnimationFrame: Syncs with browser repaint cycle for smooth 60 FPS
    rafRef.current = requestAnimationFrame(() => {
      // 6.6 - Update state (triggers re-render)
      setScrollTop(target.scrollTop);  // Current scroll position in pixels
      setContainerHeight(target.clientHeight);  // Viewport height in pixels
    });
  }, []); // Empty dependency array = stable function reference

  // ==========================================================================
  // STEP 7: SCROLL PROGRESS TRACKING (INFINITE SCROLL)
  // ==========================================================================
  // Calculates scroll progress and triggers callback for infinite scroll
  //
  // ALGORITHM:
  // 7.1 - Calculate which row index user is currently viewing
  // 7.2 - Calculate progress as: currentRowIndex / totalRows
  // 7.3 - If progress > 0.75 (75% threshold), trigger callback
  //
  // EXAMPLE:
  // - User has 200 rows loaded
  // - User scrolls to row 150
  // - Progress = 150 / 200 = 0.75 (75%)
  // - Callback fires → Load next 200 rows
  // - Now 400 rows loaded
  // - User scrolls to row 300
  // - Progress = 300 / 400 = 0.75 (75%)
  // - Callback fires → Load next 200 rows
  // - Continues until all data loaded
  //
  // WHY useEffect?
  // - We want to trigger callback when scroll position changes
  // - useEffect runs after render, so virtualWindow is up-to-date
  // - Dependency on scrollTop ensures it runs on every scroll
  useEffect(() => {
    if (!onScrollProgress || items.length === 0) {
      return;
    }

    // 7.1 - Find which row index is currently at the top of viewport
    // We use the startIndex from virtualWindow as a proxy for current position
    const currentRowIndex = virtualWindow.startIndex;

    // 7.2 - Calculate progress (0 to 1)
    const progress = currentRowIndex / items.length;

    // 7.3 - Trigger callback with progress
    onScrollProgress(progress);
  }, [scrollTop, items.length, virtualWindow.startIndex, onScrollProgress]);

  // ==========================================================================
  // STEP 8: ROW HEIGHT MEASUREMENT CALLBACK
  // ==========================================================================
  // This function is called after each row renders to measure its actual height
  //
  // WHY WE NEED THIS:
  // - Initial heights are estimates (we don't know actual height until render)
  // - After render, we measure actual height using getBoundingClientRect()
  // - We cache the measured height for future calculations
  // - This improves accuracy of scroll positioning over time
  //
  // EXECUTION FLOW:
  // 8.1 - Row renders with ref={(el) => measureRowHeight(rowId, el)}
  // 8.2 - React calls this function with the DOM element
  // 8.3 - We measure element.getBoundingClientRect().height
  // 8.4 - We cache the height in rowHeightCache
  // 8.5 - Next virtualization calculation uses cached height
  //
  // NOTE: This does NOT trigger re-render (ref updates are silent)
  const measureRowHeight = useCallback((rowId: string, element: HTMLElement | null) => {
    if (element) {
      // 8.2 - Store element reference
      rowRefs.current.set(rowId, element);

      // 8.3 - Measure actual height
      const height = element.getBoundingClientRect().height;

      // 8.4 - Cache height if valid (> 0)
      if (height > 0) {
        rowHeightCache.current.set(rowId, height);
      }
    }
  }, []);

  // ==========================================================================
  // STEP 9: MEASURE CONTAINER HEIGHT ON MOUNT
  // ==========================================================================
  // When component first mounts, measure the actual container height
  // This ensures accurate virtualization from the start
  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
  }, []);

  // ==========================================================================
  // STEP 10: RETURN HOOK INTERFACE
  // ==========================================================================
  // Return everything needed to render a virtualized list
  return {
    virtualWindow,      // Calculated visible range and offsets
    visibleRows,        // Subset of items to render
    handleScroll,       // Scroll event handler (attach to container)
    measureRowHeight,   // Height measurement callback (attach to each row)
    containerRef,       // Ref to attach to scrollable container
  };
}

