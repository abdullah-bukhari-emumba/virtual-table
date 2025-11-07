import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@virtual-table/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDatabase();
    
    const query = `
      SELECT id, name, mrn, last_visit_date, summary
      FROM patients
      WHERE id = ?
    `;
    
    const patient = db.prepare(query).get(id);
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

