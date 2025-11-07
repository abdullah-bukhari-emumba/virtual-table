// ============================================================================
// INFINITE SCROLL VALIDATION SCRIPT
// ============================================================================
// This script validates that the infinite scroll functionality works correctly
//
// TESTS:
// 1. Initial load returns 200 records
// 2. Subsequent loads append data correctly
// 3. Offset parameter works correctly
// 4. Total count remains consistent
// 5. No duplicate records
// 6. Performance maintained with growing dataset
// ============================================================================

const sqlite3 = require('better-sqlite3');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.blue}TEST: ${testName}${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

function pass(message) {
  log(`✓ ${message}`, 'green');
}

function fail(message) {
  log(`✗ ${message}`, 'red');
}

function info(message) {
  log(`  ${message}`, 'yellow');
}

// ============================================================================
// MAIN VALIDATION
// ============================================================================

async function main() {
  log('\n╔════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║         INFINITE SCROLL VALIDATION TESTS                       ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════╝', 'cyan');

  const dbPath = path.join(__dirname, '..', 'data', 'patients.db');
  const db = sqlite3(dbPath);

  let allTestsPassed = true;

  try {
    // ========================================================================
    // TEST 1: Initial Load (offset=0, limit=200)
    // ========================================================================
    logTest('Initial Load - First 200 Records');

    const startTime1 = Date.now();
    const batch1 = db.prepare(`
      SELECT id, mrn, name, last_visit_date, summary
      FROM patients
      ORDER BY last_visit_date DESC
      LIMIT 200 OFFSET 0
    `).all();
    const duration1 = Date.now() - startTime1;

    if (batch1.length === 200) {
      pass(`Loaded exactly 200 records`);
    } else {
      fail(`Expected 200 records, got ${batch1.length}`);
      allTestsPassed = false;
    }

    if (duration1 < 100) {
      pass(`Query completed in ${duration1}ms (< 100ms)`);
    } else {
      fail(`Query took ${duration1}ms (should be < 100ms)`);
      allTestsPassed = false;
    }

    // Check that summaries are full (not previews)
    const firstSummary = batch1[0].summary;
    if (firstSummary && firstSummary.length > 120) {
      pass(`Full summaries returned (first summary: ${firstSummary.length} chars)`);
    } else {
      fail(`Summaries appear to be truncated (first summary: ${firstSummary?.length || 0} chars)`);
      allTestsPassed = false;
    }

    // ========================================================================
    // TEST 2: Second Batch (offset=200, limit=200)
    // ========================================================================
    logTest('Second Batch - Records 200-399');

    const startTime2 = Date.now();
    const batch2 = db.prepare(`
      SELECT id, mrn, name, last_visit_date, summary
      FROM patients
      ORDER BY last_visit_date DESC
      LIMIT 200 OFFSET 200
    `).all();
    const duration2 = Date.now() - startTime2;

    if (batch2.length === 200) {
      pass(`Loaded exactly 200 records`);
    } else {
      fail(`Expected 200 records, got ${batch2.length}`);
      allTestsPassed = false;
    }

    if (duration2 < 100) {
      pass(`Query completed in ${duration2}ms (< 100ms)`);
    } else {
      fail(`Query took ${duration2}ms (should be < 100ms)`);
      allTestsPassed = false;
    }

    // ========================================================================
    // TEST 3: No Duplicate Records Between Batches
    // ========================================================================
    logTest('No Duplicates - Batches Are Distinct');

    const batch1Ids = new Set(batch1.map(p => p.id));
    const batch2Ids = new Set(batch2.map(p => p.id));

    const duplicates = [...batch1Ids].filter(id => batch2Ids.has(id));

    if (duplicates.length === 0) {
      pass(`No duplicate records between batch 1 and batch 2`);
    } else {
      fail(`Found ${duplicates.length} duplicate records`);
      info(`Duplicate IDs: ${duplicates.slice(0, 5).join(', ')}...`);
      allTestsPassed = false;
    }

    // ========================================================================
    // TEST 4: Third Batch (offset=400, limit=200)
    // ========================================================================
    logTest('Third Batch - Records 400-599');

    const startTime3 = Date.now();
    const batch3 = db.prepare(`
      SELECT id, mrn, name, last_visit_date, summary
      FROM patients
      ORDER BY last_visit_date DESC
      LIMIT 200 OFFSET 400
    `).all();
    const duration3 = Date.now() - startTime3;

    if (batch3.length === 200) {
      pass(`Loaded exactly 200 records`);
    } else {
      fail(`Expected 200 records, got ${batch3.length}`);
      allTestsPassed = false;
    }

    if (duration3 < 100) {
      pass(`Query completed in ${duration3}ms (< 100ms)`);
    } else {
      fail(`Query took ${duration3}ms (should be < 100ms)`);
      allTestsPassed = false;
    }

    // ========================================================================
    // TEST 5: Total Count Consistency
    // ========================================================================
    logTest('Total Count - Database Consistency');

    const totalCount = db.prepare('SELECT COUNT(*) as count FROM patients').get().count;

    if (totalCount === 100000) {
      pass(`Total count is 100,000 records`);
    } else {
      fail(`Expected 100,000 records, got ${totalCount}`);
      allTestsPassed = false;
    }

    info(`With 200 records per batch, need ${Math.ceil(totalCount / 200)} batches to load all data`);

    // ========================================================================
    // TEST 6: Large Offset Performance (offset=99800, limit=200)
    // ========================================================================
    logTest('Large Offset - Last Batch Performance');

    const startTime6 = Date.now();
    const lastBatch = db.prepare(`
      SELECT id, mrn, name, last_visit_date, summary
      FROM patients
      ORDER BY last_visit_date DESC
      LIMIT 200 OFFSET 99800
    `).all();
    const duration6 = Date.now() - startTime6;

    if (lastBatch.length === 200) {
      pass(`Loaded last 200 records (99800-99999)`);
    } else {
      fail(`Expected 200 records, got ${lastBatch.length}`);
      allTestsPassed = false;
    }

    if (duration6 < 100) {
      pass(`Query completed in ${duration6}ms (< 100ms even with large offset)`);
    } else {
      fail(`Query took ${duration6}ms (should be < 100ms)`);
      allTestsPassed = false;
    }

    // ========================================================================
    // TEST 7: Variable Summary Lengths
    // ========================================================================
    logTest('Variable Summary Lengths - Dynamic Row Heights');

    const allRecords = [...batch1, ...batch2, ...batch3];
    const summaryLengths = allRecords.map(p => p.summary?.length || 0);
    const minLength = Math.min(...summaryLengths);
    const maxLength = Math.max(...summaryLengths);
    const avgLength = Math.round(summaryLengths.reduce((a, b) => a + b, 0) / summaryLengths.length);

    info(`Summary length range: ${minLength} - ${maxLength} chars`);
    info(`Average summary length: ${avgLength} chars`);

    if (maxLength > minLength * 2) {
      pass(`Significant variation in summary lengths (good for testing dynamic heights)`);
    } else {
      fail(`Summary lengths too uniform (min: ${minLength}, max: ${maxLength})`);
      allTestsPassed = false;
    }

    // ========================================================================
    // TEST 8: Simulated Infinite Scroll Sequence
    // ========================================================================
    logTest('Simulated Infinite Scroll - 5 Batches');

    const batches = [];
    const batchTimes = [];
    let totalRecords = 0;

    for (let i = 0; i < 5; i++) {
      const offset = i * 200;
      const startTime = Date.now();
      const batch = db.prepare(`
        SELECT id, mrn, name, last_visit_date, summary
        FROM patients
        ORDER BY last_visit_date DESC
        LIMIT 200 OFFSET ?
      `).all(offset);
      const duration = Date.now() - startTime;

      batches.push(batch);
      batchTimes.push(duration);
      totalRecords += batch.length;

      info(`Batch ${i + 1}: offset=${offset}, loaded=${batch.length} records, time=${duration}ms`);
    }

    if (totalRecords === 1000) {
      pass(`Loaded 1000 records across 5 batches`);
    } else {
      fail(`Expected 1000 records, got ${totalRecords}`);
      allTestsPassed = false;
    }

    const avgBatchTime = Math.round(batchTimes.reduce((a, b) => a + b, 0) / batchTimes.length);
    if (avgBatchTime < 100) {
      pass(`Average batch load time: ${avgBatchTime}ms (< 100ms)`);
    } else {
      fail(`Average batch load time: ${avgBatchTime}ms (should be < 100ms)`);
      allTestsPassed = false;
    }

    // Check for duplicates across all batches
    const allIds = new Set();
    let duplicateCount = 0;
    batches.forEach(batch => {
      batch.forEach(record => {
        if (allIds.has(record.id)) {
          duplicateCount++;
        }
        allIds.add(record.id);
      });
    });

    if (duplicateCount === 0) {
      pass(`No duplicates across all 5 batches`);
    } else {
      fail(`Found ${duplicateCount} duplicate records across batches`);
      allTestsPassed = false;
    }

  } catch (error) {
    fail(`Error during validation: ${error.message}`);
    console.error(error);
    allTestsPassed = false;
  } finally {
    db.close();
  }

  // ========================================================================
  // FINAL SUMMARY
  // ========================================================================
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  if (allTestsPassed) {
    log('✓ ALL TESTS PASSED - Infinite scroll ready for production!', 'green');
  } else {
    log('✗ SOME TESTS FAILED - Please review errors above', 'red');
  }
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

  process.exit(allTestsPassed ? 0 : 1);
}

main();

