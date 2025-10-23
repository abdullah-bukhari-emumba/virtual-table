import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, '..', 'data', 'patients.db');

console.log('Database Validation Report');
console.log('='.repeat(60));
console.log('');

const db = new Database(DB_FILE, { readonly: true });

// 1. Verify row count
console.log('1. Row Count Verification');
const count = db.prepare('SELECT COUNT(*) as count FROM patients').get();
console.log(`   Total records: ${count.count}`);
console.log(`   Expected: 100,000`);
console.log(`   Status: ${count.count === 100000 ? '✓ PASS' : '✗ FAIL'}`);
console.log('');

// 2. Verify summary length distribution
console.log('2. Summary Length Distribution');
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

distribution.forEach(row => {
  console.log(`   ${row.category.padEnd(25)} ${row.count.toString().padStart(6)} (${row.percentage}%)`);
});
console.log('');

// 3. Show sample records with varying summary lengths
console.log('3. Sample Records (varying summary lengths)');
const samples = db.prepare(`
  SELECT id, name, mrn, LENGTH(summary) as summary_len
  FROM patients
  WHERE 
    LENGTH(summary) < 100 OR
    (LENGTH(summary) >= 100 AND LENGTH(summary) < 500) OR
    (LENGTH(summary) >= 500 AND LENGTH(summary) < 1500) OR
    LENGTH(summary) >= 1500
  ORDER BY LENGTH(summary)
  LIMIT 4
`).all();

samples.forEach(s => {
  console.log(`   ${s.name.padEnd(25)} MRN: ${s.mrn}  Summary: ${s.summary_len} chars`);
});
console.log('');

// 4. Verify indexes exist
console.log('4. Index Verification');
const indexes = db.prepare(`
  SELECT name, tbl_name, sql 
  FROM sqlite_master 
  WHERE type = 'index' AND tbl_name = 'patients'
`).all();

const expectedIndexes = ['idx_mrn', 'idx_last_visit_date', 'idx_name'];
expectedIndexes.forEach(idx => {
  const exists = indexes.some(i => i.name === idx);
  console.log(`   ${idx.padEnd(25)} ${exists ? '✓ EXISTS' : '✗ MISSING'}`);
});
console.log('');

// 5. Test query plans for index usage
console.log('5. Query Plan Analysis (Index Usage)');

// Test 1: Filter by name
const plan1 = db.prepare(`
  EXPLAIN QUERY PLAN
  SELECT id, name, mrn, last_visit_date, SUBSTR(summary, 1, 120)
  FROM patients
  WHERE name LIKE '%Smith%'
  ORDER BY last_visit_date DESC
  LIMIT 100
`).all();
console.log('   Query: Filter by name, sort by last_visit_date');
const usesIndex1 = plan1.some(p => p.detail && p.detail.includes('USING INDEX'));
console.log(`   Uses index: ${usesIndex1 ? '✓ YES' : '○ NO (expected for LIKE with leading %)'}`);
console.log('');

// Test 2: Sort by last_visit_date
const plan2 = db.prepare(`
  EXPLAIN QUERY PLAN
  SELECT id, name, mrn, last_visit_date, SUBSTR(summary, 1, 120)
  FROM patients
  ORDER BY last_visit_date DESC
  LIMIT 100
`).all();
console.log('   Query: Sort by last_visit_date');
const usesIndex2 = plan2.some(p => p.detail && p.detail.includes('USING INDEX'));
console.log(`   Uses index: ${usesIndex2 ? '✓ YES' : '✗ NO'}`);
console.log('');

// Test 3: Filter by MRN exact match
const plan3 = db.prepare(`
  EXPLAIN QUERY PLAN
  SELECT id, name, mrn, last_visit_date, summary
  FROM patients
  WHERE mrn = 'ABC12345'
`).all();
console.log('   Query: Filter by MRN (exact match)');
const usesIndex3 = plan3.some(p => p.detail && p.detail.includes('USING INDEX'));
console.log(`   Uses index: ${usesIndex3 ? '✓ YES' : '✗ NO'}`);
console.log('');

// 6. Performance benchmarks
console.log('6. Query Performance Benchmarks');

// Benchmark 1: Paginated list query
const start1 = Date.now();
db.prepare(`
  SELECT id, name, mrn, last_visit_date, SUBSTR(summary, 1, 120) AS summary_preview
  FROM patients
  ORDER BY last_visit_date DESC
  LIMIT 100 OFFSET 0
`).all();
const duration1 = Date.now() - start1;
console.log(`   Paginated list (100 rows):     ${duration1}ms ${duration1 < 100 ? '✓' : '✗'}`);

// Benchmark 2: Filtered query
const start2 = Date.now();
db.prepare(`
  SELECT id, name, mrn, last_visit_date, SUBSTR(summary, 1, 120) AS summary_preview
  FROM patients
  WHERE name LIKE '%Smith%' OR mrn LIKE '%Smith%'
  ORDER BY last_visit_date DESC
  LIMIT 100
`).all();
const duration2 = Date.now() - start2;
console.log(`   Filtered query (LIKE):         ${duration2}ms`);

// Benchmark 3: Detail query
const testId = db.prepare('SELECT id FROM patients LIMIT 1').get().id;
const start3 = Date.now();
db.prepare(`
  SELECT id, name, mrn, last_visit_date, summary
  FROM patients
  WHERE id = ?
`).get(testId);
const duration3 = Date.now() - start3;
console.log(`   Single record fetch:           ${duration3}ms ${duration3 < 10 ? '✓' : '✗'}`);

// Benchmark 4: Bulk fetch
const testIds = db.prepare('SELECT id FROM patients LIMIT 10').all().map(r => r.id);
const start4 = Date.now();
const placeholders = testIds.map(() => '?').join(', ');
db.prepare(`
  SELECT id, name, mrn, last_visit_date, summary
  FROM patients
  WHERE id IN (${placeholders})
`).all(...testIds);
const duration4 = Date.now() - start4;
console.log(`   Bulk fetch (10 records):       ${duration4}ms ${duration4 < 10 ? '✓' : '✗'}`);

console.log('');

// 7. Database file size
const stats = fs.statSync(DB_FILE);
const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
console.log('7. Database File Size');
console.log(`   Size: ${sizeMB} MB`);
console.log('');

db.close();

console.log('='.repeat(60));
console.log('✓ Validation complete!');

