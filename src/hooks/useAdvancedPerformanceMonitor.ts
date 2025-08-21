import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  cacheHitRate: number;
  userInteractions: number;
}

interface PerformanceThresholds {
  renderTime: number; // ms
  memoryUsage: number; // MB
  cacheHitRate: number; // percentage
}

export function useAdvancedPerformanceMonitor() {
  const metricsHistory = useRef<PerformanceMetrics[]>([]);
  const renderStartTime = useRef<number>(0);
  const interactionCount = useRef<number>(0);
  const cacheHits = useRef<number>(0);
  const cacheMisses = useRef<number>(0);

  const thresholds: PerformanceThresholds = {
    renderTime: 100, // 100ms
    memoryUsage: 150, // 150MB
    cacheHitRate: 80  // 80%
  };

  // Track render performance
  const startRenderTracking = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const endRenderTracking = useCallback((componentName: string) => {
    const renderTime = performance.now() - renderStartTime.current;
    
    if (renderTime > thresholds.renderTime) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      
      // Log to performance monitoring
      performance.mark(`slow-render-${componentName}`);
    }
    
    return renderTime;
  }, [thresholds.renderTime]);

  // Monitor memory usage
  const checkMemoryUsage = useCallback(() => {
    if ('memory' in performance && (performance as any).memory) {
      const memInfo = (performance as any).memory;
      const usedMB = memInfo.usedJSHeapSize / (1024 * 1024);
      
      if (usedMB > thresholds.memoryUsage) {
        console.warn(`High memory usage detected: ${usedMB.toFixed(2)}MB`);
        
        // Trigger garbage collection hint
        if ('gc' in window && typeof (window as any).gc === 'function') {
          (window as any).gc();
        }
        
        return { warning: true, usage: usedMB };
      }
      
      return { warning: false, usage: usedMB };
    }
    
    return { warning: false, usage: 0 };
  }, [thresholds.memoryUsage]);

  // Track cache performance
  const trackCacheHit = useCallback(() => {
    cacheHits.current += 1;
  }, []);

  const trackCacheMiss = useCallback(() => {
    cacheMisses.current += 1;
  }, []);

  const getCacheHitRate = useCallback(() => {
    const total = cacheHits.current + cacheMisses.current;
    return total > 0 ? (cacheHits.current / total) * 100 : 0;
  }, []);

  // Track user interactions
  const trackUserInteraction = useCallback((type: string) => {
    interactionCount.current += 1;
    
    // Log slow interactions
    const now = performance.now();
    setTimeout(() => {
      const responseTime = performance.now() - now;
      if (responseTime > 300) { // 300ms threshold
        console.warn(`Slow interaction response: ${type} took ${responseTime.toFixed(2)}ms`);
      }
    }, 0);
  }, []);

  // Generate performance report
  const generatePerformanceReport = useCallback(() => {
    const memoryCheck = checkMemoryUsage();
    const cacheHitRate = getCacheHitRate();
    
    const metrics: PerformanceMetrics = {
      renderTime: 0, // Average from recent renders
      memoryUsage: memoryCheck.usage,
      bundleSize: 0, // Would need to be calculated separately
      cacheHitRate,
      userInteractions: interactionCount.current
    };

    metricsHistory.current.push(metrics);
    
    // Keep only last 50 metrics
    if (metricsHistory.current.length > 50) {
      metricsHistory.current = metricsHistory.current.slice(-50);
    }

    // Check thresholds and report issues
    const issues = [];
    if (memoryCheck.warning) {
      issues.push(`High memory usage: ${memoryCheck.usage.toFixed(2)}MB`);
    }
    if (cacheHitRate < thresholds.cacheHitRate) {
      issues.push(`Low cache hit rate: ${cacheHitRate.toFixed(1)}%`);
    }

    return { metrics, issues, history: metricsHistory.current };
  }, [checkMemoryUsage, getCacheHitRate, thresholds.cacheHitRate]);

  // Performance optimization suggestions
  const getOptimizationSuggestions = useCallback(() => {
    const report = generatePerformanceReport();
    const suggestions = [];

    if (report.metrics.memoryUsage > thresholds.memoryUsage) {
      suggestions.push('Consider reducing the number of cached queries or implementing pagination');
    }
    
    if (report.metrics.cacheHitRate < thresholds.cacheHitRate) {
      suggestions.push('Review cache keys and stale time configurations to improve cache efficiency');
    }
    
    if (report.metrics.userInteractions > 100) {
      suggestions.push('High interaction count detected - consider implementing virtualization for lists');
    }

    return suggestions;
  }, [generatePerformanceReport, thresholds]);

  // Automated performance monitoring - DISABLED TO FIX ROUTING ISSUES
  useEffect(() => {
    // Only enable in development and reduce frequency significantly
    if (process.env.NODE_ENV === 'development') {
      const monitoringInterval = setInterval(() => {
        const report = generatePerformanceReport();
        
        // Only log critical issues to prevent console spam
        if (report.issues.some(issue => issue.includes('High memory'))) {
          console.group('Critical Performance Issues');
          report.issues.filter(issue => issue.includes('High memory')).forEach(issue => console.warn(issue));
          console.groupEnd();
        }
      }, 300 * 1000); // Check every 5 minutes instead of 30 seconds

      return () => clearInterval(monitoringInterval);
    }
  }, [generatePerformanceReport]);

  return {
    startRenderTracking,
    endRenderTracking,
    checkMemoryUsage,
    trackCacheHit,
    trackCacheMiss,
    trackUserInteraction,
    generatePerformanceReport,
    getOptimizationSuggestions,
    getCacheHitRate
  };
}
