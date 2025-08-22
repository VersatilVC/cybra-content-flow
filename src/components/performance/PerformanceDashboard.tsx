import React, { memo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Database, 
  Gauge, 
  Clock, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/common/StandardComponents';

interface PerformanceMetrics {
  bundleSize: {
    total: string;
    chunks: Array<{ name: string; size: string; }>;
  };
  database: {
    queryPerformance: any;
    cacheHitRatio: number;
    slowQueries: number;
    connectionCount: number;
  };
  frontend: {
    renderTime: number;
    bundleLoadTime: number;
    memoryUsage: number;
    errorRate: number;
  };
  optimization: {
    score: number;
    recommendations: string[];
  };
}

interface DatabasePerformance {
  total_queries: number;
  avg_query_time_ms: number;
  max_query_time_ms: number;
  slow_queries_count: number;
  performance_score: string;
  timestamp: string;
}

interface CachePerformance {
  cache_hit_ratio: number;
  shared_blks_hit: number;
  shared_blks_read: number;
  recommendation: string;
  timestamp: string;
}

export const PerformanceDashboard = memo(function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchDatabaseMetrics = async () => {
    try {
      // Fetch query performance metrics
      const { data: queryData, error: queryError } = await supabase
        .rpc('monitor_query_performance');
      
      if (queryError) throw queryError;
      
      // Fetch cache optimization metrics
      const { data: cacheData, error: cacheError } = await supabase
        .rpc('optimize_query_cache');
      
      if (cacheError) throw cacheError;

      return {
        queryPerformance: queryData[0] as DatabasePerformance,
        cachePerformance: cacheData as CachePerformance
      };
    } catch (error) {
      console.error('Error fetching database metrics:', error);
      return null;
    }
  };

  const measureFrontendPerformance = (): PerformanceMetrics['frontend'] => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const memory = (performance as any).memory;
    
    return {
      renderTime: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
      bundleLoadTime: navigation ? navigation.responseEnd - navigation.requestStart : 0,
      memoryUsage: memory ? memory.usedJSHeapSize / 1024 / 1024 : 0, // MB
      errorRate: 0 // This would be tracked by error monitoring service
    };
  };

  const calculateOptimizationScore = (
    dbPerformance: DatabasePerformance | null,
    cachePerformance: CachePerformance | null,
    frontendMetrics: PerformanceMetrics['frontend']
  ): PerformanceMetrics['optimization'] => {
    let score = 100;
    const recommendations: string[] = [];

    // Database performance scoring
    if (dbPerformance) {
      if (dbPerformance.avg_query_time_ms > 500) {
        score -= 20;
        recommendations.push('Optimize slow database queries');
      }
      if (dbPerformance.slow_queries_count > 10) {
        score -= 15;
        recommendations.push('Review and optimize slow query patterns');
      }
    }

    // Cache performance scoring
    if (cachePerformance) {
      if (cachePerformance.cache_hit_ratio < 90) {
        score -= 25;
        recommendations.push('Improve database cache hit ratio');
      }
    }

    // Frontend performance scoring
    if (frontendMetrics.renderTime > 3000) {
      score -= 20;
      recommendations.push('Optimize frontend rendering performance');
    }
    if (frontendMetrics.memoryUsage > 100) {
      score -= 10;
      recommendations.push('Monitor and optimize memory usage');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is optimal');
    }

    return {
      score: Math.max(0, score),
      recommendations
    };
  };

  const getBundleMetrics = (): PerformanceMetrics['bundleSize'] => {
    // This would be populated from build-time analysis
    // For now, showing placeholder data
    return {
      total: '2.1 MB',
      chunks: [
        { name: 'react-vendor', size: '456 KB' },
        { name: 'ui-vendor', size: '234 KB' },
        { name: 'pdf-vendor', size: '1.2 MB' },
        { name: 'main', size: '210 KB' }
      ]
    };
  };

  const refreshMetrics = async () => {
    setLoading(true);
    try {
      const dbMetrics = await fetchDatabaseMetrics();
      const frontendMetrics = measureFrontendPerformance();
      const bundleMetrics = getBundleMetrics();
      
      const optimization = calculateOptimizationScore(
        dbMetrics?.queryPerformance || null,
        dbMetrics?.cachePerformance || null,
        frontendMetrics
      );

      setMetrics({
        bundleSize: bundleMetrics,
        database: {
          queryPerformance: dbMetrics?.queryPerformance || null,
          cacheHitRatio: dbMetrics?.cachePerformance?.cache_hit_ratio || 0,
          slowQueries: dbMetrics?.queryPerformance?.slow_queries_count || 0,
          connectionCount: 0 // Would be fetched from connection analysis
        },
        frontend: frontendMetrics,
        optimization
      });

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error refreshing metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMetrics();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading performance metrics..." />;
  }

  if (!metrics) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Unable to load performance metrics</h3>
        <p className="text-gray-600 mb-4">There was an error fetching performance data.</p>
        <Button onClick={refreshMetrics}>Try Again</Button>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return CheckCircle;
    if (score >= 70) return AlertTriangle;
    return AlertTriangle;
  };

  const ScoreIcon = getScoreIcon(metrics.optimization.score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="text-gray-600">Monitor and optimize application performance</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button onClick={refreshMetrics} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Overall Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-bold ${getScoreColor(metrics.optimization.score)}`}>
              {metrics.optimization.score}
            </div>
            <ScoreIcon className={`w-8 h-8 ${getScoreColor(metrics.optimization.score)}`} />
            <div className="flex-1">
              <div className="space-y-1">
                {metrics.optimization.recommendations.map((rec, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    • {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Database Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics.database.queryPerformance && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Query Time</span>
                  <span className="font-medium">
                    {metrics.database.queryPerformance.avg_query_time_ms.toFixed(1)}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Queries</span>
                  <span className="font-medium">
                    {metrics.database.queryPerformance.total_queries.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Slow Queries</span>
                  <Badge variant={metrics.database.slowQueries > 5 ? "destructive" : "default"}>
                    {metrics.database.slowQueries}
                  </Badge>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cache Hit Ratio</span>
              <span className={`font-medium ${metrics.database.cacheHitRatio > 95 ? 'text-green-600' : 'text-yellow-600'}`}>
                {metrics.database.cacheHitRatio.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Frontend Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Frontend Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Render Time</span>
              <span className="font-medium">{metrics.frontend.renderTime.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Bundle Load Time</span>
              <span className="font-medium">{metrics.frontend.bundleLoadTime.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Memory Usage</span>
              <span className="font-medium">{metrics.frontend.memoryUsage.toFixed(1)} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Error Rate</span>
              <Badge variant={metrics.frontend.errorRate > 1 ? "destructive" : "default"}>
                {metrics.frontend.errorRate.toFixed(2)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Bundle Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Bundle Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Size</span>
              <span className="font-medium">{metrics.bundleSize.total}</span>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">Chunk Breakdown:</span>
              {metrics.bundleSize.chunks.map((chunk, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{chunk.name}</span>
                  <span>{chunk.size}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Real-time Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {metrics.database.queryPerformance?.total_queries || 0}
              </div>
              <div className="text-sm text-gray-600">Total Queries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {metrics.database.cacheHitRatio.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Cache Hit Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {metrics.frontend.memoryUsage.toFixed(0)}MB
              </div>
              <div className="text-sm text-gray-600">Memory Usage</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${getScoreColor(metrics.optimization.score)}`}>
                {metrics.optimization.score}
              </div>
              <div className="text-sm text-gray-600">Performance Score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});