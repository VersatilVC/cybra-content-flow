-- Performance optimization indexes migration
-- Generated on 2025-08-22 as part of comprehensive optimization plan

-- Index for processing content ideas with timeout monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_ideas_updated_processing 
ON content_ideas (updated_at DESC) 
WHERE status = 'processing';

-- Index for unread notifications by priority
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_priority 
ON notifications (user_id, type, created_at DESC) 
WHERE is_read = false;

-- Index for content derivatives file access patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_derivatives_user_category_created
ON content_derivatives (user_id, category, created_at DESC);

-- Index for content submissions processing status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_submissions_processing_status
ON content_submissions (processing_status, created_at DESC)
WHERE processing_status IN ('pending', 'processing');

-- Index for chat messages by user and session
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_user_session
ON chat_messages (session_id, created_at DESC);

-- Optimize vector search with metadata filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_metadata_gin 
ON documents USING gin (metadata)
WHERE metadata IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_competitor_metadata_gin 
ON documents_competitor USING gin (metadata)
WHERE metadata IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_industry_metadata_gin 
ON documents_industry USING gin (metadata)
WHERE metadata IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_news_metadata_gin 
ON documents_news USING gin (metadata)
WHERE metadata IS NOT NULL;

-- Index for journalist search and filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journalists_relevance_publication
ON journalists (relevance_score DESC, publication, user_id)
WHERE relevance_score IS NOT NULL;

-- Index for PR pitch tracking and reporting
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pr_pitches_campaign_status_sent
ON pr_pitches (pr_campaign_id, status, sent_at DESC);

-- Index for webhook configurations by type and activity
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_configurations_type_active_created
ON webhook_configurations (webhook_type, is_active, created_at DESC);

-- Index for feedback submissions by priority and status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feedback_submissions_priority_status
ON feedback_submissions (priority DESC, status, created_at DESC);

-- Composite index for content item derivatives count optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_items_derivatives_lookup
ON content_items (id, status, created_at DESC)
WHERE status IN ('completed', 'published');

-- Index for general content items by submission and processing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_general_content_submission_status_category
ON general_content_items (submission_id, status, category, created_at DESC);

-- Performance monitoring: Add index for timeout tracking across all content types
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_briefs_timeout_monitoring
ON content_briefs (processing_timeout_at, status, retry_count)
WHERE processing_timeout_at IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_suggestions_timeout_monitoring
ON content_suggestions (processing_timeout_at, status, retry_count)
WHERE processing_timeout_at IS NOT NULL;

-- Add index for user activity tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_last_active_role
ON profiles (last_active DESC, role)
WHERE last_active IS NOT NULL;

-- Optimize auto generation schedules lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auto_generation_schedules_active_next_run
ON auto_generation_schedules (is_active, next_run_at ASC)
WHERE is_active = true;

-- Add comment for documentation
COMMENT ON INDEX idx_content_ideas_updated_processing IS 'Optimizes queries for processing content ideas with timeout monitoring';
COMMENT ON INDEX idx_notifications_priority IS 'Optimizes unread notification queries by user and type';
COMMENT ON INDEX idx_documents_metadata_gin IS 'Enables fast metadata filtering for vector search';