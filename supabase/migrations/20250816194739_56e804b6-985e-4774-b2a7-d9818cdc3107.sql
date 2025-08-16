-- Add composite indexes for improved query performance

-- Index for content_ideas with user filtering
CREATE INDEX IF NOT EXISTS idx_content_ideas_user_status_created 
ON content_ideas (user_id, status, created_at DESC);

-- Index for content_briefs with user filtering  
CREATE INDEX IF NOT EXISTS idx_content_briefs_user_status_created
ON content_briefs (user_id, status, created_at DESC);

-- Index for content_items with user filtering
CREATE INDEX IF NOT EXISTS idx_content_items_user_status_created
ON content_items (user_id, status, created_at DESC);

-- Index for content_derivatives with content item filtering
CREATE INDEX IF NOT EXISTS idx_content_derivatives_item_category_status
ON content_derivatives (content_item_id, category, status);

-- Index for general_content_items with user filtering and category
CREATE INDEX IF NOT EXISTS idx_general_content_user_category_status_created
ON general_content_items (user_id, category, status, created_at DESC);

-- Index for notifications with user filtering
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
ON notifications (user_id, is_read, created_at DESC);

-- Index for chat_messages with session filtering
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created
ON chat_messages (session_id, created_at DESC);

-- Index for pr_pitches with user filtering
CREATE INDEX IF NOT EXISTS idx_pr_pitches_user_status_created
ON pr_pitches (user_id, status, created_at DESC);

-- Index for journalists with user filtering
CREATE INDEX IF NOT EXISTS idx_journalists_user_created
ON journalists (user_id, created_at DESC);