
-- First drop the existing constraint completely
ALTER TABLE content_ideas DROP CONSTRAINT IF EXISTS content_ideas_status_check;

-- Now update all non-standard status values to valid ones
UPDATE content_ideas 
SET status = 'ready', updated_at = now()
WHERE status NOT IN ('processing', 'ready', 'brief_created', 'discarded');

-- Add the constraint back with the correct valid statuses
ALTER TABLE content_ideas ADD CONSTRAINT content_ideas_status_check 
CHECK (status IN ('processing', 'ready', 'brief_created', 'discarded'));
