-- Clean up existing pr_campaigns data and fix foreign key constraint
-- Step 1: First, let's remove the problematic records that reference non-existent content_items
DELETE FROM public.pr_campaigns 
WHERE content_item_id NOT IN (
  SELECT id FROM public.general_content_items
);

-- Step 2: Drop the existing foreign key constraint
ALTER TABLE public.pr_campaigns DROP CONSTRAINT IF EXISTS pr_campaigns_content_item_id_fkey;

-- Step 3: Add new foreign key constraint referencing general_content_items
ALTER TABLE public.pr_campaigns 
ADD CONSTRAINT pr_campaigns_content_item_id_fkey 
FOREIGN KEY (content_item_id) REFERENCES public.general_content_items(id) ON DELETE CASCADE;

-- Step 4: Add a comment to document the change
COMMENT ON CONSTRAINT pr_campaigns_content_item_id_fkey ON public.pr_campaigns 
IS 'References general_content_items for report uploads and general content campaigns';