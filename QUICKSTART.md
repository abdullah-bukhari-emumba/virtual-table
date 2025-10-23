# Quick Start Guide

## Prerequisites
- Node.js 20+ installed
- npm installed

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Data (100,000 records)
```bash
npm run data:generate
```
Expected output:
- File: `data/patients.jsonl` (~35 MB)
- Time: ~4 seconds
- Records: 100,000

### 3. Import to SQLite
```bash
npm run data:import
```
Expected output:
- File: `data/patients.db` (~44 MB)
- Time: ~3.5 seconds
- Records: 100,000

### 4. Start Development Server
```bash
npm run dev
```
Server will start at: http://localhost:3000

## API Endpoints

### List Patients (with pagination, sorting, filtering)
```bash
# Get first 5 patients
curl "http://localhost:3000/api/patients?limit=5"

# Filter by name or MRN
curl "http://localhost:3000/api/patients?q=Smith&limit=10"

# Sort by name ascending
curl "http://localhost:3000/api/patients?sort=name&order=asc&limit=10"

# Pagination
curl "http://localhost:3000/api/patients?limit=100&offset=1000"
```

### Get Single Patient (full summary)
```bash
curl "http://localhost:3000/api/patients/{patient-id}"
```

### Bulk Fetch (multiple patients)
```bash
curl -X POST "http://localhost:3000/api/patients/bulk" \
  -H "Content-Type: application/json" \
  -d '{"ids": ["id1", "id2", "id3"]}'
```

## Testing & Validation

### Test API Endpoints
```bash
node scripts/test-api.js
```

### Validate Database
```bash
node scripts/validate-db.js
```

### Show Sample Records
```bash
node scripts/show-samples.js
```

## Reset Data
To regenerate everything from scratch:
```bash
npm run data:reset
```

## Key Features

✅ **100,000 patient records** with realistic data  
✅ **Variable-length summaries** (short, medium, long, ultra-long)  
✅ **High-performance SQLite** with proper indexes  
✅ **Paginated API** with sorting and filtering  
✅ **Preview summaries** (120 chars) for list views  
✅ **Full summaries** for detail views  
✅ **Sub-100ms response times** for paginated queries  
✅ **Repeatable pipeline** with npm scripts  

## Performance Metrics

| Operation | Time |
|-----------|------|
| Generate 100k records | ~4s |
| Import to SQLite | ~3.5s |
| API response (100 rows) | ~17ms |
| Single record fetch | <1ms |
| Bulk fetch (10 records) | <1ms |

## Summary Length Distribution

- **Short** (<100 chars): ~42%
- **Medium** (100-500 chars): ~50%
- **Long** (500-1500 chars): ~6%
- **Ultra-long** (>1500 chars): ~2.4%

## Troubleshooting

### better-sqlite3 binding errors
If you see "Could not locate the bindings file" errors:
```bash
npm rebuild better-sqlite3
```

### Database not found
Make sure you've run the data generation and import scripts:
```bash
npm run data:generate
npm run data:import
```

### Port 3000 already in use
Change the port in `package.json` or kill the process using port 3000.

## Next Steps

This backend is ready to support a high-performance virtual table frontend with:
- 100k+ rows
- Dynamic row heights (variable summary lengths)
- Sorting and filtering
- <100ms render time (API responses in ~17ms)
- >50 FPS (lightweight 22KB payloads for 100 rows)

Build your virtual table UI using libraries like:
- `react-window` or `react-virtualized` for virtualization
- `@tanstack/react-table` for table state management
- Custom virtual scrolling implementation

The API is optimized for lazy loading:
1. Fetch list with preview summaries
2. Render visible rows
3. Fetch full summaries on demand (detail or bulk endpoints)

