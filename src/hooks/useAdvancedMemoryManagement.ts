import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface MemoryManagementOptions {
  maxCacheSize: number; // Max number of queries to keep
  maxMemoryUsage: number; // Max memory usage in MB
  cleanupInterval: number; // Cleanup interval in ms
  aggressiveCleanup: boolean; // Whether to use aggressive cleanup
}

export function useAdvancedMemoryManagement({
  maxCacheSize = 100,
  maxMemoryUsage = 200,
  cleanupInterval = 2 * 60 * 1000, // 2 minutes
  aggressiveCleanup = false
}: Partial<MemoryManagementOptions> = {}) {
  const queryClient = useQueryClient();
  const cleanupTimeout = useRef<NodeJS.Timeout | null>(null);
  const memoryCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const lastCleanupTime = useRef<number>(Date.now());

  // Get current memory usage
  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance && (performance as any).memory) {
      const memInfo = (performance as any).memory;
      return {
        used: memInfo.usedJSHeapSize / (1024 * 1024),
        total: memInfo.totalJSHeapSize / (1024 * 1024),
        limit: memInfo.jsHeapSizeLimit / (1024 * 1024)
      };
    }
    return { used: 0, total: 0, limit: 0 };
  }, []);

  // Smart cache cleanup based on usage patterns
  const performSmartCleanup = useCallback(() => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    if (queries.length <= maxCacheSize) return;

    // Sort queries by priority for cleanup
    const sortedQueries = queries.sort((a, b) => {
      // Priority factors:
      // 1. Age (older first)
      // 2. Access frequency (less accessed first)
      // 3. Data size (larger first if aggressive cleanup)
      // 4. Query type (non-critical first)
      
      const ageA = Date.now() - a.state.dataUpdatedAt;
      const ageB = Date.now() - b.state.dataUpdatedAt;
      
      // Critical queries (keep longer)
      const criticalA = a.queryKey.some(key => 
        typeof key === 'string' && 
        (key.includes('profile') || key.includes('auth') || key.includes('dashboard-stats'))
      );
      const criticalB = b.queryKey.some(key => 
        typeof key === 'string' && 
        (key.includes('profile') || key.includes('auth') || key.includes('dashboard-stats'))
      );
      
      if (criticalA && !criticalB) return 1;
      if (!criticalA && criticalB) return -1;
      
      // Age-based sorting
      return ageB - ageA;
    });

    // Remove oldest queries beyond maxCacheSize
    const queriesToRemove = sortedQueries.slice(maxCacheSize);
    
    queriesToRemove.forEach(query => {
      queryClient.removeQueries({ queryKey: query.queryKey });
    });

    console.log(`Smart cleanup: Removed ${queriesToRemove.length} queries`);
    lastCleanupTime.current = Date.now();
  }, [queryClient, maxCacheSize]);

  // Memory pressure detection and cleanup
  const handleMemoryPressure = useCallback(() => {
    const memory = getMemoryUsage();
    
    if (memory.used > maxMemoryUsage) {
      console.warn(`Memory pressure detected: ${memory.used.toFixed(2)}MB used`);
      
      // Progressive cleanup based on memory pressure level
      const pressureLevel = memory.used / maxMemoryUsage;
      
      if (pressureLevel > 1.5) {
        // Critical pressure - aggressive cleanup
        const queryCache = queryClient.getQueryCache();
        const queries = queryCache.getAll();
        
        // Remove all non-critical queries
        queries.forEach(query => {
          const isCritical = query.queryKey.some(key => 
            typeof key === 'string' && 
            (key.includes('profile') || key.includes('auth'))
          );
          
          if (!isCritical) {
            queryClient.removeQueries({ queryKey: query.queryKey });
          }
        });
        
        // Force garbage collection if available
        if ('gc' in window && typeof (window as any).gc === 'function') {
          (window as any).gc();
        }
        
        console.log('Critical memory cleanup performed');
        
      } else if (pressureLevel > 1.2) {
        // High pressure - smart cleanup
        performSmartCleanup();
        
      } else {
        // Moderate pressure - remove old queries only
        const queryCache = queryClient.getQueryCache();
        queryCache.getAll().forEach(query => {
          const age = Date.now() - query.state.dataUpdatedAt;
          if (age > 15 * 60 * 1000) { // 15 minutes
            queryClient.removeQueries({ queryKey: query.queryKey });
          }
        });
      }
    }
  }, [getMemoryUsage, maxMemoryUsage, queryClient, performSmartCleanup]);

  // Proactive memory management
  const setupProactiveCleanup = useCallback(() => {
    // Regular cleanup interval
    cleanupTimeout.current = setInterval(() => {
      performSmartCleanup();
    }, cleanupInterval);

    // Memory monitoring interval
    memoryCheckInterval.current = setInterval(() => {
      handleMemoryPressure();
    }, 30 * 1000); // Check every 30 seconds

    // Page visibility change cleanup
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Aggressive cleanup when page is hidden
        const queryCache = queryClient.getQueryCache();
        queryCache.getAll().forEach(query => {
          const key = query.queryKey[0];
          const age = Date.now() - query.state.dataUpdatedAt;
          
          // Remove non-essential or old queries
          if (typeof key === 'string' && 
              (key.includes('notifications') || 
               key.includes('chat-messages') || 
               age > 10 * 60 * 1000)) {
            queryClient.removeQueries({ queryKey: query.queryKey });
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cleanupInterval, performSmartCleanup, handleMemoryPressure, queryClient]);

  // Object pool for frequently created objects
  const objectPool = useRef<Map<string, any[]>>(new Map());
  
  const getPooledObject = useCallback((type: string, factory: () => any) => {
    const pool = objectPool.current.get(type) || [];
    if (pool.length > 0) {
      return pool.pop();
    }
    return factory();
  }, []);

  const returnToPool = useCallback((type: string, obj: any) => {
    const pool = objectPool.current.get(type) || [];
    if (pool.length < 10) { // Limit pool size
      pool.push(obj);
      objectPool.current.set(type, pool);
    }
  }, []);

  // Setup and cleanup
  useEffect(() => {
    const cleanup = setupProactiveCleanup();
    
    return () => {
      cleanup();
      if (cleanupTimeout.current) {
        clearInterval(cleanupTimeout.current);
      }
      if (memoryCheckInterval.current) {
        clearInterval(memoryCheckInterval.current);
      }
    };
  }, [setupProactiveCleanup]);

  return {
    performSmartCleanup,
    handleMemoryPressure,
    getMemoryUsage,
    getPooledObject,
    returnToPool,
    getLastCleanupTime: () => lastCleanupTime.current
  };
}
