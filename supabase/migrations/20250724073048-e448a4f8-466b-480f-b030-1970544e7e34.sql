-- First, update existing data to use the new simplified status values
UPDATE public.content_briefs 
SET status = CASE 
  WHEN status = 'ready_for_review' THEN 'ready'
  WHEN status = 'processing_content_item' THEN 'processing' 
  WHEN status = 'content_item_created' THEN 'completed'
  WHEN status = 'discarded' THEN 'discarded'
  ELSE 'draft'
END;

-- Now add the constraint with the new simplified status values
ALTER TABLE public.content_briefs 
DROP CONSTRAINT IF EXISTS content_briefs_status_check;

ALTER TABLE public.content_briefs 
ADD CONSTRAINT content_briefs_status_check 
CHECK (status IN ('draft', 'ready', 'processing', 'completed', 'discarded'));

-- Update the default value for the status column
ALTER TABLE public.content_briefs 
ALTER COLUMN status SET DEFAULT 'draft';