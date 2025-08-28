-- Fix function that was flagged by the security linter
CREATE OR REPLACE FUNCTION public.generate_unique_internal_name(title_text text, content_type_text text DEFAULT NULL::text, target_audience_text text DEFAULT NULL::text, derivative_type_text text DEFAULT NULL::text, category_text text DEFAULT NULL::text, created_at_date timestamp with time zone DEFAULT now(), user_id_param uuid DEFAULT NULL::uuid, table_name_param text DEFAULT 'content_ideas'::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;