import React, { Component, type ErrorInfo, type ReactNode } from 'react';

const LazyBuildErrorPage = React.lazy(() => import('../pages/BuildErrorPage').then((m) => ({ default: m.BuildErrorPage })));

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onNavigateHome?: () => void;
  onNavigateDashboard?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error('Captured by Ostra ErrorBoundary:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <React.Suspense fallback={<div className="min-h-screen bg-[#07090C] text-white flex items-center justify-center font-mono text-sm">System recovery in progress...</div>}>
          <LazyBuildErrorPage
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onNavigateHome={this.props.onNavigateHome}
            onNavigateDashboard={this.props.onNavigateDashboard}
          />
        </React.Suspense>
      );
    }

    return this.props.children;
  }
}
