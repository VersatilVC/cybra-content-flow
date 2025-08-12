import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PerformanceMetrics {
  route: string;
  loadTime: number;
  renderTime: number;
  timestamp: number;
}

export function usePerformanceMonitor() {
  const location = useLocation();

  useEffect(() => {
    const startTime = performance.now();
    const navigationStart = performance.timing?.navigationStart || Date.now();

    // Measure page load time
    const measurePageLoad = () => {
      const loadTime = performance.now() - startTime;
      const renderTime = performance.now();

      const metrics: PerformanceMetrics = {
        route: location.pathname,
        loadTime,
        renderTime,
        timestamp: Date.now(),
      };

      // Log performance metrics
      console.log('Performance Metrics:', metrics);

      // In production, you could send these to analytics
      if (process.env.NODE_ENV === 'production') {
        // Send to analytics service
        // analytics.track('page_performance', metrics);
      }
    };

    // Measure after component mount
    const timer = setTimeout(measurePageLoad, 100);

    return () => clearTimeout(timer);
  }, [location.pathname]);
}

export default function PerformanceMonitor() {
  usePerformanceMonitor();
  return null;
}