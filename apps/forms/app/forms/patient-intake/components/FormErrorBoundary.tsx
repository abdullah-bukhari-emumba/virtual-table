// ============================================================================
// FORM ERROR BOUNDARY - REACT ERROR HANDLING
// ============================================================================
// This component implements React Error Boundaries to catch and handle errors
// that occur within the form components. It provides a user-friendly fallback
// UI when errors occur, preventing the entire application from crashing.
//
// ERROR BOUNDARY PATTERN:
// Error boundaries are React components that catch JavaScript errors anywhere
// in their child component tree, log those errors, and display a fallback UI
// instead of the component tree that crashed.
//
// KEY FEATURES:
// - Catches errors in child components during rendering
// - Logs errors to console for debugging
// - Displays user-friendly error message
// - Provides "Reset Form" button to recover from errors
// - Prevents entire app from crashing due to form errors
//
// USAGE:
// <FormErrorBoundary>
//   <Form>
//     {/* Form fields */}
//   </Form>
// </FormErrorBoundary>
// ============================================================================

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * FormErrorBoundaryProps - Props for the error boundary component
 */
interface FormErrorBoundaryProps {
  children: ReactNode;                    // Child components to monitor
  fallback?: ReactNode;                   // Custom fallback UI (optional)
  onError?: (error: Error, errorInfo: ErrorInfo) => void; // Error callback
}

/**
 * FormErrorBoundaryState - State for the error boundary
 */
interface FormErrorBoundaryState {
  hasError: boolean;                      // Has an error occurred?
  error: Error | null;                    // The error object
  errorInfo: ErrorInfo | null;            // React error info
}

// ============================================================================
// FORM ERROR BOUNDARY COMPONENT
// ============================================================================
/**
 * FormErrorBoundary - Error boundary for form components
 * 
 * This class component catches errors in child components and displays
 * a fallback UI. It implements React's error boundary lifecycle methods.
 * 
 * LIFECYCLE METHODS:
 * - getDerivedStateFromError: Update state when error occurs
 * - componentDidCatch: Log error details
 * 
 * STATE:
 * - hasError: Boolean indicating if an error has occurred
 * - error: The error object (if any)
 * - errorInfo: React error information (component stack trace)
 * 
 * METHODS:
 * - handleReset: Reset the error boundary state
 * 
 * NOTE: Error boundaries must be class components (not functional components)
 * because they use special lifecycle methods not available in hooks.
 */
export class FormErrorBoundary extends Component<
  FormErrorBoundaryProps,
  FormErrorBoundaryState
> {
  // ==========================================================================
  // CONSTRUCTOR
  // ==========================================================================
  constructor(props: FormErrorBoundaryProps) {
    super(props);
    
    // Initialize state with no error
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  // ==========================================================================
  // ERROR BOUNDARY LIFECYCLE METHODS
  // ==========================================================================
  
  /**
   * getDerivedStateFromError - Static lifecycle method
   * 
   * This method is called when an error is thrown in a child component.
   * It updates the state to trigger a re-render with the fallback UI.
   * 
   * EXECUTION FLOW:
   * 1. Error occurs in child component
   * 2. React calls this method with the error
   * 3. Return new state to trigger re-render
   * 4. Component renders fallback UI instead of children
   * 
   * PARAMETERS:
   * - error: The error that was thrown
   * 
   * RETURNS:
   * - New state object with hasError: true
   */
  static getDerivedStateFromError(error: Error): FormErrorBoundaryState {
    // Update state to show fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  /**
   * componentDidCatch - Lifecycle method for error logging
   * 
   * This method is called after an error has been caught.
   * It's used for logging errors and calling error callbacks.
   * 
   * EXECUTION FLOW:
   * 1. Error is caught by getDerivedStateFromError
   * 2. Component re-renders with fallback UI
   * 3. This method is called for side effects (logging)
   * 
   * PARAMETERS:
   * - error: The error that was thrown
   * - errorInfo: React error information (component stack)
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console for debugging
    console.error('='.repeat(80));
    console.error('FORM ERROR BOUNDARY CAUGHT AN ERROR');
    console.error('='.repeat(80));
    console.error('Error:', error);
    console.error('Error Message:', error.message);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('='.repeat(80));
    
    // Update state with error info
    this.setState({
      errorInfo,
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  // ==========================================================================
  // ERROR RECOVERY
  // ==========================================================================
  
  /**
   * handleReset - Reset the error boundary
   * 
   * This method resets the error boundary state, allowing the user to
   * try again after an error. It clears the error and re-renders children.
   * 
   * EXECUTION FLOW:
   * 1. User clicks "Reset Form" button
   * 2. This method is called
   * 3. State is reset to no error
   * 4. Component re-renders with children (not fallback)
   */
  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================
  
  /**
   * render - Render method
   * 
   * Renders either the fallback UI (if error) or children (if no error).
   * 
   * EXECUTION FLOW:
   * 1. Check if error has occurred
   * 2. If yes: Render fallback UI
   * 3. If no: Render children normally
   */
  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    // If error occurred, show fallback UI
    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-8">
            {/* Error Icon */}
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Error Title */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Oops! Something went wrong
            </h2>

            {/* Error Description */}
            <p className="text-gray-600 text-center mb-6">
              The form encountered an unexpected error. Dont worry, your data is safe.
              You can try resetting the form or refreshing the page.
            </p>

            {/* Error Details (Development Mode) */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-sm font-semibold text-red-900 mb-2">
                  Error Details (Development Mode):
                </h3>
                <p className="text-xs text-red-800 font-mono mb-2">
                  {error.toString()}
                </p>
                {errorInfo && (
                  <details className="text-xs text-red-700">
                    <summary className="cursor-pointer font-semibold mb-1">
                      Component Stack
                    </summary>
                    <pre className="whitespace-pre-wrap overflow-auto max-h-40 p-2 bg-red-100 rounded">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {/* Reset Button */}
              <button
                onClick={this.handleReset}
                className="
                  px-6 py-3 
                  bg-blue-600 text-white 
                  font-medium rounded-lg 
                  hover:bg-blue-700 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  transition-colors
                "
              >
                Reset Form
              </button>

              {/* Refresh Page Button */}
              <button
                onClick={() => window.location.reload()}
                className="
                  px-6 py-3 
                  bg-gray-200 text-gray-800 
                  font-medium rounded-lg 
                  hover:bg-gray-300 
                  focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                  transition-colors
                "
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    // No error: render children normally
    return children;
  }
}

