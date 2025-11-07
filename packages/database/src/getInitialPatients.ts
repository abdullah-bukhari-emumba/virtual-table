/**
 * Server-Side Data Fetcher for Initial Patient Records
 * 
 * This module provides server-only functions for fetching initial patient data
 * directly from the database. It's used by Server Components to pre-populate
 * the client with data, avoiding a loading spinner on first render.
 * 
 * IMPORTANT: This file is marked with 'server-only' to prevent accidental
 * bundling into the client JavaScript bundle.
 */

import 'server-only';
import { getDatabase } from './db';
import type { PatientRecord, SortColumn, SortOrder } from './virtualization-types';

/**
 * Response type for initial patient data fetch
 */
export interface InitialPatientsData {
  /** Array of patient records */
  rows: PatientRecord[];
  /** Total count of all patients in the database */
  total: number;
}

/**
 * Fetches initial patient records directly from the database.
 * 
 * This function runs ONLY on the server during Server-Side Rendering (SSR).
 * It queries the SQLite database directly without going through the HTTP API,
 * which is faster and more efficient for initial page loads.
 * 
 * @param limit - Number of records to fetch (default: 50)
 * @param sort - Column to sort by (default: 'last_visit_date')
 * @param order - Sort order, either 'asc' or 'desc' (default: 'desc')
 * @returns Promise resolving to initial patient data with total count
 * 
 * @example
 * ```typescript
 * // In a Server Component
 * const initialData = await getInitialPatients(50, 'last_visit_date', 'desc');
 * ```
 */
export async function getInitialPatients(
  limit: number = 50,
  sort: SortColumn = 'last_visit_date',
  order: SortOrder = 'desc'
): Promise<InitialPatientsData> {
  try {
    const db = getDatabase();
    
    // Validate and sanitize sort column to prevent SQL injection
    const allowedSortColumns: SortColumn[] = ['name', 'mrn', 'last_visit_date'];
    const sortColumn = allowedSortColumns.includes(sort) ? sort : 'last_visit_date';
    
    // Validate and sanitize sort order
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    
    // Validate limit (cap at 1000 to prevent excessive memory usage)
    const safeLimit = Math.min(Math.max(1, limit), 1000);
    
    // Get total count of all patients
    const countQuery = 'SELECT COUNT(*) as total FROM patients';
    const { total } = db.prepare(countQuery).get() as { total: number };
    
    // Get initial records with sorting
    const dataQuery = `
      SELECT id, name, mrn, last_visit_date, summary
      FROM patients
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT ?
    `;
    
    const rows = db.prepare(dataQuery).all(safeLimit) as PatientRecord[];
    
    return {
      rows,
      total
    };
  } catch (error) {
    // Log error on server (won't be exposed to client)
    console.error('[getInitialPatients] Database query failed:', error);
    
    // Return empty data rather than throwing to prevent page crash
    // The client component will handle the empty state gracefully
    return {
      rows: [],
      total: 0
    };
  }
}

