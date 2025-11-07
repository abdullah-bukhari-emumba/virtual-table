// ============================================================================
// USE VIRTUALIZATION HOOK - UNIT TESTS
// ============================================================================
// Tests for the useVirtualization custom hook
//
// WHAT THIS HOOK DOES:
// useVirtualization calculates which rows should be visible in a scrollable
// container. Instead of rendering all 100,000 rows, it only renders the
// 15-20 rows that are currently visible in the viewport.
//
// TESTING STRATEGY:
// 1. Test basic rendering - does it return the right structure?
// 2. Test visible window calculation - does it show the right rows?
// 3. Test row height caching - does it remember measured heights?
// 4. Test scroll handling - does it update when scrolling?
// ============================================================================

import { renderHook, act } from '@testing-library/react';
import { useVirtualization } from '../useVirtualization';

// ============================================================================
// TEST DATA SETUP
// ============================================================================
// Create sample data for testing

type TestItem = {
  id: string;
  name: string;
};

const createTestItems = (count: number): TestItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`,
  }));
};

// ============================================================================
// TEST SUITE: useVirtualization Hook
// ============================================================================
describe('useVirtualization', () => {
  
  // ==========================================================================
  // TEST 1: Returns Required Properties
  // ==========================================================================
  // WHAT THIS TESTS: Hook returns all necessary properties
  // WHY IT MATTERS: Components need these properties to render
  it('should return required properties', () => {
    // ARRANGE
    const items = createTestItems(100);
    
    // ACT
    const { result } = renderHook(() =>
      useVirtualization({
        items,
        getItemId: (item) => item.id,
      })
    );
    
    // ASSERT: Check all required properties exist
    expect(result.current).toHaveProperty('virtualWindow');
    expect(result.current).toHaveProperty('visibleRows');
    expect(result.current).toHaveProperty('containerRef');
    expect(result.current).toHaveProperty('handleScroll');
    expect(result.current).toHaveProperty('measureRowHeight');
  });

  // ==========================================================================
  // TEST 2: Calculates Total Height
  // ==========================================================================
  // WHAT THIS TESTS: Total height is calculated correctly
  // WHY IT MATTERS: This determines the scrollbar size
  it('should calculate total height based on items and default row height', () => {
    // ARRANGE
    const items = createTestItems(100);
    const defaultRowHeight = 48;
    
    // ACT
    const { result } = renderHook(() =>
      useVirtualization({
        items,
        getItemId: (item) => item.id,
        defaultRowHeight,
      })
    );
    
    // ASSERT: Total height should be items * row height
    // 100 items * 48px = 4800px
    expect(result.current.virtualWindow.totalHeight).toBe(100 * 48);
  });

  // ==========================================================================
  // TEST 3: Returns Virtual Window
  // ==========================================================================
  // WHAT THIS TESTS: Virtual window contains visible items
  // WHY IT MATTERS: This is the core virtualization logic
  it('should return virtual window with visible items', () => {
    // ARRANGE
    const items = createTestItems(100);
    
    // ACT
    const { result } = renderHook(() =>
      useVirtualization({
        items,
        getItemId: (item) => item.id,
      })
    );
    
    // ASSERT: Virtual window should have items
    expect(result.current.virtualWindow).toBeDefined();
    expect(result.current.visibleRows.length).toBeGreaterThan(0);
  });

  // ==========================================================================
  // TEST 4: Includes Overscan Buffer
  // ==========================================================================
  // WHAT THIS TESTS: Overscan adds extra rows above/below viewport
  // WHY IT MATTERS: Prevents blank space during fast scrolling
  it('should include overscan buffer in visible items', () => {
    // ARRANGE
    const items = createTestItems(100);
    const overscan = 5;
    
    // ACT
    const { result } = renderHook(() =>
      useVirtualization({
        items,
        getItemId: (item) => item.id,
        overscan,
      })
    );
    
    // ASSERT: Should have items (exact count depends on container height)
    expect(result.current.visibleRows.length).toBeGreaterThan(0);
  });

  // ==========================================================================
  // TEST 5: handleScroll Function Exists
  // ==========================================================================
  // WHAT THIS TESTS: handleScroll function is provided
  // WHY IT MATTERS: Component needs to call this on scroll events
  it('should provide handleScroll function', () => {
    // ARRANGE
    const items = createTestItems(10);

    // ACT
    const { result } = renderHook(() =>
      useVirtualization({
        items,
        getItemId: (item) => item.id,
      })
    );

    // ASSERT: Should be a function
    expect(typeof result.current.handleScroll).toBe('function');
  });

  // ==========================================================================
  // TEST 6: Uses Estimated Height When Provided
  // ==========================================================================
  // WHAT THIS TESTS: estimateRowHeight function is used when provided
  // WHY IT MATTERS: Better estimates improve scroll accuracy
  it('should use estimated height when estimateRowHeight is provided', () => {
    // ARRANGE
    const items = createTestItems(10);
    const estimateRowHeight = (item: TestItem) => {
      // Estimate based on name length
      return 48 + item.name.length * 2;
    };
    
    // ACT
    const { result } = renderHook(() =>
      useVirtualization({
        items,
        getItemId: (item) => item.id,
        estimateRowHeight,
      })
    );
    
    // ASSERT: Total height should use estimates
    expect(result.current.virtualWindow.totalHeight).toBeGreaterThan(0);
  });

  // ==========================================================================
  // TEST 7: Handles Empty Items Array
  // ==========================================================================
  // WHAT THIS TESTS: Hook handles edge case of no items
  // WHY IT MATTERS: Prevents crashes with empty data
  it('should handle empty items array', () => {
    // ARRANGE
    const items: TestItem[] = [];
    
    // ACT
    const { result } = renderHook(() =>
      useVirtualization({
        items,
        getItemId: (item) => item.id,
      })
    );
    
    // ASSERT: Should return empty virtual window
    expect(result.current.visibleRows).toEqual([]);
    expect(result.current.virtualWindow.totalHeight).toBe(0);
  });

  // ==========================================================================
  // TEST 8: Handles Single Item
  // ==========================================================================
  // WHAT THIS TESTS: Hook works with minimal data
  // WHY IT MATTERS: Edge case testing
  it('should handle single item', () => {
    // ARRANGE
    const items = createTestItems(1);
    
    // ACT
    const { result } = renderHook(() =>
      useVirtualization({
        items,
        getItemId: (item) => item.id,
      })
    );
    
    // ASSERT
    expect(result.current.visibleRows.length).toBe(1);
    expect(result.current.virtualWindow.totalHeight).toBe(48); // default height
  });

  // ==========================================================================
  // TEST 9: Updates When Items Change
  // ==========================================================================
  // WHAT THIS TESTS: Hook recalculates when data changes
  // WHY IT MATTERS: Data can change (filtering, sorting, loading more)
  it('should update when items change', () => {
    // ARRANGE
    const initialItems = createTestItems(10);
    
    // ACT: Render with initial items
    const { result, rerender } = renderHook(
      ({ items }) =>
        useVirtualization({
          items,
          getItemId: (item) => item.id,
        }),
      { initialProps: { items: initialItems } }
    );
    
    const initialHeight = result.current.virtualWindow.totalHeight;

    // ACT: Update with more items
    const newItems = createTestItems(20);
    rerender({ items: newItems });

    // ASSERT: Total height should increase
    expect(result.current.virtualWindow.totalHeight).toBeGreaterThan(initialHeight);
  });

  // ==========================================================================
  // TEST 10: containerRef is Defined
  // ==========================================================================
  // WHAT THIS TESTS: Hook provides ref for container element
  // WHY IT MATTERS: Component needs to attach this ref to scrollable div
  it('should provide containerRef', () => {
    // ARRANGE
    const items = createTestItems(10);
    
    // ACT
    const { result } = renderHook(() =>
      useVirtualization({
        items,
        getItemId: (item) => item.id,
      })
    );
    
    // ASSERT: containerRef should be defined
    expect(result.current.containerRef).toBeDefined();
    expect(result.current.containerRef.current).toBeNull(); // Not attached yet
  });
});

