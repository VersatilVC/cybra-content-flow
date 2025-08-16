import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { useMemoryOptimizer } from './MemoryOptimizer';

interface QueryCacheOptimizerProps {
  children: React.ReactNode;
}

export function QueryCacheOptimizer({ children }: QueryCacheOptimizerProps) {
  const queryClient = useQueryClient();
  const { user } = useOptimizedAuth();
  useMemoryOptimizer();

  useEffect(() => {
    if (!user?.id) return;

    // Set up intelligent cache cleanup
    const cleanup = () => {
      const cacheSize = queryClient.getQueryCache().getAll().length;
      
      // If cache is getting large, clean up old queries
      if (cacheSize > 100) {
        queryClient.getQueryCache().getAll().forEach((query) => {
          const key = query.queryKey[0];
          const lastUpdated = query.state.dataUpdatedAt;
          const isOld = Date.now() - lastUpdated > 30 * 60 * 1000; // 30 minutes
          
          // Remove old, less important queries
          if (isOld && typeof key === 'string' && !key.includes('profile') && !key.includes('dashboard-stats')) {
            queryClient.removeQueries({ queryKey: query.queryKey });
          }
        });
      }
    };

    // Run cleanup every 5 minutes
    const interval = setInterval(cleanup, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.id, queryClient]);

  useEffect(() => {
    // Optimize query default options based on query type
    queryClient.setDefaultOptions({
      queries: {
        staleTime: 2 * 60 * 1000, // Default 2 minutes
        gcTime: 10 * 60 * 1000, // Default 10 minutes
        
        retry: (failureCount, error: any) => {
          // Don't retry auth errors
          if (error?.status === 401 || error?.status === 403) return false;
          
          // Retry other errors up to 2 times
          return failureCount < 2;
        },
        
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      
      mutations: {
        retry: 0,
        // Invalidate related queries on mutation success
        onSuccess: (data, variables, context: any) => {
          if (context?.invalidateQueries) {
            context.invalidateQueries.forEach((queryKey: any[]) => {
              queryClient.invalidateQueries({ queryKey });
            });
          }
        },
      },
    });
  }, [queryClient]);

  return <>{children}</>;
}
