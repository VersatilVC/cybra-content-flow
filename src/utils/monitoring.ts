// Production monitoring and alerting system
import { supabase } from '@/integrations/supabase/client';

interface MonitoringEvent {
  event_type: 'error' | 'warning' | 'info' | 'security';
  message: string;
  details?: Record<string, any>;
  user_id?: string;
  timestamp: string;
  source: string;
}

interface SystemHealth {
  database: boolean;
  auth: boolean;
  storage: boolean;
  edgeFunctions: boolean;
  wordpress: boolean;
  overall: boolean;
  lastChecked: string;
}

export class ProductionMonitoring {
  
  // Log events to monitoring system
  static async logEvent(event: Omit<MonitoringEvent, 'timestamp'>): Promise<void> {
    try {
      const monitoringEvent: MonitoringEvent = {
        ...event,
        timestamp: new Date().toISOString()
      };
      
      // Log to console for development
      console.log(`[${event.event_type.toUpperCase()}] ${event.source}: ${event.message}`, event.details);
      
      // In production, you would send this to your monitoring service
      // For now, we'll store in local storage for debugging
      const logs = this.getStoredLogs();
      logs.push(monitoringEvent);
      
      // Keep only last 100 logs to prevent storage overflow
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('production_logs', JSON.stringify(logs));
      
    } catch (error) {
      console.error('Failed to log monitoring event:', error);
    }
  }
  
  // Health check for all critical systems
  static async performHealthCheck(): Promise<SystemHealth> {
    const health: SystemHealth = {
      database: false,
      auth: false,
      storage: false,
      edgeFunctions: false,
      wordpress: false,
      overall: false,
      lastChecked: new Date().toISOString()
    };
    
    try {
      // Test database connection
      const { error: dbError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      health.database = !dbError;
      
      if (dbError) {
        await this.logEvent({
          event_type: 'error',
          source: 'HealthCheck',
          message: 'Database health check failed',
          details: { error: dbError.message }
        });
      }
      
    } catch (error) {
      health.database = false;
      await this.logEvent({
        event_type: 'error',
        source: 'HealthCheck',
        message: 'Database connection failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
    
    try {
      // Test auth system
      const { data: { session } } = await supabase.auth.getSession();
      health.auth = true; // Auth system is responding
      
    } catch (error) {
      health.auth = false;
      await this.logEvent({
        event_type: 'error',
        source: 'HealthCheck',
        message: 'Authentication system health check failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
    
    try {
      // Test storage system
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      health.storage = !storageError;
      
      if (storageError) {
        await this.logEvent({
          event_type: 'error',
          source: 'HealthCheck',
          message: 'Storage system health check failed',
          details: { error: storageError.message }
        });
      }
      
    } catch (error) {
      health.storage = false;
      await this.logEvent({
        event_type: 'error',
        source: 'HealthCheck',
        message: 'Storage system connection failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
    
    try {
      // Test WordPress edge function
      const { data, error } = await supabase.functions.invoke('wordpress-publish', {
        body: { test: true }
      });
      health.edgeFunctions = !error;
      health.wordpress = data?.success || false;
      
      if (error) {
        await this.logEvent({
          event_type: 'error',
          source: 'HealthCheck',
          message: 'Edge function health check failed',
          details: { error: error.message }
        });
      }
      
    } catch (error) {
      health.edgeFunctions = false;
      health.wordpress = false;
      await this.logEvent({
        event_type: 'error',
        source: 'HealthCheck',
        message: 'WordPress integration health check failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }
    
    // Overall health is true if all critical systems are working
    health.overall = health.database && health.auth && health.storage && health.edgeFunctions;
    
    // Log health check results
    await this.logEvent({
      event_type: health.overall ? 'info' : 'warning',
      source: 'HealthCheck',
      message: `System health check completed - Status: ${health.overall ? 'HEALTHY' : 'ISSUES DETECTED'}`,
      details: health
    });
    
    return health;
  }
  
  // Error boundary integration
  static logError(error: Error, errorInfo?: any): void {
    this.logEvent({
      event_type: 'error',
      source: 'ErrorBoundary',
      message: error.message,
      details: {
        stack: error.stack,
        errorInfo,
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    });
  }
  
  // Security event logging
  static logSecurityEvent(event: string, details?: Record<string, any>): void {
    this.logEvent({
      event_type: 'security',
      source: 'Security',
      message: event,
      details: {
        ...details,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    });
  }
  
  // Performance monitoring
  static logPerformanceMetric(metric: string, value: number, unit: string): void {
    this.logEvent({
      event_type: 'info',
      source: 'Performance',
      message: `${metric}: ${value}${unit}`,
      details: {
        metric,
        value,
        unit,
        url: window.location.pathname
      }
    });
  }
  
  // Get stored logs for debugging
  static getStoredLogs(): MonitoringEvent[] {
    try {
      const logs = localStorage.getItem('production_logs');
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }
  
  // Clear stored logs
  static clearLogs(): void {
    localStorage.removeItem('production_logs');
  }
  
  // Export logs for analysis
  static exportLogs(): string {
    const logs = this.getStoredLogs();
    return JSON.stringify(logs, null, 2);
  }
}

// Global error handler setup
export const setupGlobalErrorHandling = (): void => {
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    ProductionMonitoring.logError(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      { type: 'unhandledRejection', reason: event.reason }
    );
  });
  
  // Global errors
  window.addEventListener('error', (event) => {
    ProductionMonitoring.logError(
      event.error || new Error(event.message),
      {
        type: 'globalError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    );
  });
};

// Automated health checks
export const startHealthCheckMonitoring = (): void => {
  // Run health check every 5 minutes
  const interval = setInterval(async () => {
    const health = await ProductionMonitoring.performHealthCheck();
    
    if (!health.overall) {
      console.warn('🚨 System health issues detected:', health);
    }
  }, 5 * 60 * 1000); // 5 minutes
  
  // Clear interval on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(interval);
  });
};
