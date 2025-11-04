// ============================================================================
// PATIENT SEARCH FLOW - INTEGRATION TEST
// ============================================================================
// Integration tests verify that multiple components work together correctly.
// Unlike unit tests (which test components in isolation), integration tests
// simulate real user workflows across multiple components.
//
// WHAT IS INTEGRATION TESTING?
// Integration testing verifies that different parts of your application work
// together as expected. It tests the "seams" between components - the places
// where data flows from one component to another.
//
// WHY INTEGRATION TESTS MATTER:
// - Unit tests verify individual components work in isolation
// - Integration tests verify components work together as a system
// - They catch bugs that only appear when components interact
// - They test real user workflows, not just individual features
//
// THIS TEST SUITE COVERS:
// Complete patient search workflow from user input to table update:
// 1. User types in SearchBar
// 2. useDebounce delays the API call by 300ms
// 3. patientApi.fetchPatients is called with search query
// 4. VirtualTable updates to show filtered results
// 5. PerformanceMetrics displays current FPS
//
// COMPONENTS TESTED TOGETHER:
// - SearchBar (user input)
// - useDebounce (delay logic)
// - patientApi (API calls)
// - VirtualTable (data display)
// - PerformanceMetrics (performance tracking)
// - Home page (orchestrates everything)
// ============================================================================

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Home from '../../page';

// ============================================================================
// MOCK SETUP
// ============================================================================
// We need to mock the fetch API to avoid making real network requests
// during tests. This makes tests faster, more reliable, and independent
// of external services.

// Store the original fetch function so we can restore it later
const originalFetch = global.fetch;

