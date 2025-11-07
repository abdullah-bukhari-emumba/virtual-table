import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@virtual-table/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: ids must be a non-empty array' },
        { status: 400 }
      );
    }
    
    const db = getDatabase();
    
    // Build placeholders for IN clause
    const placeholders = ids.map(() => '?').join(', ');
    
    const query = `
      SELECT id, name, mrn, last_visit_date, summary
      FROM patients
      WHERE id IN (${placeholders})
    `;
    
    const patients = db.prepare(query).all(...ids);
    
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching patients in bulk:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

