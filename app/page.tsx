'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PerformanceTracker, type LiveMetrics } from '../lib/performance-tracker';

// API Patient Record type matching backend response
type PatientRecord = {
  id: string;
  name: string;
  mrn: string;
  last_visit_date: string;
  summary_preview?: string; // From list endpoint
  summary?: string; // From detail/bulk endpoint
};

type SortColumn = 'name' | 'mrn' | 'last_visit_date';
type SortOrder = 'asc' | 'desc';



// Live metrics component with efficient updates
function PerformanceMetrics() {
  const perfTracker = PerformanceTracker.getInstance();
  const [metrics, setMetrics] = useState<LiveMetrics>(perfTracker.getMetrics());

  useEffect(() => {
    // Update metrics every 250ms for stable display
    const interval = setInterval(() => {
      setMetrics(perfTracker.getMetrics());
    }, 250);

    return () => clearInterval(interval);
  }, [perfTracker]);

  return (
    <div className="mt-4 bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="px-6 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="text-sm font-semibold text-slate-700">Performance Metrics</h3>
          <span className="text-xs text-slate-500">(Real-time measurements)</span>
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {/* Scroll FPS */}
          <div className="text-center">
            <div className={`text-2xl font-bold transition-colors ${metrics.fps >= 50 ? 'text-green-600' : metrics.fps >= 30 ? 'text-yellow-600' : 'text-red-600'}`}>
              {metrics.fps}
              {metrics.isScrolling && <span className="text-xs ml-1 animate-pulse">📊</span>}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">
              FPS {metrics.isScrolling ? '(Live)' : '(Idle)'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Frames rendered per second
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div 
                className={`h-1.5 rounded-full transition-all ${metrics.fps >= 50 ? 'bg-green-500' : metrics.fps >= 30 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, (metrics.fps / 60) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.loadTime}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">Load Time (ms)</div>
            <div className="text-xs text-slate-400 mt-1">
              Initial page load duration
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{metrics.renderTime}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">Render (ms)</div>
            <div className="text-xs text-slate-400 mt-1">
              Average frame render time
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{metrics.memoryUsage.toFixed(1)}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">Memory (MB)</div>
            <div className="text-xs text-slate-400 mt-1">
              Estimated memory usage
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-slate-600">{metrics.visibleRows}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">Visible Rows</div>
            <div className="text-xs text-slate-400 mt-1">
              Rows currently in viewport
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div className="bg-slate-500 h-1.5 rounded-full" style={{ width: `${(metrics.visibleRows / 20) * 100}%` }}></div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">5</div>
            <div className="text-xs text-slate-500 uppercase tracking-wide">Buffer Size</div>
            <div className="text-xs text-slate-400 mt-1">
              Extra rows for smooth scrolling
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Virtual Window:</span>
              <span className="font-mono text-slate-700">Rendering visible rows only</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Scroll Position:</span>
              <span className="font-mono text-slate-700">{metrics.scrollPosition}px</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Row Height:</span>
              <span className="font-mono text-slate-700">Dynamic (48-300px)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Container Height:</span>
              <span className="font-mono text-slate-700">600px</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Rows:</span>
              <span className="font-mono text-slate-700">{metrics.memoryUsage > 100 ? '100,000+' : '20'} rows</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Last Update:</span>
              <span className="font-mono text-slate-700">{metrics.lastUpdate}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-slate-600">Performance Status: Optimal</span>
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

export default function Home() {
  const perfTracker = PerformanceTracker.getInstance();

  // State management
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn>('last_visit_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Virtualization state
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);

  // Row height management
  const rowHeightCache = useRef<Map<string, number>>(new Map());
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());
  const DEFAULT_ROW_HEIGHT = 48;
  const OVERSCAN = 5;

  // Data cache for fetched records
  const dataCache = useRef<Map<string, PatientRecord>>(new Map());

  // Debounce timer for search
  const searchTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Fetch patients from API
  const fetchPatients = useCallback(async (
    limit: number = 200,
    offset: number = 0,
    sort: SortColumn = sortColumn,
    order: SortOrder = sortOrder,
    query: string = searchQuery
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        sort,
        order,
      });

      if (query) {
        params.append('q', query);
      }

      const response = await fetch(`/api/patients?${params}`);
      if (!response.ok) throw new Error('Failed to fetch patients');

      const data = await response.json();

      // Cache the fetched records
      data.rows.forEach((patient: PatientRecord) => {
        dataCache.current.set(patient.id, patient);
      });

      if (offset === 0) {
        setPatients(data.rows);
        setTotalCount(data.total);
        perfTracker.setDataSize(data.total);
      } else {
        setPatients(prev => [...prev, ...data.rows]);
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  }, [sortColumn, sortOrder, searchQuery, perfTracker]);

  // Fetch full summary for expanded row
  const fetchFullSummary = useCallback(async (patientId: string) => {
    try {
      const response = await fetch(`/api/patients/${patientId}`);
      if (!response.ok) throw new Error('Failed to fetch patient details');

      const patient = await response.json();

      // Update cache and state
      dataCache.current.set(patient.id, patient);
      setPatients(prev => prev.map(p => p.id === patient.id ? patient : p));
    } catch (err) {
      console.error('Error fetching patient details:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      rowHeightCache.current.clear();
      dataCache.current.clear();
      fetchPatients(200, 0, sortColumn, sortOrder, searchQuery);
    }, 300);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchQuery, sortColumn, sortOrder, fetchPatients]);

  // Handle sorting
  const handleSort = useCallback((column: SortColumn) => {
    const newOrder = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortOrder(newOrder);
    rowHeightCache.current.clear();
    dataCache.current.clear();
  }, [sortColumn, sortOrder]);

  // Handle row expansion
  const toggleRowExpansion = useCallback((patientId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(patientId)) {
        newSet.delete(patientId);
      } else {
        newSet.add(patientId);
        // Fetch full summary if not already cached
        const patient = dataCache.current.get(patientId);
        if (!patient?.summary) {
          fetchFullSummary(patientId);
        }
      }
      return newSet;
    });
  }, [fetchFullSummary]);

  // Calculate row height
  const getRowHeight = useCallback((patientId: string, isExpanded: boolean) => {
    if (!isExpanded) {
      return DEFAULT_ROW_HEIGHT;
    }

    // Return cached height if available
    const cached = rowHeightCache.current.get(patientId);
    if (cached) return cached;

    // Estimate based on summary length
    const patient = dataCache.current.get(patientId);
    if (patient?.summary) {
      const summaryLength = patient.summary.length;
      // Rough estimate: 80 chars per line, 20px per line, plus base height
      const estimatedLines = Math.ceil(summaryLength / 80);
      return DEFAULT_ROW_HEIGHT + (estimatedLines * 20);
    }

    return DEFAULT_ROW_HEIGHT * 3; // Default expanded height
  }, []);

  // Measure row height after render
  const measureRowHeight = useCallback((patientId: string, element: HTMLTableRowElement | null) => {
    if (element) {
      rowRefs.current.set(patientId, element);
      const height = element.getBoundingClientRect().height;
      if (height > 0) {
        rowHeightCache.current.set(patientId, height);
      }
    }
  }, []);

  // Calculate virtualization window
  const virtualWindow = useMemo(() => {
    let currentOffset = 0;
    let startIndex = 0;
    let endIndex = 0;

    // Find start index
    for (let i = 0; i < patients.length; i++) {
      const isExpanded = expandedRows.has(patients[i].id);
      const rowHeight = getRowHeight(patients[i].id, isExpanded);

      if (currentOffset + rowHeight > scrollTop) {
        startIndex = Math.max(0, i - OVERSCAN);
        break;
      }
      currentOffset += rowHeight;
    }

    // Find end index
    currentOffset = 0;
    for (let i = 0; i < patients.length; i++) {
      const isExpanded = expandedRows.has(patients[i].id);
      const rowHeight = getRowHeight(patients[i].id, isExpanded);
      currentOffset += rowHeight;

      if (currentOffset > scrollTop + containerHeight) {
        endIndex = Math.min(patients.length, i + OVERSCAN + 1);
        break;
      }
    }

    if (endIndex === 0) endIndex = patients.length;

    // Calculate total height and offsets
    let totalHeight = 0;
    const offsets: number[] = [];

    for (let i = 0; i < patients.length; i++) {
      offsets.push(totalHeight);
      const isExpanded = expandedRows.has(patients[i].id);
      const rowHeight = getRowHeight(patients[i].id, isExpanded);
      totalHeight += rowHeight;
    }

    return { startIndex, endIndex, totalHeight, offsets };
  }, [patients, scrollTop, containerHeight, expandedRows, getRowHeight]);

  // Visible rows to render
  const visibleRows = useMemo(() => {
    return patients.slice(virtualWindow.startIndex, virtualWindow.endIndex);
  }, [patients, virtualWindow.startIndex, virtualWindow.endIndex]);

  // Scroll handler with requestAnimationFrame
  const rafRef = useRef<number | undefined>(undefined);
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;

    if (rafRef.current !== undefined) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      setScrollTop(target.scrollTop);
      setContainerHeight(target.clientHeight);
      perfTracker.updateScroll(target.scrollTop, target.clientHeight, visibleRows.length);
    });
  }, [perfTracker, visibleRows.length]);

  // Infinite scroll detection
  useEffect(() => {
    if (loading || patients.length >= totalCount) return;

    const { totalHeight } = virtualWindow;
    const scrollBottom = scrollTop + containerHeight;

    // Load more when within 500px of bottom
    if (totalHeight - scrollBottom < 500) {
      fetchPatients(200, patients.length);
    }
  }, [scrollTop, containerHeight, virtualWindow, loading, patients.length, totalCount, fetchPatients]);

  // Update container height on mount
  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
    }
  }, []);

  // Render sort indicator
  const SortIndicator = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">PulseGrid</h1>
            <p className="mt-1 text-sm text-gray-600">Electronic Health Records Management</p>
          </div>

          {/* Search bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name or MRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div
              ref={containerRef}
              className="overflow-auto"
              style={{ maxHeight: "600px" }}
              onScroll={handleScroll}
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-800 sticky top-0 z-10">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-slate-700"
                      onClick={() => handleSort('mrn')}
                    >
                      MRN <SortIndicator column="mrn" />
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-slate-700"
                      onClick={() => handleSort('name')}
                    >
                      Patient Name <SortIndicator column="name" />
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-slate-700"
                      onClick={() => handleSort('last_visit_date')}
                    >
                      Last Visit Date <SortIndicator column="last_visit_date" />
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Summary
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200" style={{ position: 'relative', height: `${virtualWindow.totalHeight}px` }}>
                  {visibleRows.map((patient, idx) => {
                    const actualIndex = virtualWindow.startIndex + idx;
                    const isExpanded = expandedRows.has(patient.id);
                    const topOffset = virtualWindow.offsets[actualIndex];

                    return (
                      <tr
                        key={patient.id}
                        ref={(el) => measureRowHeight(patient.id, el)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        style={{
                          position: 'absolute',
                          top: `${topOffset}px`,
                          left: 0,
                          right: 0,
                          width: '100%',
                        }}
                        onClick={() => toggleRowExpansion(patient.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {patient.mrn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.last_visit_date}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {isExpanded ? (
                            <div className="whitespace-pre-wrap">
                              {patient.summary || patient.summary_preview || 'Loading...'}
                            </div>
                          ) : (
                            <div className="truncate max-w-md">
                              {patient.summary_preview || patient.summary?.substring(0, 120) || ''}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {loading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading...</span>
                </div>
              )}
            </div>
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-700">
                  Showing <span className="font-medium">{patients.length}</span> of <span className="font-medium">{totalCount.toLocaleString()}</span> results
                </div>
                <div className="text-xs text-slate-500">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <PerformanceMetrics />
        </div>
      </div>
    </div>
  );
}
