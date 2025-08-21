import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ContentIdeasErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    logger.error('🔥 ContentIdeas ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('🔥 ContentIdeas ErrorBoundary details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      logger.error('🔥 ContentIdeas ErrorBoundary rendering fallback UI');
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50/50 to-white">
          <div className="text-center space-y-4 p-8 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
            <div className="text-red-500 text-2xl">🔥</div>
            <h2 className="text-xl font-semibold text-gray-900">Content Ideas Component Error</h2>
            <div className="text-left bg-gray-100 p-4 rounded-md overflow-auto max-h-64">
              <p className="font-mono text-sm text-red-600 mb-2">
                <strong>Error:</strong> {this.state.error?.message}
              </p>
              {this.state.error?.stack && (
                <pre className="font-mono text-xs text-gray-700 whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              )}
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined, errorInfo: undefined });
                  window.location.href = '/dashboard';
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}