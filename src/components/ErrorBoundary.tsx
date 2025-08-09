
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  private getErrorMessage = (error: Error | null): string => {
    if (!error) return 'An unknown error occurred';
    
    if (error.message.includes('auth') || error.message.includes('JWT')) {
      return 'Authentication error - please try logging in again';
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network error - please check your connection and try again';
    }
    
    if (error.message.includes('permission') || error.message.includes('policy')) {
      return 'Permission error - you may not have access to this resource';
    }
    
    return error.message || 'An unexpected error occurred';
  };

  public render() {
    if (this.state.hasError) {
      const errorMessage = this.getErrorMessage(this.state.error);
      const isAuthError = this.state.error?.message.includes('auth') || 
                         this.state.error?.message.includes('JWT');

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
          <div className="text-center space-y-6 max-w-md">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
              <p className="text-gray-300 mb-4">
                {errorMessage}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-gray-800 p-4 rounded text-sm text-gray-300 mb-4">
                  <summary className="cursor-pointer mb-2 text-gray-100">Error Details</summary>
                  <pre className="whitespace-pre-wrap break-all">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={this.handleReset} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              {isAuthError && (
                <Button 
                  onClick={() => window.location.href = '/auth'} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Login Again
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
