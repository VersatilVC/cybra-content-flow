-- Add internal_name column to all content tables for easy identification

-- Add internal_name to content_ideas
ALTER TABLE public.content_ideas 
ADD COLUMN internal_name TEXT;

-- Add internal_name to content_briefs  
ALTER TABLE public.content_briefs 
ADD COLUMN internal_name TEXT;

-- Add internal_name to content_items
ALTER TABLE public.content_items 
ADD COLUMN internal_name TEXT;

-- Add internal_name to content_derivatives
ALTER TABLE public.content_derivatives 
ADD COLUMN internal_name TEXT;

-- Add internal_name to general_content_items
ALTER TABLE public.general_content_items 
ADD COLUMN internal_name TEXT;

-- Create function to generate unique internal names for existing records
CREATE OR REPLACE FUNCTION generate_unique_internal_name(
  title_text TEXT,
  content_type_text TEXT DEFAULT NULL,
  target_audience_text TEXT DEFAULT NULL,
  derivative_type_text TEXT DEFAULT NULL,
  category_text TEXT DEFAULT NULL,
  created_at_date TIMESTAMPTZ DEFAULT now(),
  user_id_param UUID DEFAULT NULL,
  table_name_param TEXT DEFAULT 'content_ideas'
) RETURNS TEXT AS $$
DECLARE
  base_name TEXT;
  prefix TEXT := '';
  suffix TEXT;
  clean_title TEXT;
  final_name TEXT;
  counter INTEGER := 1;
  name_exists BOOLEAN;
BEGIN
  -- Clean title: remove special chars, take first 15 chars, uppercase
  clean_title := UPPER(REGEXP_REPLACE(COALESCE(title_text, 'CONTENT'), '[^A-Za-z0-9\s]', '', 'g'));
  clean_title := TRIM(REGEXP_REPLACE(clean_title, '\s+', '_', 'g'));
  clean_title := LEFT(clean_title, 15);
  
  -- Add prefix based on content type
  IF content_type_text = 'Blog Post' THEN
    prefix := 'BLOG_';
  ELSIF content_type_text = 'Guide' THEN
    prefix := 'GUIDE_';
  ELSIF content_type_text = 'Blog Post (Topical)' THEN
    prefix := 'TOPIC_';
  ELSIF derivative_type_text IS NOT NULL THEN
    prefix := UPPER(LEFT(derivative_type_text, 4)) || '_';
  ELSIF category_text IS NOT NULL THEN
    prefix := UPPER(LEFT(category_text, 4)) || '_';
  END IF;
  
  -- Add date suffix
  suffix := '_' || TO_CHAR(created_at_date, 'MMYY');
  
  -- Create base name
  base_name := prefix || clean_title || suffix;
  final_name := LEFT(base_name, 45);
  
  -- Check for uniqueness and add counter if needed
  LOOP
    -- Check if name exists for this user in the specified table
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE user_id = $1 AND internal_name = $2)', table_name_param) 
    INTO name_exists 
    USING user_id_param, final_name;
    
    IF NOT name_exists THEN
      EXIT;
    END IF;
    
    -- Increment counter and create new name
    counter := counter + 1;
    final_name := LEFT(base_name, 42) || '_' || LPAD(counter::TEXT, 2, '0');
  END LOOP;
  
  RETURN final_name;
END;
$$ LANGUAGE plpgsql;

-- Update existing content_ideas with generated unique internal names
UPDATE public.content_ideas 
SET internal_name = generate_unique_internal_name(title, content_type, target_audience, NULL, NULL, created_at, user_id, 'content_ideas')
WHERE internal_name IS NULL;

-- Update existing content_briefs with generated unique internal names  
UPDATE public.content_briefs 
SET internal_name = generate_unique_internal_name(title, brief_type, target_audience, NULL, NULL, created_at, user_id, 'content_briefs')
WHERE internal_name IS NULL;

-- Update existing content_items with generated unique internal names
UPDATE public.content_items 
SET internal_name = generate_unique_internal_name(title, content_type, NULL, NULL, NULL, created_at, user_id, 'content_items')
WHERE internal_name IS NULL;

-- Update existing content_derivatives with generated unique internal names
UPDATE public.content_derivatives 
SET internal_name = generate_unique_internal_name(title, content_type, NULL, derivative_type, category, created_at, user_id, 'content_derivatives')
WHERE internal_name IS NULL;

-- Update existing general_content_items with generated unique internal names
UPDATE public.general_content_items 
SET internal_name = generate_unique_internal_name(title, content_type, NULL, derivative_type, category, created_at, user_id, 'general_content_items')
WHERE internal_name IS NULL;

-- Now make internal_name NOT NULL and add unique constraints
ALTER TABLE public.content_ideas 
ALTER COLUMN internal_name SET NOT NULL,
ADD CONSTRAINT content_ideas_internal_name_user_unique UNIQUE(user_id, internal_name);

ALTER TABLE public.content_briefs 
ALTER COLUMN internal_name SET NOT NULL,
ADD CONSTRAINT content_briefs_internal_name_user_unique UNIQUE(user_id, internal_name);

ALTER TABLE public.content_items 
ALTER COLUMN internal_name SET NOT NULL,
ADD CONSTRAINT content_items_internal_name_user_unique UNIQUE(user_id, internal_name);

ALTER TABLE public.content_derivatives 
ALTER COLUMN internal_name SET NOT NULL,
ADD CONSTRAINT content_derivatives_internal_name_user_unique UNIQUE(user_id, internal_name);

ALTER TABLE public.general_content_items 
ALTER COLUMN internal_name SET NOT NULL,
ADD CONSTRAINT general_content_items_internal_name_user_unique UNIQUE(user_id, internal_name);