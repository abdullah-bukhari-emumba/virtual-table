const Database = require('better-sqlite3');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'patients.db');
const db = new Database(DB_FILE, { readonly: true });

console.log('Sample Records by Summary Length Category');
console.log('='.repeat(80));
console.log('');

// Get one example from each category
const categories = [
  { name: 'Short', min: 0, max: 100 },
  { name: 'Medium', min: 100, max: 500 },
  { name: 'Long', min: 500, max: 1500 },
  { name: 'Ultra-long', min: 1500, max: 999999 }
];

categories.forEach(cat => {
  const sample = db.prepare(`
    SELECT id, name, mrn, last_visit_date, summary, LENGTH(summary) as len
    FROM patients
    WHERE LENGTH(summary) >= ? AND LENGTH(summary) < ?
    LIMIT 1
  `).get(cat.min, cat.max);
  
  if (sample) {
    console.log(`${cat.name.toUpperCase()} SUMMARY (${sample.len} characters)`);
    console.log('-'.repeat(80));
    console.log(`Patient: ${sample.name}`);
    console.log(`MRN: ${sample.mrn}`);
    console.log(`Last Visit: ${sample.last_visit_date}`);
    console.log(`\nSummary:`);
    console.log(sample.summary);
    console.log('');
    console.log('='.repeat(80));
    console.log('');
  }
});

db.close();

