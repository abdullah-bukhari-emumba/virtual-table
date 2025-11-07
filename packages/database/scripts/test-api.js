const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    }).on('error', reject);
  });
}

function makePostRequest(path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = JSON.stringify(body);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('Testing API endpoints...\n');
  
  try {
    // Test 1: List endpoint with default params
    console.log('1. Testing GET /api/patients?limit=5');
    const list1 = await makeRequest('/api/patients?limit=5');
    console.log(`   Status: ${list1.status}`);
    console.log(`   Total records: ${list1.data.total}`);
    console.log(`   Rows returned: ${list1.data.rows.length}`);
    if (list1.data.rows.length > 0) {
      const sample = list1.data.rows[0];
      console.log(`   Sample: ${sample.name} (MRN: ${sample.mrn})`);
      console.log(`   Preview length: ${sample.summary_preview.length} chars`);
    }
    console.log('');
    
    // Test 2: List endpoint with filtering
    console.log('2. Testing GET /api/patients?q=test&limit=10');
    const list2 = await makeRequest('/api/patients?q=test&limit=10');
    console.log(`   Status: ${list2.status}`);
    console.log(`   Filtered total: ${list2.data.total}`);
    console.log(`   Rows returned: ${list2.data.rows.length}`);
    console.log('');
    
    // Test 3: List endpoint with sorting
    console.log('3. Testing GET /api/patients?sort=name&order=asc&limit=5');
    const list3 = await makeRequest('/api/patients?sort=name&order=asc&limit=5');
    console.log(`   Status: ${list3.status}`);
    console.log(`   First name: ${list3.data.rows[0]?.name}`);
    console.log('');
    
    // Test 4: Detail endpoint
    if (list1.data.rows.length > 0) {
      const testId = list1.data.rows[0].id;
      console.log(`4. Testing GET /api/patients/${testId}`);
      const detail = await makeRequest(`/api/patients/${testId}`);
      console.log(`   Status: ${detail.status}`);
      console.log(`   Name: ${detail.data.name}`);
      console.log(`   Full summary length: ${detail.data.summary.length} chars`);
      console.log('');
    }
    
    // Test 5: Bulk endpoint
    if (list1.data.rows.length >= 3) {
      const ids = list1.data.rows.slice(0, 3).map(r => r.id);
      console.log(`5. Testing POST /api/patients/bulk with ${ids.length} IDs`);
      const bulk = await makePostRequest('/api/patients/bulk', { ids });
      console.log(`   Status: ${bulk.status}`);
      console.log(`   Records returned: ${bulk.data.length}`);
      console.log('');
    }
    
    // Test 6: Performance test - measure response time
    console.log('6. Performance test - GET /api/patients?limit=100');
    const start = Date.now();
    const perf = await makeRequest('/api/patients?limit=100');
    const duration = Date.now() - start;
    console.log(`   Status: ${perf.status}`);
    console.log(`   Response time: ${duration}ms`);
    console.log(`   Rows returned: ${perf.data.rows.length}`);
    
    // Calculate payload size
    const payloadSize = JSON.stringify(perf.data).length;
    console.log(`   Payload size: ${(payloadSize / 1024).toFixed(2)} KB`);
    console.log('');
    
    console.log('✓ All API tests completed successfully!');
    
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    process.exit(1);
  }
}

// Wait a moment for server to be ready, then run tests
setTimeout(runTests, 2000);

