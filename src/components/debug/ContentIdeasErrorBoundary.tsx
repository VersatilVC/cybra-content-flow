import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ContentIdeasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('🚨 ContentIdeas Error Boundary - Component crashed:', error);
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ContentIdeas Error Boundary - Full error details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-8 max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>
              <div className="space-y-4">
                <h3 className="font-semibold">ContentIdeas Component Error</h3>
                <p>Error: {this.state.error?.message}</p>
                <Button 
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  variant="outline"
                >
                  Try Again
                </Button>
                <details className="mt-4">
                  <summary className="cursor-pointer">Technical Details</summary>
                  <pre className="mt-2 text-sm bg-muted p-2 rounded overflow-auto">
                    {this.state.error?.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="mt-2 text-sm bg-muted p-2 rounded overflow-auto">
                      Component Stack: {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}