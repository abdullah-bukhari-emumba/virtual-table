// ============================================================================
// ERROR BOUNDARY
// ============================================================================
// React Error Boundary for graceful error handling in forms
// ============================================================================

'use client';

import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: ReactNode;
  /** Custom fallback UI */
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  /** Error callback */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;
  /** The error that occurred */
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the entire app
 * 
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<div>Something went wrong</div>}>
 *   <Form>...</Form>
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Update state when an error is caught
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error details
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  /**
   * Reset error state
   */
  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.reset);
        }
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Something went wrong
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{this.state.error.message}</p>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-red-800 hover:text-red-900">
                    Error details (development only)
                  </summary>
                  <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs text-red-900">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={this.reset}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary wrapper
 * Provides a simpler API for functional components
 * 
 * @example
 * ```tsx
 * function MyForm() {
 *   return (
 *     <FormErrorBoundary>
 *       <Form>...</Form>
 *     </FormErrorBoundary>
 *   );
 * }
 * ```
 */
export function FormErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Form Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  An error occurred while processing the form. Please try again.
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <p className="mt-1 font-mono text-xs">{error.message}</p>
                )}
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                >
                  Reset form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

