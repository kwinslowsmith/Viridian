'use client';

import React, { ReactNode, useState, useEffect } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [state, setState] = useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
  });

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setState({
        hasError: true,
        error: event.error,
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      setState({
        hasError: true,
        error: event.reason,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const retry = () => {
    setState({ hasError: false, error: null });
  };

  if (state.hasError && state.error) {
    if (fallback) {
      return <>{fallback(state.error, retry)}</>;
    }

    return (
      <div
        style={{
          padding: '24px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          margin: '16px',
        }}
      >
        <h2 style={{ color: '#991b1b', marginTop: 0 }}>Something went wrong</h2>
        <p style={{ color: '#7f1d1d', margin: '8px 0' }}>
          {state.error.message}
        </p>
        <button
          onClick={retry}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
