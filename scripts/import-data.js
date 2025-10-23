const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DATA_DIR = path.join(__dirname, '..', 'data');
const JSONL_FILE = path.join(DATA_DIR, 'patients.jsonl');
const DB_FILE = path.join(DATA_DIR, 'patients.db');
const BATCH_SIZE = 10000;

console.log('Initializing SQLite database...');

// Connect to database
const db = new Database(DB_FILE);

// Create schema
console.log('Creating schema...');
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    mrn TEXT NOT NULL,
    last_visit_date TEXT NOT NULL,
    summary TEXT NOT NULL
  );
`);

// Create indexes
console.log('Creating indexes...');
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_mrn ON patients(mrn);
  CREATE INDEX IF NOT EXISTS idx_last_visit_date ON patients(last_visit_date);
  CREATE INDEX IF NOT EXISTS idx_name ON patients(name);
`);

// Prepare insert statement
const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO patients (id, name, mrn, last_visit_date, summary)
  VALUES (?, ?, ?, ?, ?)
`);

console.log(`Importing data from ${JSONL_FILE}...`);
const startTime = Date.now();

// Read and import JSONL file line by line
const fileStream = fs.createReadStream(JSONL_FILE);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let lineNumber = 0;
let recordsInBatch = 0;
let totalRecords = 0;

// Begin first transaction
db.exec('BEGIN TRANSACTION');

rl.on('line', (line) => {
  lineNumber++;
  
  try {
    const record = JSON.parse(line);
    
    // Insert record
    insertStmt.run(
      record.id,
      record.name,
      record.mrn,
      record.last_visit_date,
      record.summary
    );
    
    recordsInBatch++;
    totalRecords++;
    
    // Commit and start new transaction every BATCH_SIZE records
    if (recordsInBatch >= BATCH_SIZE) {
      db.exec('COMMIT');
      console.log(`  Imported ${totalRecords} records...`);
      db.exec('BEGIN TRANSACTION');
      recordsInBatch = 0;
    }
  } catch (error) {
    console.error(`Error parsing line ${lineNumber}: ${error.message}`);
    console.error(`Line content: ${line.substring(0, 100)}...`);
  }
});

rl.on('close', () => {
  // Commit final batch
  if (recordsInBatch > 0) {
    db.exec('COMMIT');
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✓ Successfully imported ${totalRecords} records in ${duration}s`);
  
  // Verify count
  const count = db.prepare('SELECT COUNT(*) as count FROM patients').get();
  console.log(`  Database contains ${count.count} records`);
  
  // Show sample record with summary length
  const sample = db.prepare(`
    SELECT id, name, mrn, last_visit_date, LENGTH(summary) as summary_len
    FROM patients
    LIMIT 1
  `).get();
  console.log(`  Sample record: ${sample.name} (MRN: ${sample.mrn}, Summary length: ${sample.summary_len} chars)`);
  
  // Show summary length distribution
  const distribution = db.prepare(`
    SELECT 
      CASE 
        WHEN LENGTH(summary) < 100 THEN 'Short (<100)'
        WHEN LENGTH(summary) < 500 THEN 'Medium (100-500)'
        WHEN LENGTH(summary) < 1500 THEN 'Long (500-1500)'
        ELSE 'Ultra-long (>1500)'
      END as category,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM patients), 1) as percentage
    FROM patients
    GROUP BY category
    ORDER BY MIN(LENGTH(summary))
  `).all();
  
  console.log('\n  Summary length distribution:');
  distribution.forEach(row => {
    console.log(`    ${row.category}: ${row.count} (${row.percentage}%)`);
  });
  
  db.close();
  console.log('\n✓ Database closed');
});

