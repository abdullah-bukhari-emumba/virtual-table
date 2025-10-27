// ============================================================================
// PATIENTS API ROUTE
// ============================================================================
// This API route handles patient data operations:
// - GET: Fetch paginated, sorted, and filtered patient records
// - POST: Create new patient records
//
// The GET endpoint is used by the virtual table for displaying patient data.
// The POST endpoint is used by the form to create new patient records.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getWritableDatabase, insertPatient, generateUniqueMRN, type PatientData } from '@/lib/db-write';
import { randomUUID } from 'crypto';

/**
 * GET /api/patients
 *
 * Fetch paginated, sorted, and optionally filtered patient records.
 *
 * Query Parameters:
 * - limit: Number of records to return (default: 100, max: 1000)
 * - offset: Starting position for pagination (default: 0)
 * - sort: Column to sort by (name | mrn | last_visit_date, default: last_visit_date)
 * - order: Sort direction (asc | desc, default: desc)
 * - q: Search query to filter by name or MRN (optional)
 *
 * Response:
 * {
 *   total: number,     // Total count of matching records
 *   rows: Patient[]    // Array of patient records
 * }
 *
 * @param {NextRequest} request - Next.js request object
 * @returns {NextResponse} JSON response with patient data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters with validation
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'last_visit_date';
    const order = searchParams.get('order') || 'desc';
    const q = searchParams.get('q') || null;

    // Validate sort column to prevent SQL injection
    const allowedSortColumns = ['name', 'mrn', 'last_visit_date'];
    const sortColumn = allowedSortColumns.includes(sort) ? sort : 'last_visit_date';

    // Validate order direction
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Get read-only database connection
    const db = getDatabase();

    // Build WHERE clause for search functionality
    // Searches in both name and MRN fields
    const whereClause = q
      ? `WHERE (name LIKE '%' || ? || '%' OR mrn LIKE '%' || ? || '%')`
      : '';

    // Get total count of matching records
    const countQuery = `
      SELECT COUNT(*) as total
      FROM patients
      ${whereClause}
    `;
    const countParams = q ? [q, q] : [];
    const { total } = db.prepare(countQuery).get(...countParams) as { total: number };

    // Get paginated results with FULL summary (not preview)
    // This supports the requirement to display full summaries from initial load
    const dataQuery = `
      SELECT
        id,
        name,
        mrn,
        last_visit_date,
        summary
      FROM patients
      ${whereClause}
      ORDER BY ${sortColumn} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    const dataParams = q ? [q, q, limit, offset] : [limit, offset];
    const rows = db.prepare(dataQuery).all(...dataParams);

    return NextResponse.json({
      total,
      rows
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/patients
 *
 * Create a new patient record in the database.
 *
 * Request Body:
 * {
 *   firstName: string,
 *   lastName: string,
 *   dateOfBirth?: string,
 *   gender?: string,
 *   email?: string,
 *   phone?: string,
 *   address?: string,
 *   city?: string,
 *   state?: string,
 *   zipCode?: string,
 *   insuranceProvider?: string,
 *   diagnosis?: string,
 *   status?: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   patient: PatientData  // Created patient record
 * }
 *
 * @param {NextRequest} request - Next.js request object
 * @returns {NextResponse} JSON response with created patient data
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Generate unique identifiers
    const id = randomUUID();
    const mrn = generateUniqueMRN();

    // Combine first and last name
    const name = `${body.firstName} ${body.lastName}`;

    // Set last visit date to today
    const last_visit_date = new Date().toISOString().slice(0, 10);

    // Build patient summary from form data
    // This creates a comprehensive summary from all provided fields
    const summaryParts: string[] = [];

    // Add demographic information
    if (body.dateOfBirth) {
      summaryParts.push(`Date of Birth: ${body.dateOfBirth}`);
    }
    if (body.gender) {
      summaryParts.push(`Gender: ${body.gender}`);
    }

    // Add contact information
    if (body.email) {
      summaryParts.push(`Email: ${body.email}`);
    }
    if (body.phone) {
      summaryParts.push(`Phone: ${body.phone}`);
    }

    // Add address information
    if (body.address || body.city || body.state || body.zipCode) {
      const addressParts = [
        body.address,
        body.city,
        body.state,
        body.zipCode
      ].filter(Boolean);
      summaryParts.push(`Address: ${addressParts.join(', ')}`);
    }

    // Add insurance information
    if (body.insuranceProvider) {
      summaryParts.push(`Insurance: ${body.insuranceProvider}`);
    }

    // Add medical information
    if (body.diagnosis) {
      summaryParts.push(`Diagnosis: ${body.diagnosis}`);
    }
    if (body.status) {
      summaryParts.push(`Status: ${body.status}`);
    }

    // Create summary text
    const summary = summaryParts.length > 0
      ? summaryParts.join('. ') + '.'
      : 'New patient record created.';

    // Create patient data object
    const patientData: PatientData = {
      id,
      name,
      mrn,
      last_visit_date,
      summary
    };

    // Insert into database
    insertPatient(patientData);

    // Return success response with created patient data
    return NextResponse.json({
      success: true,
      patient: patientData
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient record' },
      { status: 500 }
    );
  }
}

