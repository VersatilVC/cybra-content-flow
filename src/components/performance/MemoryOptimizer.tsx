import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useMemoryOptimizer() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Monitor memory usage and clean up if needed
    const monitorMemory = () => {
      if ('memory' in performance && (performance as any).memory) {
        const memInfo = (performance as any).memory;
        const usedMB = memInfo.usedJSHeapSize / (1024 * 1024);
        
        // If using more than 100MB, trigger cleanup
        if (usedMB > 100) {
          console.log('Memory usage high, cleaning up query cache...');
          
          // Remove older, less important queries
          queryClient.getQueryCache().getAll().forEach((query) => {
            const age = Date.now() - query.state.dataUpdatedAt;
            const key = query.queryKey[0];
            
            // Remove queries older than 15 minutes that aren't critical
            if (age > 15 * 60 * 1000 && 
                typeof key === 'string' && 
                !key.includes('profile') && 
                !key.includes('dashboard-stats')) {
              queryClient.removeQueries({ queryKey: query.queryKey });
            }
          });
          
          // Force garbage collection if available
          if ('gc' in window && typeof (window as any).gc === 'function') {
            (window as any).gc();
          }
        }
      }
    };

    // Check memory every 2 minutes
    const interval = setInterval(monitorMemory, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [queryClient]);

  // Cleanup on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Clean up non-essential queries when page becomes hidden
        queryClient.getQueryCache().getAll().forEach((query) => {
          const key = query.queryKey[0];
          if (typeof key === 'string' && 
              (key.includes('notifications') || key.includes('chat-messages'))) {
            queryClient.removeQueries({ queryKey: query.queryKey });
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [queryClient]);
}