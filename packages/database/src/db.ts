import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    // Look for database in the workspace root's data directory
    const dbPath = path.join(process.cwd(), '..', '..', 'data', 'patients.db');
    db = new Database(dbPath, { readonly: true });
  }
  return db;
}

