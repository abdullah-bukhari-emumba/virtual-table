// ============================================================================
// PATIENT API CLIENT - UNIT TESTS
// ============================================================================
// Tests for the patient API client functions
//
// WHAT ARE WE TESTING?
// We're testing functions that make HTTP requests to fetch patient data.
// These functions communicate with our backend API.
//
// WHY MOCK fetch?
// In tests, we don't want to make real HTTP requests because:
// 1. Tests would be slow (waiting for network)
// 2. Tests would fail if the server is down
// 3. Tests would depend on having real data in the database
// 4. Tests wouldn't be isolated (they'd affect each other)
//
// Instead, we "mock" the fetch function - we replace it with a fake version
// that returns predefined responses instantly.
//
// WHAT IS MOCKING?
// Mocking is creating a fake version of a function or module for testing.
// Think of it like a movie set - instead of a real building, you have a facade
// that looks real but is controlled and predictable.
// ============================================================================

import { fetchPatients, buildPatientApiUrl, estimateApiResponseTime } from '../patientApi';

// ============================================================================
// MOCK SETUP
// ============================================================================
// We need to mock the global fetch function
// This tells Jest to replace fetch with our fake version

// Save the original fetch so we can restore it later
const originalFetch = global.fetch;

// Create a mock function that we can control
const mockFetch = jest.fn();

// Before each test, replace global.fetch with our mock
beforeEach(() => {
  global.fetch = mockFetch as any;
});

// After each test, clear the mock's history
afterEach(() => {
  mockFetch.mockClear();
});

// After all tests, restore the original fetch
afterAll(() => {
  global.fetch = originalFetch;
});

// ============================================================================
// TEST SUITE: fetchPatients
// ============================================================================
describe('fetchPatients', () => {
  
  // ==========================================================================
  // TEST 1: Successful Fetch with Default Parameters
  // ==========================================================================
  // WHAT THIS TESTS: The function should fetch patients with default params
  // WHY IT MATTERS: Most common use case - fetching the first page of data
  // HOW IT WORKS:
  // 1. Set up mock to return fake patient data
  // 2. Call fetchPatients with no parameters
  // 3. Verify it called the API with correct default values
  // 4. Verify it returned the expected data
  it('should fetch patients with default parameters', async () => {
    // ARRANGE: Create fake response data
    const mockResponse = {
      total: 100000,
      rows: [
        {
          id: '1',
          mrn: 'MRN001',
          name: 'John Doe',
          last_visit_date: '2024-01-15',
          summary: 'Patient summary here...',
        },
        {
          id: '2',
          mrn: 'MRN002',
          name: 'Jane Smith',
          last_visit_date: '2024-01-14',
          summary: 'Another patient summary...',
        },
      ],
    };
    
    // Set up the mock to return this data
    // When fetch is called, it will return a fake Response object
    mockFetch.mockResolvedValueOnce({
      ok: true, // HTTP status 200-299
      json: async () => mockResponse, // The data to return
    });
    
    // ACT: Call the function
    const result = await fetchPatients();
    
    // ASSERT: Verify fetch was called with correct URL
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/patients?limit=200&offset=0&sort=last_visit_date&order=desc'
    );
    
    // ASSERT: Verify the returned data matches our mock
    expect(result).toEqual(mockResponse);
    expect(result.total).toBe(100000);
    expect(result.rows).toHaveLength(2);
  });

  // ==========================================================================
  // TEST 2: Fetch with Custom Parameters
  // ==========================================================================
  // WHAT THIS TESTS: The function should respect custom parameters
  // WHY IT MATTERS: Users need to paginate, sort, and filter data
  it('should fetch patients with custom parameters', async () => {
    // ARRANGE
    const mockResponse = {
      total: 50,
      rows: [],
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });
    
    // ACT: Call with custom parameters
    const result = await fetchPatients({
      limit: 50,
      offset: 100,
      sort: 'name',
      order: 'asc',
      query: 'Smith',
    });
    
    // ASSERT: Verify correct URL was built
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/patients?limit=50&offset=100&sort=name&order=asc&q=Smith'
    );
    
    expect(result).toEqual(mockResponse);
  });

  // ==========================================================================
  // TEST 3: Fetch with Search Query
  // ==========================================================================
  // WHAT THIS TESTS: Search query parameter should be included when provided
  // WHY IT MATTERS: Users need to search for specific patients
  it('should include search query when provided', async () => {
    // ARRANGE
    const mockResponse = {
      total: 10,
      rows: [],
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });
    
    // ACT: Call with search query
    await fetchPatients({
      query: 'John Doe',
    });
    
    // ASSERT: Verify query parameter is in URL
    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain('q=John+Doe');
  });

  // ==========================================================================
  // TEST 4: Error Handling - Failed Request
  // ==========================================================================
  // WHAT THIS TESTS: The function should throw an error when fetch fails
  // WHY IT MATTERS: We need to handle network errors gracefully
  // HOW IT WORKS:
  // 1. Mock fetch to return an error response (status 500)
  // 2. Call fetchPatients
  // 3. Verify it throws an error with a helpful message
  it('should throw error when fetch fails', async () => {
    // ARRANGE: Mock a failed response
    mockFetch.mockResolvedValueOnce({
      ok: false, // HTTP status 400-599
      status: 500,
      statusText: 'Internal Server Error',
    });
    
    // ACT & ASSERT: Verify the function throws an error
    // We use expect().rejects.toThrow() for async functions that should throw
    await expect(fetchPatients()).rejects.toThrow(
      'Failed to fetch patients: 500 Internal Server Error'
    );
  });

  // ==========================================================================
  // TEST 5: Error Handling - Network Error
  // ==========================================================================
  // WHAT THIS TESTS: The function should handle network failures
  // WHY IT MATTERS: Network can fail (no internet, server down, etc.)
  it('should throw error when network fails', async () => {
    // ARRANGE: Mock a network error
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    // ACT & ASSERT: Verify the error is propagated
    await expect(fetchPatients()).rejects.toThrow('Network error');
  });

  // ==========================================================================
  // TEST 6: Pagination Parameters
  // ==========================================================================
  // WHAT THIS TESTS: Pagination parameters should work correctly
  // WHY IT MATTERS: Users need to navigate through large datasets
  it('should handle pagination correctly', async () => {
    // ARRANGE
    const mockResponse = {
      total: 100000,
      rows: [],
    };
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });
    
    // ACT: Fetch second page (offset 200, limit 200)
    await fetchPatients({
      limit: 200,
      offset: 200,
    });
    
    // ASSERT: Verify correct pagination parameters
    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain('limit=200');
    expect(calledUrl).toContain('offset=200');
  });
});

