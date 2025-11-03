// ============================================================================
// TABLE HEADER COMPONENT - UNIT TESTS
// ============================================================================
// Tests for the TableHeader component
//
// WHAT THIS COMPONENT DOES:
// TableHeader renders the header row of a table with sortable columns.
// Users can click column headers to sort the table data.
//
// TESTING STRATEGY:
// 1. Test rendering - does it show the right columns?
// 2. Test sorting - does clicking trigger the sort callback?
// 3. Test visual indicators - do sort arrows show correctly?
// 4. Test accessibility - can keyboard users interact with it?
// ============================================================================

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableHeader } from '../TableHeader';
import type { TableColumn } from '../../lib/virtualization/types';

// ============================================================================
// TEST DATA SETUP
// ============================================================================
// Create sample column definitions for testing
// These represent columns in a patient table

type TestPatient = {
  id: string;
  name: string;
  mrn: string;
  lastVisit: string;
};

const mockColumns: TableColumn<TestPatient>[] = [
  {
    key: 'name',
    label: 'Patient Name',
    sortable: true,
    render: (patient) => patient.name,
  },
  {
    key: 'mrn',
    label: 'MRN',
    sortable: true,
    render: (patient) => patient.mrn,
  },
  {
    key: 'lastVisit',
    label: 'Last Visit',
    sortable: true,
    render: (patient) => patient.lastVisit,
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false, // This column is not sortable
    render: () => 'View',
  },
];

