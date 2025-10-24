// ============================================================================
// SEARCH BAR COMPONENT
// ============================================================================
// Reusable search input component with clean styling and accessibility
// ============================================================================

import React from 'react';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

type SearchBarProps = {
  value: string;                    // Current search query
  onChange: (value: string) => void; // Callback when value changes
  placeholder?: string;              // Placeholder text (optional)
  className?: string;                // Additional CSS classes (optional)
};

// ============================================================================
// COMPONENT IMPLEMENTATION
// ============================================================================

/**
 * SearchBar - Reusable search input component
 * 
 * FEATURES:
 * - Clean, modern styling with focus states
 * - Accessible (proper labels, ARIA attributes)
 * - Customizable placeholder text
 * - Extensible via className prop
 * 
 * USAGE:
 * ```tsx
 * <SearchBar
 *   value={searchQuery}
 *   onChange={setSearchQuery}
 *   placeholder="Search by name or MRN..."
 * />
 * ```
 */
export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}: SearchBarProps) {
  return (
    <div className={className}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        aria-label="Search"
      />
    </div>
  );
}

