/**
 * @file ErrorBoundary.tsx
 * @description React class-based error boundary.
 *
 *   Catches unhandled rendering errors in the component tree and displays a
 *   graceful fallback instead of an empty/crashed screen.
 *
 *   Why a class component: React's error boundary API (`componentDidCatch`
 *   and `getDerivedStateFromError`) is only available in class components.
 *   This is the single acceptable use of a class component in this codebase.
 */

import React, { type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Optional custom fallback UI. Defaults to the built-in error card. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message ?? 'Unknown rendering error.' };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // In production a real app would forward this to a monitoring service (e.g. Sentry).
    console.error('[AeroShield ErrorBoundary] Caught an error:', error, info.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render(): ReactNode {
    const { hasError, errorMessage } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) return children;
    if (fallback) return fallback;

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="flex flex-col items-center justify-center min-h-[200px] p-8 m-4 rounded-2xl
                   border border-red-700/40 bg-red-950/20 text-center"
      >
        <span className="text-4xl mb-3" aria-hidden="true">⚠️</span>
        <h2 className="text-lg font-semibold text-red-400 mb-2">Something went wrong</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          {errorMessage || 'An unexpected error occurred while rendering this section.'}
        </p>
        <button
          onClick={this.handleReset}
          className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm
                     font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          Try Again
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