// ============================================================================
// TEST SUITE: TableHeader Component
// ============================================================================
describe('TableHeader', () => {
  
  // ==========================================================================
  // TEST 1: Renders All Column Headers
  // ==========================================================================
  // WHAT THIS TESTS: All column headers are displayed
  // WHY IT MATTERS: Users need to see what each column contains
  it('should render all column headers', () => {
    // ARRANGE
    const mockOnSort = jest.fn();
    
    // ACT: Render the component
    render(
      <table>
        <TableHeader
          columns={mockColumns}
          sortColumn="name"
          sortOrder="asc"
          onSort={mockOnSort}
        />
      </table>
    );
    
    // ASSERT: All headers should be visible
    expect(screen.getByText('Patient Name')).toBeInTheDocument();
    expect(screen.getByText('MRN')).toBeInTheDocument();
    expect(screen.getByText('Last Visit')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 2: Calls onSort When Sortable Column Clicked
  // ==========================================================================
  // WHAT THIS TESTS: Clicking a sortable column triggers the sort callback
  // WHY IT MATTERS: This is the core interaction - users sort by clicking
  it('should call onSort when sortable column is clicked', async () => {
    // ARRANGE
    const mockOnSort = jest.fn();
    const user = userEvent.setup();
    
    // ACT: Render the component
    render(
      <table>
        <TableHeader
          columns={mockColumns}
          sortColumn="name"
          sortOrder="asc"
          onSort={mockOnSort}
        />
      </table>
    );
    
    // ACT: Click the MRN column header
    const mrnHeader = screen.getByText('MRN');
    await user.click(mrnHeader);
    
    // ASSERT: onSort should be called with the column key
    expect(mockOnSort).toHaveBeenCalledTimes(1);
    expect(mockOnSort).toHaveBeenCalledWith('mrn');
  });

  // ==========================================================================
  // TEST 3: Does Not Call onSort for Non-Sortable Columns
  // ==========================================================================
  // WHAT THIS TESTS: Non-sortable columns don't trigger sort
  // WHY IT MATTERS: Some columns (like Actions) shouldn't be sortable
  it('should not call onSort for non-sortable columns', async () => {
    // ARRANGE
    const mockOnSort = jest.fn();
    const user = userEvent.setup();
    
    // ACT
    render(
      <table>
        <TableHeader
          columns={mockColumns}
          sortColumn="name"
          sortOrder="asc"
          onSort={mockOnSort}
        />
      </table>
    );
    
    // ACT: Click the Actions column (not sortable)
    const actionsHeader = screen.getByText('Actions');
    await user.click(actionsHeader);
    
    // ASSERT: onSort should NOT be called
    expect(mockOnSort).not.toHaveBeenCalled();
  });

  // ==========================================================================
  // TEST 4: Shows Ascending Sort Indicator
  // ==========================================================================
  // WHAT THIS TESTS: Visual indicator shows when column is sorted ascending
  // WHY IT MATTERS: Users need visual feedback about current sort
  it('should show ascending sort indicator on active column', () => {
    // ARRANGE
    const mockOnSort = jest.fn();
    
    // ACT: Render with name column sorted ascending
    render(
      <table>
        <TableHeader
          columns={mockColumns}
          sortColumn="name"
          sortOrder="asc"
          onSort={mockOnSort}
        />
      </table>
    );
    
    // ASSERT: Should show up arrow (↑) for ascending sort
    const nameHeader = screen.getByText('Patient Name');
    expect(nameHeader.textContent).toContain('↑');
  });

  // ==========================================================================
  // TEST 5: Shows Descending Sort Indicator
  // ==========================================================================
  // WHAT THIS TESTS: Visual indicator shows when column is sorted descending
  // WHY IT MATTERS: Users need to know the sort direction
  it('should show descending sort indicator on active column', () => {
    // ARRANGE
    const mockOnSort = jest.fn();
    
    // ACT: Render with name column sorted descending
    render(
      <table>
        <TableHeader
          columns={mockColumns}
          sortColumn="name"
          sortOrder="desc"
          onSort={mockOnSort}
        />
      </table>
    );
    
    // ASSERT: Should show down arrow (↓) for descending sort
    const nameHeader = screen.getByText('Patient Name');
    expect(nameHeader.textContent).toContain('↓');
  });

  // ==========================================================================
  // TEST 6: No Sort Indicator on Inactive Columns
  // ==========================================================================
  // WHAT THIS TESTS: Only the active sort column shows an indicator
  // WHY IT MATTERS: Prevents confusion about which column is sorted
  it('should not show sort indicator on inactive columns', () => {
    // ARRANGE
    const mockOnSort = jest.fn();
    
    // ACT: Render with name column sorted
    render(
      <table>
        <TableHeader
          columns={mockColumns}
          sortColumn="name"
          sortOrder="asc"
          onSort={mockOnSort}
        />
      </table>
    );
    
    // ASSERT: MRN column should not have sort indicator
    const mrnHeader = screen.getByText('MRN');
    expect(mrnHeader.textContent).not.toContain('↑');
    expect(mrnHeader.textContent).not.toContain('↓');
  });

  // ==========================================================================
  // TEST 7: Sortable Columns Have Pointer Cursor
  // ==========================================================================
  // WHAT THIS TESTS: Sortable columns show they're clickable
  // WHY IT MATTERS: Visual affordance - users know they can click
  it('should apply cursor-pointer to sortable columns', () => {
    // ARRANGE
    const mockOnSort = jest.fn();
    
    // ACT
    render(
      <table>
        <TableHeader
          columns={mockColumns}
          sortColumn="name"
          sortOrder="asc"
          onSort={mockOnSort}
        />
      </table>
    );
    
    // ASSERT: Sortable column should have pointer cursor
    const nameHeader = screen.getByText('Patient Name').closest('th');
    expect(nameHeader).toHaveClass('cursor-pointer');
  });

  // ==========================================================================
  // TEST 8: Non-Sortable Columns Don't Have Pointer Cursor
  // ==========================================================================
  // WHAT THIS TESTS: Non-sortable columns don't look clickable
  // WHY IT MATTERS: Prevents user confusion
  it('should not apply cursor-pointer to non-sortable columns', () => {
    // ARRANGE
    const mockOnSort = jest.fn();
    
    // ACT
    render(
      <table>
        <TableHeader
          columns={mockColumns}
          sortColumn="name"
          sortOrder="asc"
          onSort={mockOnSort}
        />
      </table>
    );
    
    // ASSERT: Non-sortable column should not have pointer cursor
    const actionsHeader = screen.getByText('Actions').closest('th');
    expect(actionsHeader).not.toHaveClass('cursor-pointer');
  });

  // ==========================================================================
  // TEST 9: Handles Multiple Column Clicks
  // ==========================================================================
  // WHAT THIS TESTS: Can switch between sorting different columns
  // WHY IT MATTERS: Users need to sort by different criteria
  it('should handle clicking different columns', async () => {
    // ARRANGE
    const mockOnSort = jest.fn();
    const user = userEvent.setup();
    
    // ACT
    render(
      <table>
        <TableHeader
          columns={mockColumns}
          sortColumn="name"
          sortOrder="asc"
          onSort={mockOnSort}
        />
      </table>
    );
    
    // ACT: Click different columns
    await user.click(screen.getByText('Patient Name'));
    await user.click(screen.getByText('MRN'));
    await user.click(screen.getByText('Last Visit'));
    
    // ASSERT: onSort called for each click with correct column
    expect(mockOnSort).toHaveBeenCalledTimes(3);
    expect(mockOnSort).toHaveBeenNthCalledWith(1, 'name');
    expect(mockOnSort).toHaveBeenNthCalledWith(2, 'mrn');
    expect(mockOnSort).toHaveBeenNthCalledWith(3, 'lastVisit');
  });

  // ==========================================================================
  // TEST 10: Renders with Empty Columns Array
  // ==========================================================================
  // WHAT THIS TESTS: Component handles edge case of no columns
  // WHY IT MATTERS: Prevents crashes with invalid data
  it('should handle empty columns array', () => {
    // ARRANGE
    const mockOnSort = jest.fn();
    
    // ACT: Render with no columns
    render(
      <table>
        <TableHeader
          columns={[]}
          sortColumn=""
          sortOrder="asc"
          onSort={mockOnSort}
        />
      </table>
    );
    
    // ASSERT: Should render without crashing
    // No headers should be present
    const thead = screen.getByRole('rowgroup');
    expect(thead).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 11: Active Column Shows Sort Indicator
  // ==========================================================================
  // WHAT THIS TESTS: Active sort column shows visual indicator
  // WHY IT MATTERS: Users need to see which column is currently sorted
  it('should show sort indicator only on active column', () => {
    // ARRANGE
    const mockOnSort = jest.fn();

    // ACT
    render(
      <table>
        <TableHeader
          columns={mockColumns}
          sortColumn="name"
          sortOrder="asc"
          onSort={mockOnSort}
        />
      </table>
    );

    // ASSERT: Active column should have sort indicator
    const nameHeader = screen.getByText('Patient Name');
    expect(nameHeader.textContent).toContain('↑');

    // Other sortable columns should not have indicators
    const mrnHeader = screen.getByText('MRN');
    expect(mrnHeader.textContent).not.toContain('↑');
    expect(mrnHeader.textContent).not.toContain('↓');
  });
});

