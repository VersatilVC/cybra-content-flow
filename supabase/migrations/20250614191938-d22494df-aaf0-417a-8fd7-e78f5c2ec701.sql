
-- First drop the existing constraint completely
ALTER TABLE content_briefs DROP CONSTRAINT IF EXISTS content_briefs_status_check;

-- Now update all existing status values to valid ones
UPDATE content_briefs 
SET status = 'ready_for_review', updated_at = now()
WHERE status = 'ready' OR status = 'draft';

UPDATE content_briefs 
SET status = 'content_item_created', updated_at = now()
WHERE status = 'content_created';

-- Update any other non-standard status values to ready_for_review as default
UPDATE content_briefs 
SET status = 'ready_for_review', updated_at = now()
WHERE status NOT IN ('ready_for_review', 'processing_content_item', 'content_item_created', 'discarded');

-- Add the constraint back with the correct valid statuses
ALTER TABLE content_briefs ADD CONSTRAINT content_briefs_status_check 
CHECK (status IN ('ready_for_review', 'processing_content_item', 'content_item_created', 'discarded'));
