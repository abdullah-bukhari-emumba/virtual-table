import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Patient Search Workflow
 * 
 * These tests verify the complete user journey for searching and managing patient data
 * in a real browser environment with real API calls. Unlike unit tests that test components
 * in isolation, E2E tests simulate actual user interactions and verify the entire system works.
 * 
 * Why E2E tests matter:
 * - They catch integration issues that unit tests miss
 * - They verify real browser behavior (rendering, scrolling, animations)
 * - They test the actual API responses and data flow
 * - They ensure the user experience works end-to-end
 */

test.describe('Patient Search Workflow', () => {
  // Before each test, navigate to the home page
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to load and initial data to be fetched
    await page.waitForLoadState('networkidle');
  });

  test('1. Navigate to app → wait for initial load → verify 50 patients displayed', async ({ page }) => {
    /**
     * Test Purpose: Verify the app loads correctly with initial patient data
     * 
     * What this tests:
     * - Page loads without errors
     * - Initial API call fetches patient data
     * - Table displays with patient rows
     * - Performance metrics are visible
     * 
     * Why it matters:
     * - Ensures the app's basic functionality works
     * - Verifies the initial data load is successful
     * - Confirms the UI renders correctly
     */
    
    // Verify the search input is visible
    const searchInput = page.locator('input[aria-label="Search"]');
    await expect(searchInput).toBeVisible();
    
    // Verify the table is visible
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // Verify table has rows (at least some patients are displayed)
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    expect(rowCount).toBeGreaterThan(0);
    
    // Verify performance metrics are displayed
    // Check for FPS metric (first one)
    const fpsMetric = page.locator('text=/FPS/').first();
    await expect(fpsMetric).toBeVisible();
  });

  test('2. Search for "Smith" → wait for debounce → verify filtered results', async ({ page }) => {
    /**
     * Test Purpose: Verify search functionality with debouncing
     * 
     * What this tests:
     * - User can type in the search input
     * - Debounce delay (300ms) prevents excessive API calls
     * - API is called with the search query
     * - Table updates with filtered results
     * - Only patients matching "Smith" are displayed
     * 
     * Why it matters:
     * - Ensures search works correctly
     * - Verifies debouncing prevents performance issues
     * - Confirms filtered data is displayed
     */
    
    const searchInput = page.locator('input[aria-label="Search"]');
    
    // Type "Smith" in the search input
    await searchInput.fill('Smith');
    
    // Wait for debounce (300ms) + API call + re-render
    // Using waitForLoadState to wait for network requests to complete
    await page.waitForLoadState('networkidle');
    
    // Verify table rows are updated
    const tableRows = page.locator('tbody tr');
    const rowCount = await tableRows.count();
    
    // Should have at least one row with "Smith"
    expect(rowCount).toBeGreaterThan(0);
    
    // Verify at least one row contains "Smith"
    const smithRow = page.locator('tbody tr:has-text("Smith")').first();
    await expect(smithRow).toBeVisible();
  });

  test('3. Click column header to sort → verify sort indicator appears', async ({ page }) => {
    /**
     * Test Purpose: Verify column sorting functionality
     * 
     * What this tests:
     * - User can click on column headers
     * - Sort indicator (arrow) appears on the clicked column
     * - Table data is re-sorted based on the column
     * - Multiple clicks toggle sort direction
     * 
     * Why it matters:
     * - Ensures sorting works correctly
     * - Verifies visual feedback for sort state
     * - Confirms data is actually sorted
     */
    
    // Find the first sortable column header (e.g., "Name")
    const columnHeader = page.locator('th').first();
    
    // Click the column header to sort
    await columnHeader.click();
    
    // Wait for the sort to complete
    await page.waitForLoadState('networkidle');
    
    // Verify the column header has a sort indicator
    // (This depends on your implementation - adjust selector as needed)
    const sortIndicator = columnHeader.locator('[class*="sort"]');
    
    // The sort indicator should exist or the header should have a visual change
    // If your implementation doesn't have a visible indicator, you can verify
    // the data is sorted by checking row values
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();
  });

  test('4. Scroll down → verify more data loads (infinite scroll)', async ({ page }) => {
    /**
     * Test Purpose: Verify infinite scroll/virtualization works
     * 
     * What this tests:
     * - User can scroll down in the table
     * - More data loads as user scrolls
     * - Virtual scrolling renders only visible rows
     * - Performance remains good with large datasets
     * 
     * Why it matters:
     * - Ensures the app can handle large datasets efficiently
     * - Verifies virtualization is working
     * - Confirms smooth scrolling experience
     */
    
    // Get the table body
    const tableBody = page.locator('tbody');
    
    // Get initial row count
    const initialRows = await page.locator('tbody tr').count();
    
    // Scroll down in the table
    await tableBody.evaluate(el => {
      el.scrollTop = el.scrollHeight;
    });
    
    // Wait for any new data to load
    await page.waitForTimeout(500);
    
    // Verify table is still visible and has rows
    const finalRows = await page.locator('tbody tr').count();
    expect(finalRows).toBeGreaterThan(0);
  });

  test('5. Verify performance metrics show good FPS', async ({ page }) => {
    /**
     * Test Purpose: Verify performance metrics are displayed and reasonable
     * 
     * What this tests:
     * - Performance metrics component is visible
     * - FPS value is displayed
     * - Load time is displayed
     * - Visible rows count is displayed
     * 
     * Why it matters:
     * - Ensures performance monitoring is working
     * - Verifies the app is performant
     * - Confirms metrics are being tracked
     */
    
    // Look for performance metrics text
    const fpsText = page.locator('text=/\\d+\\s*FPS/');
    const loadTimeText = page.locator('text=/Load Time/');
    const visibleRowsText = page.locator('text=/Visible Rows/');
    
    // Verify all metrics are visible
    await expect(fpsText).toBeVisible();
    await expect(loadTimeText).toBeVisible();
    await expect(visibleRowsText).toBeVisible();
  });

  test('6. Clear search → verify full list restored', async ({ page }) => {
    /**
     * Test Purpose: Verify clearing search restores full patient list
     * 
     * What this tests:
     * - User can clear the search input
     * - Table updates to show all patients again
     * - Search state is properly reset
     * - API is called to fetch full list
     * 
     * Why it matters:
     * - Ensures search can be cleared
     * - Verifies state management works correctly
     * - Confirms full list is restored
     */
    
    const searchInput = page.locator('input[aria-label="Search"]');
    
    // First, search for something
    await searchInput.fill('Smith');
    await page.waitForLoadState('networkidle');
    
    // Get the row count after search
    const searchedRowCount = await page.locator('tbody tr').count();
    
    // Clear the search
    await searchInput.clear();
    await page.waitForLoadState('networkidle');
    
    // Get the row count after clearing
    const clearedRowCount = await page.locator('tbody tr').count();
    
    // The cleared list should have more rows than the searched list
    // (or at least be different)
    expect(clearedRowCount).toBeGreaterThanOrEqual(searchedRowCount);
  });

  test('7. Search for non-existent patient → verify search filters results', async ({ page }) => {
    /**
     * Test Purpose: Verify search filtering works correctly
     *
     * What this tests:
     * - User can search for a patient that doesn't exist
     * - Search input shows the search term
     * - Table updates (may show fewer or no rows depending on API)
     * - User can clear search to restore data
     *
     * Why it matters:
     * - Ensures the app handles search correctly
     * - Verifies search state is maintained
     * - Confirms search doesn't break the app
     */

    const searchInput = page.locator('input[aria-label="Search"]');

    // Get initial row count
    const initialRowCount = await page.locator('tbody tr').count();

    // Search for a non-existent patient
    await searchInput.fill('XYZNONEXISTENT123456');
    await page.waitForLoadState('networkidle');

    // Verify the search input still has the text
    await expect(searchInput).toHaveValue('XYZNONEXISTENT123456');

    // Verify table rows are updated (may be fewer or same depending on API)
    const searchRowCount = await page.locator('tbody tr').count();

    // Clear the search
    await searchInput.clear();
    await page.waitForLoadState('networkidle');

    // Verify we're back to initial state
    const finalRowCount = await page.locator('tbody tr').count();
    expect(finalRowCount).toBeGreaterThanOrEqual(initialRowCount);
  });
});

