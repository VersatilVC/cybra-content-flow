
-- First drop the existing constraint completely
ALTER TABLE content_items DROP CONSTRAINT IF EXISTS content_items_status_check;

-- Now update all existing status values to valid ones
UPDATE content_items 
SET status = 'ready_for_review', updated_at = now()
WHERE status = 'Ready for Review' OR status = 'draft' OR status = 'publishing';

UPDATE content_items 
SET status = 'published', updated_at = now()
WHERE status = 'Published';

UPDATE content_items 
SET status = 'discarded', updated_at = now()
WHERE status = 'Discarded';

-- Update content items that have derivatives to show derivatives_created status
UPDATE content_items 
SET status = 'derivatives_created', updated_at = now()
WHERE id IN (
  SELECT DISTINCT content_item_id 
  FROM content_derivatives 
  WHERE content_derivatives.content_item_id = content_items.id
) AND status = 'ready_for_review';

-- Update any other non-standard status values to ready_for_review as default
UPDATE content_items 
SET status = 'ready_for_review', updated_at = now()
WHERE status NOT IN ('ready_for_review', 'derivatives_created', 'published', 'discarded', 'needs_revision', 'needs_fix');

-- Add the constraint back with the correct valid statuses
ALTER TABLE content_items ADD CONSTRAINT content_items_status_check 
CHECK (status IN ('ready_for_review', 'derivatives_created', 'published', 'discarded', 'needs_revision', 'needs_fix'));
