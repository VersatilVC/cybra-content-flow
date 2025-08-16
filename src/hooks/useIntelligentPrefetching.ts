import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOptimizedQueryKeys } from '@/hooks/useOptimizedQueryKeys';

interface PrefetchConfig {
  enabled: boolean;
  staleTime: number;
  priority: 'low' | 'medium' | 'high';
}

export function useIntelligentPrefetching() {
  const queryClient = useQueryClient();
  const queryKeys = useOptimizedQueryKeys();
  const prefetchTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const userInteractionHistory = useRef<string[]>([]);

  // Track user interactions for pattern recognition
  const trackInteraction = useCallback((action: string) => {
    userInteractionHistory.current.push(action);
    // Keep only last 20 interactions
    if (userInteractionHistory.current.length > 20) {
      userInteractionHistory.current = userInteractionHistory.current.slice(-20);
    }
  }, []);

  // Intelligent prefetching based on user patterns
  const prefetchData = useCallback(async (
    queryKey: (string | Record<string, any>)[],
    queryFn: () => Promise<any>,
    config: PrefetchConfig = { enabled: true, staleTime: 5 * 60 * 1000, priority: 'medium' }
  ) => {
    if (!config.enabled) return;

    const keyString = queryKey.map(k => typeof k === 'string' ? k : JSON.stringify(k)).join('-');
    
    // Clear existing timeout
    const existingTimeout = prefetchTimeouts.current.get(keyString);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set delay based on priority
    const delay = config.priority === 'high' ? 100 : config.priority === 'medium' ? 500 : 1000;
    
    const timeout = setTimeout(async () => {
      try {
        await queryClient.prefetchQuery({
          queryKey,
          queryFn,
          staleTime: config.staleTime,
        });
      } catch (error) {
        console.warn('Prefetch failed for', keyString, error);
      }
      prefetchTimeouts.current.delete(keyString);
    }, delay);

    prefetchTimeouts.current.set(keyString, timeout);
  }, [queryClient]);

  // Prefetch related content based on current route
  const prefetchByRoute = useCallback((currentRoute: string) => {
    trackInteraction(`route:${currentRoute}`);

    switch (currentRoute) {
      case '/dashboard':
        // Prefetch content ideas and recent activity
        prefetchData(
          queryKeys.contentIdeas({ status: 'approved', limit: 10 }),
          () => fetch('/api/content-ideas?status=approved&limit=10').then(r => r.json()),
          { enabled: true, staleTime: 2 * 60 * 1000, priority: 'high' }
        );
        prefetchData(
          queryKeys.contentBriefs({ limit: 5 }),
          () => fetch('/api/content-briefs?limit=5').then(r => r.json()),
          { enabled: true, staleTime: 3 * 60 * 1000, priority: 'medium' }
        );
        break;

      case '/content-ideas':
        // Prefetch content briefs (likely next action)
        prefetchData(
          queryKeys.contentBriefs({ status: 'draft', limit: 10 }),
          () => fetch('/api/content-briefs?status=draft&limit=10').then(r => r.json()),
          { enabled: true, staleTime: 5 * 60 * 1000, priority: 'medium' }
        );
        break;

      case '/pr-pitches':
        // Prefetch journalist data and recent campaigns
        prefetchData(
          ['journalists', 'recent'],
          () => fetch('/api/journalists?recent=true').then(r => r.json()),
          { enabled: true, staleTime: 10 * 60 * 1000, priority: 'medium' }
        );
        break;

      case '/content-items':
        // Prefetch general content for quick navigation
        prefetchData(
          ['general-content', 'recent'],
          () => fetch('/api/general-content?limit=20').then(r => r.json()),
          { enabled: true, staleTime: 5 * 60 * 1000, priority: 'low' }
        );
        break;
    }
  }, [prefetchData, queryKeys, trackInteraction]);

  // Background refresh for critical data
  const setupBackgroundRefresh = useCallback(() => {
    const refreshInterval = setInterval(() => {
      // Refresh dashboard stats in background
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.dashboardStats(),
        refetchType: 'none' // Don't trigger loading states
      });
      
      // Refresh notifications
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications(),
        refetchType: 'none'
      });
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [queryClient, queryKeys]);

  // Cleanup on unmount
  useEffect(() => {
    const cleanup = setupBackgroundRefresh();
    
    return () => {
      cleanup();
      // Clear all prefetch timeouts
      prefetchTimeouts.current.forEach(timeout => clearTimeout(timeout));
      prefetchTimeouts.current.clear();
    };
  }, [setupBackgroundRefresh]);

  return {
    prefetchByRoute,
    prefetchData,
    trackInteraction,
    userInteractionHistory: userInteractionHistory.current
  };
}
