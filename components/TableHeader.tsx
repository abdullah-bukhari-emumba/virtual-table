// ============================================================================
// TABLE HEADER COMPONENT
// ============================================================================
// Reusable sortable table header component with sort indicators
// ============================================================================

import React from 'react';
import type { TableColumn } from '../lib/virtualization/types';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

type TableHeaderProps<T> = {
  columns: TableColumn<T>[];           // Column definitions
  sortColumn?: string;                 // Currently sorted column key
  sortOrder?: 'asc' | 'desc';          // Current sort direction
  onSort?: (columnKey: string) => void; // Callback when column header clicked
};

// ============================================================================
// SORT INDICATOR COMPONENT
// ============================================================================

/**
 * SortIndicator - Shows arrow indicating sort direction
 * 
 * Displays:
 * - ↑ for ascending sort
 * - ↓ for descending sort
 * - Nothing if column is not currently sorted
 */
function SortIndicator({ 
  isActive, 
  order 
}: { 
  isActive: boolean; 
  order: 'asc' | 'desc' 
}) {
  if (!isActive) return null;
  return <span className="ml-1">{order === 'asc' ? '↑' : '↓'}</span>;
}

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================

/**
 * TableHeader - Reusable sortable table header
 * 
 * FEATURES:
 * - Generic type support (works with any data type)
 * - Sortable columns with visual indicators
 * - Hover effects for better UX
 * - Sticky positioning support
 * 
 * USAGE:
 * ```tsx
 * <TableHeader
 *   columns={patientColumns}
 *   sortColumn="name"
 *   sortOrder="asc"
 *   onSort={handleSort}
 * />
 * ```
 */
export function TableHeader<T>({
  columns,
  sortColumn,
  sortOrder = 'asc',
  onSort,
}: TableHeaderProps<T>) {
  return (
    <thead className="bg-slate-800 sticky top-0 z-10">
      <tr>
        {columns.map((column) => {
          const isActive = sortColumn === column.key;
          const isSortable = column.sortable !== false;

          return (
            <th
              key={column.key}
              scope="col"
              className={`
                px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider
                ${isSortable && onSort ? 'cursor-pointer hover:bg-slate-700' : ''}
                ${column.className || ''}
              `}
              onClick={() => {
                if (isSortable && onSort) {
                  onSort(column.key);
                }
              }}
            >
              {column.label}
              {isSortable && <SortIndicator isActive={isActive} order={sortOrder} />}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