// ============================================================================
// TEST SUITE: buildPatientApiUrl
// ============================================================================
// WHAT THIS TESTS: URL building helper function
// WHY IT MATTERS: Useful for debugging and testing
describe('buildPatientApiUrl', () => {
  
  it('should build URL with default parameters', () => {
    // ACT
    const url = buildPatientApiUrl();
    
    // ASSERT
    expect(url).toBe('/api/patients?limit=200&offset=0&sort=last_visit_date&order=desc');
  });

  it('should build URL with custom parameters', () => {
    // ACT
    const url = buildPatientApiUrl({
      limit: 50,
      offset: 100,
      sort: 'name',
      order: 'asc',
      query: 'Smith',
    });
    
    // ASSERT
    expect(url).toBe('/api/patients?limit=50&offset=100&sort=name&order=asc&q=Smith');
  });

  it('should omit query parameter when not provided', () => {
    // ACT
    const url = buildPatientApiUrl({
      limit: 100,
    });
    
    // ASSERT
    expect(url).not.toContain('q=');
    expect(url).toContain('limit=100');
  });
});

// ============================================================================
// TEST SUITE: estimateApiResponseTime
// ============================================================================
// WHAT THIS TESTS: Response time estimation function
// WHY IT MATTERS: Helps with loading indicators and UX
describe('estimateApiResponseTime', () => {
  
  it('should estimate longer time for filtered queries', () => {
    // ACT
    const time = estimateApiResponseTime({ query: 'Smith' });
    
    // ASSERT: Filtered queries should take ~120ms
    expect(time).toBe(120);
  });

  it('should estimate longer time for large limits', () => {
    // ACT
    const time = estimateApiResponseTime({ limit: 1000 });
    
    // ASSERT: Large batches should take ~50ms
    expect(time).toBe(50);
  });

  it('should estimate standard time for normal queries', () => {
    // ACT
    const time = estimateApiResponseTime({ limit: 200 });
    
    // ASSERT: Standard queries should take ~25ms
    expect(time).toBe(25);
  });

  it('should estimate standard time with no parameters', () => {
    // ACT
    const time = estimateApiResponseTime();
    
    // ASSERT
    expect(time).toBe(25);
  });
});

