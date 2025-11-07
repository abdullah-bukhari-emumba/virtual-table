import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@virtual-table/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'last_visit_date';
    const order = searchParams.get('order') || 'desc';
    const q = searchParams.get('q') || null;
    
    // Validate sort column
    const allowedSortColumns = ['name', 'mrn', 'last_visit_date'];
    const sortColumn = allowedSortColumns.includes(sort) ? sort : 'last_visit_date';
    
    // Validate order
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    
    const db = getDatabase();
    
    // Build WHERE clause
    const whereClause = q 
      ? `WHERE (name LIKE '%' || ? || '%' OR mrn LIKE '%' || ? || '%')`
      : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM patients
      ${whereClause}
    `;
    const countParams = q ? [q, q] : [];
    const { total } = db.prepare(countQuery).get(...countParams) as { total: number };
    
    // Get paginated results with FULL summary (changed from preview)
    // This supports the new requirement: display full summaries from initial load
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

