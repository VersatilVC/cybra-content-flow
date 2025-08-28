-- First, let's check if there are any pr_pitches with content_item_id that don't exist in general_content_items
-- and remove those problematic records
DELETE FROM pr_pitches 
WHERE content_item_id NOT IN (SELECT id FROM general_content_items);

-- Drop the existing foreign key constraint from pr_pitches to content_items
ALTER TABLE pr_pitches 
DROP CONSTRAINT IF EXISTS pr_pitches_content_item_id_fkey;

-- Add new foreign key constraint from pr_pitches to general_content_items
ALTER TABLE pr_pitches 
ADD CONSTRAINT pr_pitches_content_item_id_fkey 
FOREIGN KEY (content_item_id) REFERENCES general_content_items(id) ON DELETE CASCADE;