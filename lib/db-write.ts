// ============================================================================
// DATABASE WRITE HELPER
// ============================================================================
// This module provides write access to the SQLite database for creating new
// patient records. It's separate from the read-only db.ts to maintain clear
// separation of concerns and prevent accidental writes in read operations.
//
// IMPORTANT: This database connection is NOT read-only, unlike lib/db.ts
// ============================================================================

import Database from 'better-sqlite3';
import path from 'path';

/**
 * Writable database connection instance
 * Singleton pattern ensures only one connection is created
 */
let writeDb: Database.Database | null = null;

/**
 * Get or create a writable database connection
 * 
 * This function creates a single writable connection to the patients database.
 * Unlike the read-only connection in lib/db.ts, this connection allows
 * INSERT, UPDATE, and DELETE operations.
 * 
 * @returns {Database.Database} Writable database connection
 * 
 * @example
 * const db = getWritableDatabase();
 * const stmt = db.prepare('INSERT INTO patients (id, name, ...) VALUES (?, ?, ...)');
 * stmt.run(id, name, ...);
 */
export function getWritableDatabase(): Database.Database {
  if (!writeDb) {
    // Construct path to database file
    const dbPath = path.join(process.cwd(), 'data', 'patients.db');
    
    // Create writable connection (readonly: false is the default)
    writeDb = new Database(dbPath);
    
    // Enable Write-Ahead Logging for better concurrent access
    // This allows readers to access the database while a write is in progress
    writeDb.pragma('journal_mode = WAL');
  }
  
  return writeDb;
}

/**
 * Patient data interface for database operations
 * 
 * This interface defines the structure of patient data as stored in the database.
 * Note: The current schema only includes basic fields. Additional fields like
 * date_of_birth, gender, address, etc. would require schema migration.
 */
export interface PatientData {
  id: string;              // UUID primary key
  name: string;            // Full name (first + last)
  mrn: string;             // Medical Record Number (8 alphanumeric chars)
  last_visit_date: string; // ISO date string (YYYY-MM-DD)
  summary: string;         // Patient summary/notes
}

/**
 * Insert a new patient record into the database
 * 
 * This function inserts a new patient record using a prepared statement
 * for security (prevents SQL injection) and performance.
 * 
 * @param {PatientData} patient - Patient data to insert
 * @returns {void}
 * @throws {Error} If database insert fails
 * 
 * @example
 * insertPatient({
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   name: 'John Doe',
 *   mrn: 'MRN12345',
 *   last_visit_date: '2025-01-15',
 *   summary: 'Patient presents with...'
 * });
 */
export function insertPatient(patient: PatientData): void {
  const db = getWritableDatabase();
  
  // Prepare INSERT statement
  // Using INSERT OR REPLACE to handle potential duplicate IDs gracefully
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO patients (id, name, mrn, last_visit_date, summary)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  // Execute insert with patient data
  stmt.run(
    patient.id,
    patient.name,
    patient.mrn,
    patient.last_visit_date,
    patient.summary
  );
}

/**
 * Generate a unique Medical Record Number (MRN)
 * 
 * Generates an 8-character alphanumeric MRN in the format: MRN + 5 random chars
 * This ensures uniqueness and follows a consistent pattern.
 * 
 * @returns {string} Generated MRN (e.g., "MRN4A7B9")
 * 
 * @example
 * const mrn = generateMRN(); // "MRNX3K9P"
 */
export function generateMRN(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let mrn = 'MRN';
  
  // Generate 5 random characters
  for (let i = 0; i < 5; i++) {
    mrn += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return mrn;
}

/**
 * Check if an MRN already exists in the database
 * 
 * This function checks for MRN uniqueness before inserting a new patient.
 * 
 * @param {string} mrn - Medical Record Number to check
 * @returns {boolean} True if MRN exists, false otherwise
 * 
 * @example
 * if (mrnExists('MRN12345')) {
 *   console.log('MRN already in use');
 * }
 */
export function mrnExists(mrn: string): boolean {
  const db = getWritableDatabase();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM patients WHERE mrn = ?');
  const result = stmt.get(mrn) as { count: number };
  return result.count > 0;
}

/**
 * Generate a unique MRN that doesn't exist in the database
 * 
 * This function generates MRNs until it finds one that doesn't exist.
 * In practice, collisions are extremely rare with 36^5 possible combinations.
 * 
 * @returns {string} Unique MRN
 * 
 * @example
 * const uniqueMrn = generateUniqueMRN(); // Guaranteed to be unique
 */
export function generateUniqueMRN(): string {
  let mrn: string;
  let attempts = 0;
  const maxAttempts = 100; // Prevent infinite loop (extremely unlikely to hit)
  
  do {
    mrn = generateMRN();
    attempts++;
    
    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique MRN after 100 attempts');
    }
  } while (mrnExists(mrn));
  
  return mrn;
}

