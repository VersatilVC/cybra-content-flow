import React, { useState, useEffect, Suspense } from 'react';
import { ContentIdeasErrorBoundary } from '@/components/debug/ContentIdeasErrorBoundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useOptimizedAuthContext } from '@/contexts/OptimizedAuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

// Progressive loading components
const MinimalContentIdeas = () => {
  console.log('✅ MinimalContentIdeas rendering');
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Content Ideas (Minimal)</h1>
      <p>This is a minimal version that should always work.</p>
    </div>
  );
};

const ContentIdeasWithAuth = () => {
  console.log('🔐 ContentIdeasWithAuth rendering');
  const { user, loading } = useOptimizedAuthContext();
  
  console.log('🔐 Auth state:', { 
    user: user ? 'exists' : 'null', 
    loading,
    userId: user?.id 
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <Alert>
        <AlertDescription>No authenticated user found</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Content Ideas (With Auth)</h1>
      <p>User authenticated: {user.email}</p>
    </div>
  );
};

const ContentIdeasWithHooks = () => {
  console.log('🪝 ContentIdeasWithHooks rendering');
  const { user } = useOptimizedAuthContext();
  const [testState, setTestState] = useState('initial');
  
  useEffect(() => {
    console.log('🪝 ContentIdeasWithHooks useEffect running');
    setTestState('mounted');
  }, []);

  console.log('🪝 Hook state:', { testState, user: user?.email });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Content Ideas (With Hooks)</h1>
      <p>Component state: {testState}</p>
      <p>User: {user?.email}</p>
    </div>
  );
};

export default function ContentIdeasDebug() {
  console.log('🐛 ContentIdeasDebug component rendering');
  const [testLevel, setTestLevel] = useState<'minimal' | 'auth' | 'hooks' | 'full'>('minimal');

  const renderTestComponent = () => {
    switch (testLevel) {
      case 'minimal':
        return <MinimalContentIdeas />;
      case 'auth':
        return <ContentIdeasWithAuth />;
      case 'hooks':
        return <ContentIdeasWithHooks />;
      case 'full':
        // Lazy load the full component to test import issues
        const ContentIdeas = React.lazy(() => import('./ContentIdeas'));
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ContentIdeas />
          </Suspense>
        );
      default:
        return <MinimalContentIdeas />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 border-b bg-muted">
        <h2 className="text-lg font-semibold mb-2">ContentIdeas Debug Mode</h2>
        <div className="flex gap-2">
          <Button 
            variant={testLevel === 'minimal' ? 'default' : 'outline'}
            onClick={() => setTestLevel('minimal')}
            size="sm"
          >
            Minimal
          </Button>
          <Button 
            variant={testLevel === 'auth' ? 'default' : 'outline'}
            onClick={() => setTestLevel('auth')}
            size="sm"
          >
            With Auth
          </Button>
          <Button 
            variant={testLevel === 'hooks' ? 'default' : 'outline'}
            onClick={() => setTestLevel('hooks')}
            size="sm"
          >
            With Hooks
          </Button>
          <Button 
            variant={testLevel === 'full' ? 'default' : 'outline'}
            onClick={() => setTestLevel('full')}
            size="sm"
          >
            Full Component
          </Button>
        </div>
      </div>

      <ContentIdeasErrorBoundary
        onError={(error, errorInfo) => {
          console.error('🚨 Debug error caught:', { error, errorInfo });
        }}
      >
        {renderTestComponent()}
      </ContentIdeasErrorBoundary>
    </div>
  );
}