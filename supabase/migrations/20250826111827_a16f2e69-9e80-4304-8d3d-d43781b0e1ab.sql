-- Add source tracking to PR campaigns and pitches tables for flexibility
-- This allows campaigns and pitches to reference either content_items or general_content_items

-- First, add source tracking columns to pr_campaigns
ALTER TABLE public.pr_campaigns 
ADD COLUMN source_type TEXT DEFAULT 'content_item' CHECK (source_type IN ('content_item', 'general_content')),
ADD COLUMN source_id UUID;

-- Add index for performance
CREATE INDEX idx_pr_campaigns_source ON public.pr_campaigns(source_type, source_id);

-- Add similar columns to pr_pitches  
ALTER TABLE public.pr_pitches
ADD COLUMN source_type TEXT DEFAULT 'content_item' CHECK (source_type IN ('content_item', 'general_content')),
ADD COLUMN source_id UUID;

-- Add index for performance
CREATE INDEX idx_pr_pitches_source ON public.pr_pitches(source_type, source_id);

-- Update existing records to use the new source tracking
UPDATE public.pr_campaigns 
SET source_type = 'content_item', source_id = content_item_id 
WHERE content_item_id IS NOT NULL;

UPDATE public.pr_pitches 
SET source_type = 'content_item', source_id = content_item_id 
WHERE content_item_id IS NOT NULL;