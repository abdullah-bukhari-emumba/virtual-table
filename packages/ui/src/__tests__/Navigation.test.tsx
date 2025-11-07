import React from 'react';
import { render, screen } from '@testing-library/react';
import { Navigation } from '../Navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

import { usePathname } from 'next/navigation';

describe('Navigation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the navigation bar', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should render the default title', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      
      render(<Navigation />);
      
      expect(screen.getByText('Patient Virtual Table')).toBeInTheDocument();
    });

    it('should render custom title when provided', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      
      render(<Navigation title="Custom Title" />);
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should render logo with PT initials', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      
      render(<Navigation />);
      
      expect(screen.getByText('PT')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should render Patient Table link', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      
      render(<Navigation />);
      
      const link = screen.getByRole('link', { name: /Patient Table/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/');
    });

    it('should render Patient Intake Form link', () => {
      (usePathname as jest.Mock).mockReturnValue('/forms/patient-intake');
      
      render(<Navigation />);
      
      const link = screen.getByRole('link', { name: /Patient Intake Form/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/forms/patient-intake');
    });

    it('should have correct title attributes for accessibility', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      
      render(<Navigation />);
      
      const tableLink = screen.getByRole('link', { name: /Patient Table/i });
      expect(tableLink).toHaveAttribute('title', 'View patient records');
      
      const formLink = screen.getByRole('link', { name: /Patient Intake Form/i });
      expect(formLink).toHaveAttribute('title', 'Add new patient');
    });
  });

  describe('Active State Indicator', () => {
    it('should highlight Patient Table link when on root path', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      
      render(<Navigation />);
      
      const tableLink = screen.getByRole('link', { name: /Patient Table/i });
      expect(tableLink).toHaveClass('bg-blue-600');
    });

    it('should highlight Patient Table link when on empty path', () => {
      (usePathname as jest.Mock).mockReturnValue('');
      
      render(<Navigation />);
      
      const tableLink = screen.getByRole('link', { name: /Patient Table/i });
      expect(tableLink).toHaveClass('bg-blue-600');
    });

    it('should highlight Patient Intake Form link when on forms path', () => {
      (usePathname as jest.Mock).mockReturnValue('/forms/patient-intake');
      
      render(<Navigation />);
      
      const formLink = screen.getByRole('link', { name: /Patient Intake Form/i });
      expect(formLink).toHaveClass('bg-blue-600');
    });

    it('should highlight Patient Intake Form link for any forms subpath', () => {
      (usePathname as jest.Mock).mockReturnValue('/forms/some-other-form');
      
      render(<Navigation />);
      
      const formLink = screen.getByRole('link', { name: /Patient Intake Form/i });
      expect(formLink).toHaveClass('bg-blue-600');
    });

    it('should not highlight Patient Table link when on forms path', () => {
      (usePathname as jest.Mock).mockReturnValue('/forms/patient-intake');
      
      render(<Navigation />);
      
      const tableLink = screen.getByRole('link', { name: /Patient Table/i });
      expect(tableLink).not.toHaveClass('bg-blue-600');
      expect(tableLink).toHaveClass('text-slate-300');
    });

    it('should not highlight Patient Intake Form link when on root path', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      
      render(<Navigation />);
      
      const formLink = screen.getByRole('link', { name: /Patient Intake Form/i });
      expect(formLink).not.toHaveClass('bg-blue-600');
      expect(formLink).toHaveClass('text-slate-300');
    });
  });

  describe('Styling', () => {
    it('should have correct background color', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('bg-slate-800');
    });

    it('should have correct text color', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('text-white');
    });

    it('should have shadow styling', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('shadow-lg');
    });

    it('should apply custom className when provided', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      
      render(<Navigation className="custom-class" />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('custom-class');
    });
  });

  describe('Responsive Design', () => {
    it('should render mobile indicator', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      
      render(<Navigation />);
      
      // Mobile indicator shows emoji based on current page
      const indicators = screen.getAllByText(/📊|📋/);
      expect(indicators.length).toBeGreaterThan(0);
    });

    it('should show table emoji on patient table page', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      
      render(<Navigation />);
      
      expect(screen.getByText('📊')).toBeInTheDocument();
    });

    it('should show form emoji on forms page', () => {
      (usePathname as jest.Mock).mockReturnValue('/forms/patient-intake');
      
      render(<Navigation />);
      
      expect(screen.getByText('📋')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic HTML structure', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should have proper link roles', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      
      render(<Navigation />);
      
      const links = screen.getAllByRole('link');
      expect(links.length).toBe(2);
    });

    it('should have descriptive link text', () => {
      (usePathname as jest.Mock).mockReturnValue('/');
      
      render(<Navigation />);
      
      expect(screen.getByRole('link', { name: /Patient Table/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Patient Intake Form/i })).toBeInTheDocument();
    });
  });
});

