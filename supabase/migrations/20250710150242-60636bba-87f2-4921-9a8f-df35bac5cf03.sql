-- Update any remaining 'ready' status to 'ready_for_review'
UPDATE content_briefs 
SET status = 'ready_for_review', updated_at = now()
WHERE status = 'ready';