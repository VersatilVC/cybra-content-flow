import React, { createContext, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useIntelligentPrefetching } from '@/hooks/useIntelligentPrefetching';
import { useAdvancedPerformanceMonitor } from '@/hooks/useAdvancedPerformanceMonitor';
import { useLocation } from 'react-router-dom';

interface PerformanceContextType {
  prefetchByRoute: (route: string) => void;
  trackInteraction: (action: string) => void;
  trackCacheHit: () => void;
  trackCacheMiss: () => void;
  trackUserInteraction: (type: string) => void;
  generatePerformanceReport: () => any;
  startRenderTracking: () => void;
  endRenderTracking: (componentName: string) => number;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const {
    prefetchByRoute,
    trackInteraction,
  } = useIntelligentPrefetching();
  
  const {
    trackCacheHit,
    trackCacheMiss,
    trackUserInteraction,
    generatePerformanceReport,
    startRenderTracking,
    endRenderTracking,
  } = useAdvancedPerformanceMonitor();

  // Track route changes and trigger prefetching
  useEffect(() => {
    prefetchByRoute(location.pathname);
  }, [location.pathname, prefetchByRoute]);

  // Enhanced Query Client monitoring - THROTTLED TO REDUCE INTERFERENCE
  useEffect(() => {
    // Only enable detailed cache monitoring in development
    if (process.env.NODE_ENV === 'development') {
      const queryCache = queryClient.getQueryCache();
      
      let cacheEventCount = 0;
      const unsubscribe = queryCache.subscribe((event) => {
        cacheEventCount++;
        // Only track every 10th event to reduce overhead
        if (cacheEventCount % 10 === 0) {
          if (event.type === 'observerAdded') {
            trackCacheHit();
          } else if (event.type === 'added') {
            trackCacheMiss();
          }
        }
      });

      return unsubscribe;
    }
  }, [queryClient, trackCacheHit, trackCacheMiss]);

  // Global performance monitoring - DISABLED TO PREVENT CONSOLE SPAM
  useEffect(() => {
    // Only monitor long tasks in development and with higher threshold
    if (process.env.NODE_ENV === 'development' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 200) { // Only warn for tasks longer than 200ms
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
          }
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });
      
      return () => observer.disconnect();
    }
  }, []);

  const contextValue: PerformanceContextType = {
    prefetchByRoute,
    trackInteraction,
    trackCacheHit,
    trackCacheMiss,
    trackUserInteraction,
    generatePerformanceReport,
    startRenderTracking,
    endRenderTracking,
  };

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}