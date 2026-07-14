import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Top-level React error boundary. Catches render-time errors that would
 * otherwise unmount the entire app, and shows a recoverable fallback instead.
 * API/async errors are handled separately (see api/client.ts and React Query
 * error handling), since error boundaries do not catch those.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-xl font-semibold text-ink-900">Something went wrong</h1>
          <p className="max-w-sm text-sm text-ink-500">
            Please reload the page. If the problem continues, your work has been saved as a draft.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="min-h-touch rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
