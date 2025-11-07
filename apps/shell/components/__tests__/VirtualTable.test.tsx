// ============================================================================
// VIRTUAL TABLE COMPONENT - UNIT TESTS
// ============================================================================
// Tests for the VirtualTable component
//
// WHAT THIS COMPONENT DOES:
// VirtualTable renders large datasets efficiently by only rendering visible
// rows. It uses the useVirtualization hook to calculate which rows should
// be displayed based on scroll position.
//
// TESTING STRATEGY:
// 1. Test basic rendering - does it render without crashing?
// 2. Test data rendering - does it show the data?
// 3. Test column rendering - does it show all columns?
// 4. Test sorting integration - does it pass sort props correctly?
// 5. Test loading state - does it show loading indicator?
// ============================================================================

import { render, screen } from '@testing-library/react';
import { VirtualTable } from '../VirtualTable';
import type { TableColumn } from '../../lib/virtualization/types';

// ============================================================================
// TEST DATA SETUP
// ============================================================================

type TestPatient = {
  id: string;
  name: string;
  age: number;
  status: string;
};

const mockPatients: TestPatient[] = [
  { id: '1', name: 'John Doe', age: 30, status: 'Active' },
  { id: '2', name: 'Jane Smith', age: 25, status: 'Inactive' },
  { id: '3', name: 'Bob Johnson', age: 45, status: 'Active' },
];

const mockColumns: TableColumn<TestPatient>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    render: (patient) => patient.name,
  },
  {
    key: 'age',
    label: 'Age',
    sortable: true,
    render: (patient) => patient.age.toString(),
  },
  {
    key: 'status',
    label: 'Status',
    sortable: false,
    render: (patient) => patient.status,
  },
];

// ============================================================================
// TEST SUITE: VirtualTable Component
// ============================================================================
describe('VirtualTable', () => {
  
  // ==========================================================================
  // TEST 1: Renders Without Crashing
  // ==========================================================================
  // WHAT THIS TESTS: Component renders successfully
  // WHY IT MATTERS: Basic smoke test to ensure no syntax errors
  it('should render without crashing', () => {
    // ACT
    render(
      <VirtualTable
        data={mockPatients}
        getItemId={(p) => p.id}
        columns={mockColumns}
      />
    );
    
    // ASSERT: Component should render (no error thrown)
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 2: Renders Column Headers
  // ==========================================================================
  // WHAT THIS TESTS: All column headers are displayed
  // WHY IT MATTERS: Users need to see what each column represents
  it('should render all column headers', () => {
    // ACT
    render(
      <VirtualTable
        data={mockPatients}
        getItemId={(p) => p.id}
        columns={mockColumns}
      />
    );
    
    // ASSERT: All column headers should be visible
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 3: Renders Data Rows
  // ==========================================================================
  // WHAT THIS TESTS: Data is displayed in the table
  // WHY IT MATTERS: Core functionality - showing data to users
  it('should render data rows', () => {
    // ACT
    render(
      <VirtualTable
        data={mockPatients}
        getItemId={(p) => p.id}
        columns={mockColumns}
      />
    );
    
    // ASSERT: Patient data should be visible
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 4: Handles Empty Data
  // ==========================================================================
  // WHAT THIS TESTS: Component handles empty array gracefully
  // WHY IT MATTERS: Prevents crashes when no data is available
  it('should handle empty data array', () => {
    // ACT
    render(
      <VirtualTable
        data={[]}
        getItemId={(p) => p.id}
        columns={mockColumns}
      />
    );
    
    // ASSERT: Should render table with headers but no data rows
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 5: Applies Custom ClassName
  // ==========================================================================
  // WHAT THIS TESTS: Custom CSS classes are applied
  // WHY IT MATTERS: Allows customization of table appearance
  it('should apply custom className', () => {
    // ACT
    const { container } = render(
      <VirtualTable
        data={mockPatients}
        getItemId={(p) => p.id}
        columns={mockColumns}
        className="custom-table-class"
      />
    );
    
    // ASSERT: Custom class should be present
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('custom-table-class');
  });

  // ==========================================================================
  // TEST 6: Renders with Custom Max Height
  // ==========================================================================
  // WHAT THIS TESTS: maxHeight prop is applied to scrollable container
  // WHY IT MATTERS: Controls viewport size for virtualization
  it('should apply custom maxHeight', () => {
    // ACT
    const { container } = render(
      <VirtualTable
        data={mockPatients}
        getItemId={(p) => p.id}
        columns={mockColumns}
        maxHeight="400px"
      />
    );
    
    // ASSERT: Find the scrollable div and check its style
    const scrollableDiv = container.querySelector('.overflow-auto') as HTMLElement;
    expect(scrollableDiv).toHaveStyle({ maxHeight: '400px' });
  });

  // ==========================================================================
  // TEST 7: Renders Loading State
  // ==========================================================================
  // WHAT THIS TESTS: Loading indicator is shown when loading prop is true
  // WHY IT MATTERS: Provides feedback during data fetching
  it('should show loading indicator when loading is true', () => {
    // ACT
    render(
      <VirtualTable
        data={mockPatients}
        getItemId={(p) => p.id}
        columns={mockColumns}
        loading={true}
      />
    );
    
    // ASSERT: Loading text should be visible
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  // ==========================================================================
  // TEST 8: Renders with Default Row Height
  // ==========================================================================
  // WHAT THIS TESTS: defaultRowHeight prop is accepted
  // WHY IT MATTERS: Allows customization of row sizing
  it('should accept defaultRowHeight prop', () => {
    // ACT & ASSERT: Should render without error
    expect(() => {
      render(
        <VirtualTable
          data={mockPatients}
          getItemId={(p) => p.id}
          columns={mockColumns}
          defaultRowHeight={60}
        />
      );
    }).not.toThrow();
  });

  // ==========================================================================
  // TEST 9: Renders with Overscan
  // ==========================================================================
  // WHAT THIS TESTS: overscan prop is accepted
  // WHY IT MATTERS: Controls buffer size for smooth scrolling
  it('should accept overscan prop', () => {
    // ACT & ASSERT: Should render without error
    expect(() => {
      render(
        <VirtualTable
          data={mockPatients}
          getItemId={(p) => p.id}
          columns={mockColumns}
          overscan={10}
        />
      );
    }).not.toThrow();
  });

  // ==========================================================================
  // TEST 10: Renders with Sort Props
  // ==========================================================================
  // WHAT THIS TESTS: Sorting props are passed to TableHeader
  // WHY IT MATTERS: Enables column sorting functionality
  it('should pass sort props to TableHeader', () => {
    // ARRANGE
    const mockOnSort = jest.fn();
    
    // ACT
    render(
      <VirtualTable
        data={mockPatients}
        getItemId={(p) => p.id}
        columns={mockColumns}
        sortColumn="name"
        sortOrder="asc"
        onSort={mockOnSort}
      />
    );
    
    // ASSERT: Sort indicator should be visible (↑ for ascending)
    expect(screen.getByText('↑')).toBeInTheDocument();
  });
});

