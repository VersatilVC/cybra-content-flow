-- Database query optimization functions and views
-- Generated on 2025-08-22 as part of comprehensive optimization plan

-- Create view for monitoring slow queries
CREATE OR REPLACE VIEW slow_queries_analysis AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
WHERE mean_time > 100  -- Queries taking more than 100ms on average
ORDER BY mean_time DESC;

-- Create function to analyze table statistics
CREATE OR REPLACE FUNCTION analyze_table_performance()
RETURNS TABLE (
  table_name text,
  total_size text,
  table_size text,
  index_size text,
  seq_scans bigint,
  seq_tup_read bigint,
  idx_scans bigint,
  idx_tup_fetch bigint,
  n_tup_ins bigint,
  n_tup_upd bigint,
  n_tup_del bigint,
  vacuum_count bigint,
  analyze_count bigint,
  last_vacuum timestamp with time zone,
  last_analyze timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||tablename as table_name,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size,
    st.seq_scan,
    st.seq_tup_read,
    st.idx_scan,
    st.idx_tup_fetch,
    st.n_tup_ins,
    st.n_tup_upd,
    st.n_tup_del,
    st.vacuum_count,
    st.autoanalyze_count,
    st.last_vacuum,
    st.last_autoanalyze
  FROM pg_stat_user_tables st
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to identify missing indexes
CREATE OR REPLACE FUNCTION suggest_missing_indexes()
RETURNS TABLE (
  table_name text,
  column_names text,
  scan_count bigint,
  rows_read bigint,
  recommendation text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||tablename as table_name,
    'Multiple columns' as column_names,
    seq_scan as scan_count,
    seq_tup_read as rows_read,
    CASE 
      WHEN seq_scan > 1000 AND seq_tup_read > 10000 THEN 'High priority: Consider adding indexes'
      WHEN seq_scan > 100 AND seq_tup_read > 1000 THEN 'Medium priority: Monitor query patterns'
      ELSE 'Low priority: Table scans are acceptable'
    END as recommendation
  FROM pg_stat_user_tables
  WHERE seq_scan > 0
  ORDER BY seq_scan * seq_tup_read DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function for automated maintenance scheduling
CREATE OR REPLACE FUNCTION schedule_maintenance_tasks()
RETURNS void AS $$
DECLARE
  table_record record;
BEGIN
  -- Analyze tables that haven't been analyzed recently
  FOR table_record IN 
    SELECT schemaname, tablename 
    FROM pg_stat_user_tables 
    WHERE last_autoanalyze IS NULL 
       OR last_autoanalyze < NOW() - INTERVAL '1 day'
  LOOP
    EXECUTE format('ANALYZE %I.%I', table_record.schemaname, table_record.tablename);
    RAISE NOTICE 'Analyzed table %.%', table_record.schemaname, table_record.tablename;
  END LOOP;
  
  -- Update statistics
  PERFORM pg_stat_reset();
  
  RAISE NOTICE 'Maintenance tasks completed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Create view for monitoring connection usage
CREATE OR REPLACE VIEW connection_analysis AS
SELECT 
  state,
  COUNT(*) as connection_count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
FROM pg_stat_activity 
WHERE pid <> pg_backend_pid()
GROUP BY state
ORDER BY connection_count DESC;

-- Create function to optimize query cache
CREATE OR REPLACE FUNCTION optimize_query_cache()
RETURNS json AS $$
DECLARE
  result json;
  cache_stats record;
BEGIN
  -- Get cache hit ratio
  SELECT 
    round(100.0 * shared_blks_hit / (shared_blks_hit + shared_blks_read), 2) as cache_hit_ratio,
    shared_blks_hit,
    shared_blks_read
  INTO cache_stats
  FROM pg_stat_database 
  WHERE datname = current_database();
  
  -- Build optimization recommendations
  SELECT json_build_object(
    'cache_hit_ratio', cache_stats.cache_hit_ratio,
    'shared_blks_hit', cache_stats.shared_blks_hit,
    'shared_blks_read', cache_stats.shared_blks_read,
    'recommendation', 
      CASE 
        WHEN cache_stats.cache_hit_ratio > 95 THEN 'Excellent cache performance'
        WHEN cache_stats.cache_hit_ratio > 90 THEN 'Good cache performance'
        WHEN cache_stats.cache_hit_ratio > 80 THEN 'Consider increasing shared_buffers'
        ELSE 'Poor cache performance - review queries and increase memory'
      END,
    'timestamp', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create monitoring function for query performance
CREATE OR REPLACE FUNCTION monitor_query_performance()
RETURNS json AS $$
DECLARE
  result json;
  query_stats record;
BEGIN
  -- Get overall query statistics
  SELECT 
    COUNT(*) as total_queries,
    AVG(mean_time) as avg_query_time,
    MAX(mean_time) as max_query_time,
    SUM(calls) as total_calls,
    COUNT(CASE WHEN mean_time > 1000 THEN 1 END) as slow_queries
  INTO query_stats
  FROM pg_stat_statements;
  
  SELECT json_build_object(
    'total_queries', query_stats.total_queries,
    'avg_query_time_ms', round(query_stats.avg_query_time::numeric, 2),
    'max_query_time_ms', round(query_stats.max_query_time::numeric, 2),
    'total_calls', query_stats.total_calls,
    'slow_queries_count', query_stats.slow_queries,
    'performance_score', 
      CASE 
        WHEN query_stats.avg_query_time < 100 THEN 'Excellent'
        WHEN query_stats.avg_query_time < 500 THEN 'Good'
        WHEN query_stats.avg_query_time < 1000 THEN 'Fair'
        ELSE 'Poor'
      END,
    'timestamp', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create index usage analysis function
CREATE OR REPLACE FUNCTION analyze_index_usage()
RETURNS TABLE (
  schema_name text,
  table_name text,
  index_name text,
  index_scans bigint,
  rows_read bigint,
  index_size text,
  usage_ratio numeric,
  recommendation text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname::text,
    tablename::text,
    indexname::text,
    idx_scan,
    idx_tup_read,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
    CASE 
      WHEN idx_scan > 0 THEN round(idx_tup_read::numeric / idx_scan, 2)
      ELSE 0
    END as usage_ratio,
    CASE 
      WHEN idx_scan = 0 THEN 'Unused index - consider dropping'
      WHEN idx_scan < 100 THEN 'Low usage - monitor'
      WHEN idx_scan < 1000 THEN 'Moderate usage - keep'
      ELSE 'High usage - critical index'
    END::text as recommendation
  FROM pg_stat_user_indexes
  ORDER BY idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON VIEW slow_queries_analysis IS 'Monitor queries with mean execution time > 100ms';
COMMENT ON FUNCTION analyze_table_performance() IS 'Comprehensive table performance analysis including size and access patterns';
COMMENT ON FUNCTION suggest_missing_indexes() IS 'Suggests tables that might benefit from additional indexes based on sequential scan patterns';
COMMENT ON FUNCTION schedule_maintenance_tasks() IS 'Automated maintenance routine for table analysis and statistics updates';
COMMENT ON FUNCTION optimize_query_cache() IS 'Analyzes and provides recommendations for query cache optimization';
COMMENT ON FUNCTION monitor_query_performance() IS 'Overall query performance monitoring and scoring';
COMMENT ON FUNCTION analyze_index_usage() IS 'Detailed analysis of index usage patterns and efficiency';