const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');

const TOTAL_RECORDS = 100000;
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'patients.jsonl');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Create write stream for JSONL output
const writeStream = fs.createWriteStream(OUTPUT_FILE);

console.log(`Generating ${TOTAL_RECORDS} patient records...`);
const startTime = Date.now();

for (let i = 0; i < TOTAL_RECORDS; i++) {
  // Generate random value for summary length distribution
  const r = Math.random();
  
  // Generate patient record
  const id = faker.string.uuid();
  const name = faker.person.fullName();
  const mrn = faker.string.alphanumeric(8).toUpperCase();
  const last_visit_date = faker.date.recent({ days: 365 }).toISOString().slice(0, 10);
  
  // Weighted summary distribution:
  // 40% short (~1 sentence)
  // 35% medium (~1 paragraph)
  // 20% long (~3 paragraphs)
  // 5% ultra-long (~10 paragraphs)
  let summary;
  if (r < 0.40) {
    summary = faker.lorem.sentence();
  } else if (r < 0.75) {
    summary = faker.lorem.paragraph();
  } else if (r < 0.95) {
    summary = faker.lorem.paragraphs(3);
  } else {
    summary = faker.lorem.paragraphs(10);
  }
  
  // Write JSONL line
  const record = { id, name, mrn, last_visit_date, summary };
  writeStream.write(JSON.stringify(record) + '\n');
  
  // Progress indicator every 10,000 records
  if ((i + 1) % 10000 === 0) {
    console.log(`  Generated ${i + 1} records...`);
  }
}

writeStream.end(() => {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✓ Successfully generated ${TOTAL_RECORDS} records in ${duration}s`);
  console.log(`  Output: ${OUTPUT_FILE}`);
  
  // Show file size
  const stats = fs.statSync(OUTPUT_FILE);
  const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`  File size: ${fileSizeMB} MB`);
});

