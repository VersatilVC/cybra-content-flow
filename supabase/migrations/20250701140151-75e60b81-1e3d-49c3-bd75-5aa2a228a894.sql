
-- Add derivative_types column to general_content_items table
ALTER TABLE public.general_content_items 
ADD COLUMN derivative_types JSONB DEFAULT '[]'::jsonb;

-- Add a comment to explain the column
COMMENT ON COLUMN public.general_content_items.derivative_types IS 'Array of derivative types selected for this content item';
