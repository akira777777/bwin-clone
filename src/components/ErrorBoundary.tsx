import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { logger } from '../utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary component for catching React component errors
 *
 * Catches JavaScript errors anywhere in the component tree below it,
 * logs those errors, and displays a fallback UI instead of the crashed component tree.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error with our logger
    logger.error(
      'React Error Boundary caught an error',
      error,
      {
        componentStack: errorInfo.componentStack,
      }
    );

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  override render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: 'rgba(220, 53, 69, 0.05)',
          borderRadius: '8px',
          margin: '1rem',
        }}>
          <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>
            Oops! Something went wrong
          </h2>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem', maxWidth: '400px' }}>
            We're sorry for the inconvenience. The application encountered an unexpected error.
            Please try refreshing the page.
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--betz-purple, #6b21a8)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Try Again
          </button>
          {this.state.error && (
            <details style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '600px' }}>
              <summary style={{ cursor: 'pointer', color: '#6c757d' }}>
                Technical details (for developers)
              </summary>
              <pre style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                fontSize: '0.875rem',
                overflow: 'auto',
                maxHeight: '200px',
              }}>
                {this.state.error.toString()}
                {'\n\n'}
                Component Stack:
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Functional component wrapper for easier use with hooks
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );
};
