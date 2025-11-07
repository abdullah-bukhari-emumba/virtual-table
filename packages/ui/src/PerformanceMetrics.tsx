// ============================================================================
// PERFORMANCE METRICS COMPONENT
// ============================================================================
// Reusable component for displaying real-time performance metrics
//
// FEATURES:
// - FPS (Frames Per Second) counter with color-coded status
// - Load time display
// - Visible rows count
// - Responsive grid layout
// - Color-coded indicators for performance thresholds
//
// USAGE:
// <PerformanceMetrics fps={60} loadTime={50} visibleRowsCount={15} />
// ============================================================================

'use client';

import React from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type PerformanceMetricsProps = {
  /** Current frames per second (FPS) - measures scroll smoothness */
  fps: number;
  
  /** Initial page load time in milliseconds */
  loadTime: number;
  
  /** Number of rows currently visible in the viewport */
  visibleRowsCount: number;
  
  /** Optional: Whether the user is currently scrolling */
  isScrolling?: boolean;
};

// ============================================================================
// PERFORMANCE METRICS COMPONENT
// ============================================================================

export function PerformanceMetrics({
  fps,
  loadTime,
  visibleRowsCount,
  isScrolling = false,
}: PerformanceMetricsProps) {
  
  // Determine FPS status color based on performance thresholds
  // - Green (≥50 FPS): Excellent performance
  // - Yellow (30-49 FPS): Acceptable performance
  // - Red (<30 FPS): Poor performance
  const getFpsColor = () => {
    if (fps >= 50) return 'text-green-600';
    if (fps >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFpsBarColor = () => {
    if (fps >= 50) return 'bg-green-500';
    if (fps >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="mt-4 bg-white border border-slate-200 rounded-lg shadow-sm">
      {/* Header Section */}
      <div className="px-6 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center space-x-2">
          {/* Animated pulse indicator - shows component is live */}
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="text-sm font-semibold text-slate-700">Performance Metrics</h3>
          <span className="text-xs text-slate-500">(Real-time measurements)</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* ================================================================
              METRIC 1: FPS (Frames Per Second)
              ================================================================
              Measures scroll smoothness and rendering performance
              - 60 FPS = optimal (one frame every 16.67ms)
              - 50+ FPS = good (smooth scrolling)
              - 30-49 FPS = acceptable (minor stuttering)
              - <30 FPS = poor (noticeable lag)
          */}
          <div className="text-center">
            <div className={`text-2xl font-bold transition-colors ${getFpsColor()}`}>
              {fps}
              {/* Show animated indicator when actively scrolling */}
              {isScrolling && <span className="text-xs ml-1 animate-pulse">📊</span>}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              FPS {isScrolling ? '(Live)' : '(Idle)'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Frames rendered per second
            </div>
            {/* Visual progress bar showing FPS relative to 60 FPS target */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div 
                className={`h-1.5 rounded-full transition-all ${getFpsBarColor()}`}
                style={{ width: `${Math.min(100, (fps / 60) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* ================================================================
              METRIC 2: Load Time
              ================================================================
              Initial page load duration in milliseconds
              - <100ms = excellent
              - 100-300ms = good
              - >300ms = needs optimization
          */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{loadTime}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">Load Time (ms)</div>
            <div className="text-xs text-slate-400 mt-1">
              Initial page load duration
            </div>
            {/* Static progress bar for load time */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all" 
                style={{ width: `${Math.min(100, 100 - (loadTime / 300) * 100)}%` }}
              ></div>
            </div>
          </div>

          {/* ================================================================
              METRIC 3: Visible Rows
              ================================================================
              Number of rows currently rendered in the DOM
              - Virtualization keeps this low (~15-20) regardless of dataset size
              - Lower = better memory efficiency
              - Should remain constant during scrolling
          */}
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-600">{visibleRowsCount}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">Visible Rows</div>
            <div className="text-xs text-slate-400 mt-1">
              Rows currently in viewport
            </div>
            {/* Progress bar showing visible rows relative to typical max (~20) */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div 
                className="bg-slate-500 h-1.5 rounded-full transition-all" 
                style={{ width: `${Math.min(100, (visibleRowsCount / 20) * 100)}%` }}
              ></div>
            </div>
          </div>

        </div>

        {/* ================================================================
            STATUS FOOTER
            ================================================================
            Shows overall performance status
        */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-600">
                Performance Status: {fps >= 50 ? 'Optimal' : fps >= 30 ? 'Good' : 'Needs Attention'}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Lightweight tracking - minimal overhead
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