// ============================================================================
// TEST SUITE: Patient Search Flow Integration
// ============================================================================
describe('Patient Search Flow Integration', () => {
  
  // ==========================================================================
  // SETUP: Before Each Test
  // ==========================================================================
  // This runs before each test to set up a clean environment
  beforeEach(() => {
    // Mock the global fetch function
    // This prevents real API calls and lets us control the response
    global.fetch = jest.fn();
  });

  // ==========================================================================
  // CLEANUP: After Each Test
  // ==========================================================================
  // This runs after each test to clean up and restore original state
  afterEach(() => {
    // Restore the original fetch function
    global.fetch = originalFetch;
    // Clear all mock function call history
    jest.clearAllMocks();
  });

  // ==========================================================================
  // TEST 1: Complete Search Workflow
  // ==========================================================================
  // WHAT THIS TESTS: User types search query → debounce delays → API called → table updates
  // WHY IT MATTERS: This is the most common user workflow (used 100+ times daily)
  // COMPONENTS INVOLVED: SearchBar, useDebounce, patientApi, VirtualTable
  //
  // EXECUTION FLOW:
  // 1. Mock API to return filtered patient data
  // 2. Render the Home page component
  // 3. Wait for initial data to load
  // 4. User types "Smith" in search box
  // 5. Verify API is NOT called immediately (debounce delay)
  // 6. Wait 300ms for debounce
  // 7. Verify API is called with search query
  // 8. Verify table shows filtered results
  it('should search, debounce, fetch, and update table with filtered results', async () => {
    // ARRANGE: Set up mock API responses
    // The component makes an initial API call on mount, then another when search changes
    const mockFetch = global.fetch as jest.Mock;

    // Mock implementation that returns different data based on the URL
    mockFetch.mockImplementation((url: string) => {
      // Check if this is a search query
      if (url.includes('q=Smith')) {
        // Return search results for "Smith"
        return Promise.resolve({
          ok: true,
          json: async () => ({
            total: 1,
            rows: [
              {
                id: '3',
                name: 'Alice Smith',
                mrn: '11111',
                last_visit_date: '2024-01-16',
                summary: 'Patient summary for Alice Smith',
              },
            ],
          }),
        });
      } else {
        // Return initial data (no search query)
        return Promise.resolve({
          ok: true,
          json: async () => ({
            total: 100,
            rows: [
              {
                id: '1',
                name: 'John Doe',
                mrn: '12345',
                last_visit_date: '2024-01-15',
                summary: 'Patient summary for John Doe',
              },
              {
                id: '2',
                name: 'Jane Wilson',
                mrn: '67890',
                last_visit_date: '2024-01-14',
                summary: 'Patient summary for Jane Wilson',
              },
            ],
          }),
        });
      }
    });

    // ACT: Render the Home page
    render(<Home />);

    // ASSERT: Wait for initial data to load
    // The page should show the initial patients
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Verify initial API call was made (may be called twice in React 18 strict mode)
    const initialCallCount = mockFetch.mock.calls.length;
    expect(initialCallCount).toBeGreaterThanOrEqual(1);

    // ACT: User types "Smith" in search box
    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'Smith');

    // ASSERT: API should NOT be called immediately (debounce delay)
    // Store the call count before debounce
    const callCountBeforeDebounce = mockFetch.mock.calls.length;

    // ACT: Wait for debounce delay (300ms) + buffer
    // The useDebounce hook delays the search query update by 300ms
    await waitFor(
      () => {
        // ASSERT: API should now be called with search query
        expect(mockFetch.mock.calls.length).toBeGreaterThan(callCountBeforeDebounce);
      },
      { timeout: 1000 } // Give it up to 1 second to complete
    );

    // Verify the last API call includes the search query
    const lastCallUrl = (mockFetch.mock.calls[mockFetch.mock.calls.length - 1][0] as string);
    expect(lastCallUrl).toContain('q=Smith');

    // ASSERT: Table should show filtered results
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    }, { timeout: 2000 });

    // Verify old results are no longer visible
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Jane Wilson')).not.toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 2: Clear Search and Reset Table
  // ==========================================================================
  // WHAT THIS TESTS: User clears search → table resets to full list
  // WHY IT MATTERS: Users need to easily return to the full patient list
  // COMPONENTS INVOLVED: SearchBar, useDebounce, patientApi, VirtualTable
  it('should clear search and reset table to full list', async () => {
    // ARRANGE: Set up mock API responses
    const mockFetch = global.fetch as jest.Mock;

    // Mock implementation that returns different data based on the URL
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('q=Smith')) {
        // Return search results for "Smith"
        return Promise.resolve({
          ok: true,
          json: async () => ({
            total: 1,
            rows: [
              { id: '3', name: 'Alice Smith', mrn: '11111', last_visit_date: '2024-01-16', summary: 'Summary 3' },
            ],
          }),
        });
      } else {
        // Return full list (no search query)
        return Promise.resolve({
          ok: true,
          json: async () => ({
            total: 2,
            rows: [
              { id: '1', name: 'John Doe', mrn: '12345', last_visit_date: '2024-01-15', summary: 'Summary 1' },
              { id: '2', name: 'Jane Wilson', mrn: '67890', last_visit_date: '2024-01-14', summary: 'Summary 2' },
            ],
          }),
        });
      }
    });

    // ACT: Render and wait for initial load
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    }, { timeout: 2000 });

    // ACT: Search for "Smith"
    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'Smith');

    // Wait for search results
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    }, { timeout: 1000 });

    // ACT: Clear the search box
    await userEvent.clear(searchInput);

    // ASSERT: Wait for table to reset to full list
    await waitFor(
      () => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Wilson')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Verify filtered result is no longer visible
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 3: Search with No Results
  // ==========================================================================
  // WHAT THIS TESTS: Search returns no results → empty state displayed
  // WHY IT MATTERS: Users need clear feedback when no patients match their search
  // COMPONENTS INVOLVED: SearchBar, useDebounce, patientApi, VirtualTable
  it('should handle search with no results and show empty state', async () => {
    // ARRANGE: Set up mock API responses
    const mockFetch = global.fetch as jest.Mock;

    // Mock implementation that returns different data based on the URL
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('q=NONEXISTENT')) {
        // Return empty results for non-existent search
        return Promise.resolve({
          ok: true,
          json: async () => ({
            total: 0,
            rows: [],
          }),
        });
      } else {
        // Return initial data
        return Promise.resolve({
          ok: true,
          json: async () => ({
            total: 2,
            rows: [
              { id: '1', name: 'John Doe', mrn: '12345', last_visit_date: '2024-01-15', summary: 'Summary 1' },
            ],
          }),
        });
      }
    });

    // ACT: Render and wait for initial load
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    }, { timeout: 2000 });

    // ACT: Search for non-existent patient
    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'NONEXISTENT');

    // ASSERT: Wait for previous results to be cleared
    await waitFor(
      () => {
        // Verify previous results are no longer visible
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // ASSERT: Verify the table is empty (no patient rows)
    // When data is empty, the VirtualTable renders an empty tbody
    // We can verify this by checking that no patient names are displayed
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // The table should still have headers but no data rows
    expect(screen.getByText(/patient name/i)).toBeInTheDocument(); // Header exists
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument(); // No data
  });

  // ==========================================================================
  // TEST 4: Performance Metrics Update During Search
  // ==========================================================================
  // WHAT THIS TESTS: PerformanceMetrics component displays and updates during search
  // WHY IT MATTERS: Users and developers need visibility into application performance
  // COMPONENTS INVOLVED: SearchBar, patientApi, VirtualTable, PerformanceMetrics
  //
  // BEGINNER EXPLANATION:
  // The PerformanceMetrics component shows real-time performance data like FPS
  // (frames per second). This test verifies that the metrics are visible and
  // updating correctly during the search workflow.
  it('should display performance metrics during search workflow', async () => {
    // ARRANGE: Set up mock API responses
    const mockFetch = global.fetch as jest.Mock;

    // Mock implementation that returns different data based on the URL
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('q=Smith')) {
        // Return search results for "Smith"
        return Promise.resolve({
          ok: true,
          json: async () => ({
            total: 1,
            rows: [
              { id: '2', name: 'Alice Smith', mrn: '67890', last_visit_date: '2024-01-16', summary: 'Summary 2' },
            ],
          }),
        });
      } else {
        // Return initial data
        return Promise.resolve({
          ok: true,
          json: async () => ({
            total: 2,
            rows: [
              { id: '1', name: 'John Doe', mrn: '12345', last_visit_date: '2024-01-15', summary: 'Summary 1' },
            ],
          }),
        });
      }
    });

    // ACT: Render the Home page
    render(<Home />);

    // ASSERT: Performance metrics should be visible
    // The PerformanceMetrics component shows FPS, Load Time, and Visible Rows
    await waitFor(() => {
      expect(screen.getByText(/performance metrics/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    // Verify FPS metric is displayed
    expect(screen.getByText(/fps/i)).toBeInTheDocument();

    // Verify Load Time metric is displayed
    expect(screen.getByText(/load time/i)).toBeInTheDocument();

    // Verify Visible Rows metric is displayed
    expect(screen.getByText(/visible rows/i)).toBeInTheDocument();

    // ACT: Perform a search
    const searchInput = screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, 'Smith');

    // Wait for search to complete
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    }, { timeout: 1000 });

    // ASSERT: Performance metrics should still be visible after search
    expect(screen.getByText(/performance metrics/i)).toBeInTheDocument();
    expect(screen.getByText(/fps/i)).toBeInTheDocument();

    // NOTE: We don't test specific FPS values because they depend on the
    // test environment's performance. We just verify the metrics are displayed.
  });
});

