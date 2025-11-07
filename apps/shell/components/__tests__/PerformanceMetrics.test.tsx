// ============================================================================
// PERFORMANCE METRICS COMPONENT - UNIT TESTS
// ============================================================================
// Tests for the PerformanceMetrics component
//
// WHAT THIS COMPONENT DOES:
// PerformanceMetrics displays real-time performance data:
// - FPS (Frames Per Second) - how smooth scrolling is
// - Load Time - how long the page took to load
// - Visible Rows - how many rows are currently rendered
//
// TESTING STRATEGY:
// 1. Test rendering - does it show all metrics?
// 2. Test color coding - do colors change based on performance?
// 3. Test visual indicators - do status indicators show correctly?
// 4. Test edge cases - extreme values, zero values, etc.
// ============================================================================

import { render, screen } from '@testing-library/react';
import { PerformanceMetrics } from '@virtual-table/ui';

// ============================================================================
// TEST SUITE: PerformanceMetrics Component
// ============================================================================
describe('PerformanceMetrics', () => {
  
  // ==========================================================================
  // TEST 1: Renders All Metrics
  // ==========================================================================
  // WHAT THIS TESTS: All three metrics are displayed
  // WHY IT MATTERS: Users need to see all performance data
  it('should render all performance metrics', () => {
    // ARRANGE & ACT
    render(
      <PerformanceMetrics
        fps={60}
        loadTime={50}
        visibleRowsCount={15}
      />
    );
    
    // ASSERT: All metrics should be visible
    // We look for the metric values as text
    expect(screen.getByText('60')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    
    // Verify labels are present
    expect(screen.getByText(/FPS/i)).toBeInTheDocument();
    expect(screen.getByText(/Load Time/i)).toBeInTheDocument();
    expect(screen.getByText(/Visible Rows/i)).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 2: FPS Color Coding - Excellent Performance (Green)
  // ==========================================================================
  // WHAT THIS TESTS: FPS ≥50 shows green color
  // WHY IT MATTERS: Visual feedback for excellent performance
  it('should show green color for excellent FPS (≥50)', () => {
    // ARRANGE & ACT
    render(
      <PerformanceMetrics
        fps={60}
        loadTime={50}
        visibleRowsCount={15}
      />
    );
    
    // ASSERT: FPS value should have green color class
    const fpsElement = screen.getByText('60');
    expect(fpsElement).toHaveClass('text-green-600');
  });

  // ==========================================================================
  // TEST 3: FPS Color Coding - Good Performance (Yellow)
  // ==========================================================================
  // WHAT THIS TESTS: FPS 30-49 shows yellow color
  // WHY IT MATTERS: Visual feedback for acceptable performance
  it('should show yellow color for good FPS (30-49)', () => {
    // ARRANGE & ACT
    render(
      <PerformanceMetrics
        fps={40}
        loadTime={50}
        visibleRowsCount={15}
      />
    );
    
    // ASSERT: FPS value should have yellow color class
    const fpsElement = screen.getByText('40');
    expect(fpsElement).toHaveClass('text-yellow-600');
  });

  // ==========================================================================
  // TEST 4: FPS Color Coding - Poor Performance (Red)
  // ==========================================================================
  // WHAT THIS TESTS: FPS <30 shows red color
  // WHY IT MATTERS: Visual warning for poor performance
  it('should show red color for poor FPS (<30)', () => {
    // ARRANGE & ACT
    render(
      <PerformanceMetrics
        fps={25}
        loadTime={50}
        visibleRowsCount={15}
      />
    );
    
    // ASSERT: FPS value should have red color class
    const fpsElement = screen.getByText('25');
    expect(fpsElement).toHaveClass('text-red-600');
  });

  // ==========================================================================
  // TEST 5: Shows Scrolling Indicator
  // ==========================================================================
  // WHAT THIS TESTS: Scrolling indicator appears when isScrolling is true
  // WHY IT MATTERS: Users see when metrics are being actively measured
  it('should show scrolling indicator when isScrolling is true', () => {
    // ARRANGE & ACT
    render(
      <PerformanceMetrics
        fps={60}
        loadTime={50}
        visibleRowsCount={15}
        isScrolling={true}
      />
    );
    
    // ASSERT: Should show "(Live)" text when scrolling
    expect(screen.getByText(/Live/i)).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 6: Shows Idle Indicator
  // ==========================================================================
  // WHAT THIS TESTS: Idle indicator appears when not scrolling
  // WHY IT MATTERS: Users know when metrics are static
  it('should show idle indicator when not scrolling', () => {
    // ARRANGE & ACT
    render(
      <PerformanceMetrics
        fps={60}
        loadTime={50}
        visibleRowsCount={15}
        isScrolling={false}
      />
    );
    
    // ASSERT: Should show "(Idle)" text when not scrolling
    expect(screen.getByText(/Idle/i)).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 7: Performance Status - Optimal
  // ==========================================================================
  // WHAT THIS TESTS: Shows "Optimal" status for FPS ≥50
  // WHY IT MATTERS: Overall performance summary
  it('should show "Optimal" status for high FPS', () => {
    // ARRANGE & ACT
    render(
      <PerformanceMetrics
        fps={60}
        loadTime={50}
        visibleRowsCount={15}
      />
    );
    
    // ASSERT
    expect(screen.getByText(/Optimal/i)).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 8: Performance Status - Good
  // ==========================================================================
  // WHAT THIS TESTS: Shows "Good" status for FPS 30-49
  // WHY IT MATTERS: Indicates acceptable performance
  it('should show "Good" status for medium FPS', () => {
    // ARRANGE & ACT
    render(
      <PerformanceMetrics
        fps={40}
        loadTime={50}
        visibleRowsCount={15}
      />
    );
    
    // ASSERT
    expect(screen.getByText(/Good/i)).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 9: Performance Status - Needs Attention
  // ==========================================================================
  // WHAT THIS TESTS: Shows "Needs Attention" status for FPS <30
  // WHY IT MATTERS: Warns about poor performance
  it('should show "Needs Attention" status for low FPS', () => {
    // ARRANGE & ACT
    render(
      <PerformanceMetrics
        fps={20}
        loadTime={50}
        visibleRowsCount={15}
      />
    );
    
    // ASSERT
    expect(screen.getByText(/Needs Attention/i)).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 10: Handles Zero FPS
  // ==========================================================================
  // WHAT THIS TESTS: Component handles edge case of 0 FPS
  // WHY IT MATTERS: Prevents crashes with invalid data
  it('should handle zero FPS', () => {
    // ARRANGE & ACT
    render(
      <PerformanceMetrics
        fps={0}
        loadTime={50}
        visibleRowsCount={15}
      />
    );
    
    // ASSERT: Should render without crashing
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText(/Needs Attention/i)).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 11: Handles High FPS Values
  // ==========================================================================
  // WHAT THIS TESTS: Component handles FPS above 60
  // WHY IT MATTERS: Some displays support >60 FPS
  it('should handle high FPS values', () => {
    // ARRANGE & ACT
    render(
      <PerformanceMetrics
        fps={120}
        loadTime={50}
        visibleRowsCount={15}
      />
    );
    
    // ASSERT
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText(/Optimal/i)).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 12: Handles Zero Load Time
  // ==========================================================================
  // WHAT THIS TESTS: Component handles instant load time
  // WHY IT MATTERS: Cached pages might load instantly
  it('should handle zero load time', () => {
    // ARRANGE & ACT
    render(
      <PerformanceMetrics
        fps={60}
        loadTime={0}
        visibleRowsCount={15}
      />
    );
    
    // ASSERT
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 13: Handles Large Load Time
  // ==========================================================================
  // WHAT THIS TESTS: Component handles slow load times
  // WHY IT MATTERS: Slow networks or large datasets
  it('should handle large load time values', () => {
    // ARRANGE & ACT
    render(
      <PerformanceMetrics
        fps={60}
        loadTime={5000}
        visibleRowsCount={15}
      />
    );
    
    // ASSERT
    expect(screen.getByText('5000')).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 14: Handles Zero Visible Rows
  // ==========================================================================
  // WHAT THIS TESTS: Component handles no visible rows
  // WHY IT MATTERS: Empty state or loading state
  it('should handle zero visible rows', () => {
    // ARRANGE & ACT
    render(
      <PerformanceMetrics
        fps={60}
        loadTime={50}
        visibleRowsCount={0}
      />
    );
    
    // ASSERT
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 15: Handles Many Visible Rows
  // ==========================================================================
  // WHAT THIS TESTS: Component handles large number of visible rows
  // WHY IT MATTERS: Large viewports or small rows
  it('should handle many visible rows', () => {
    // ARRANGE & ACT
    render(
      <PerformanceMetrics
        fps={60}
        loadTime={50}
        visibleRowsCount={100}
      />
    );
    
    // ASSERT
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 16: Shows Component Title
  // ==========================================================================
  // WHAT THIS TESTS: Component has a descriptive title
  // WHY IT MATTERS: Users know what they're looking at
  it('should show component title', () => {
    // ARRANGE & ACT
    render(
      <PerformanceMetrics
        fps={60}
        loadTime={50}
        visibleRowsCount={15}
      />
    );
    
    // ASSERT
    expect(screen.getByText(/Performance Metrics/i)).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 17: Shows Real-time Indicator
  // ==========================================================================
  // WHAT THIS TESTS: Component indicates metrics are real-time
  // WHY IT MATTERS: Users know data is live, not static
  it('should show real-time indicator', () => {
    // ARRANGE & ACT
    render(
      <PerformanceMetrics
        fps={60}
        loadTime={50}
        visibleRowsCount={15}
      />
    );
    
    // ASSERT
    expect(screen.getByText(/Real-time measurements/i)).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 18: Default isScrolling to False
  // ==========================================================================
  // WHAT THIS TESTS: isScrolling defaults to false when not provided
  // WHY IT MATTERS: Optional prop should have sensible default
  it('should default isScrolling to false', () => {
    // ARRANGE & ACT: Don't pass isScrolling prop
    render(
      <PerformanceMetrics
        fps={60}
        loadTime={50}
        visibleRowsCount={15}
      />
    );
    
    // ASSERT: Should show Idle (default behavior)
    expect(screen.getByText(/Idle/i)).toBeInTheDocument();
  });
});

