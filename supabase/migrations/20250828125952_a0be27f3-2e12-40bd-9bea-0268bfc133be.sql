-- Fix foreign key constraint in pr_campaigns to reference general_content_items
-- This aligns with the current workflow where reports are stored in general_content_items

-- First, drop the existing foreign key constraint
ALTER TABLE public.pr_campaigns DROP CONSTRAINT IF EXISTS pr_campaigns_content_item_id_fkey;

-- Add new foreign key constraint referencing general_content_items
ALTER TABLE public.pr_campaigns 
ADD CONSTRAINT pr_campaigns_content_item_id_fkey 
FOREIGN KEY (content_item_id) REFERENCES public.general_content_items(id) ON DELETE CASCADE;

-- Add a comment to document the change
COMMENT ON CONSTRAINT pr_campaigns_content_item_id_fkey ON public.pr_campaigns 
IS 'References general_content_items for report uploads and general content campaigns';