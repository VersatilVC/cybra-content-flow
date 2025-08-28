-- Remove unique constraints on internal_name to allow cascading
-- Content ideas can keep uniqueness since they're the source
-- But briefs, items, and derivatives should inherit the same internal_name

-- Drop unique constraints on content_briefs
ALTER TABLE public.content_briefs DROP CONSTRAINT IF EXISTS content_briefs_user_id_internal_name_key;
ALTER TABLE public.content_briefs DROP CONSTRAINT IF EXISTS content_briefs_internal_name_key;

-- Drop unique constraints on content_items  
ALTER TABLE public.content_items DROP CONSTRAINT IF EXISTS content_items_user_id_internal_name_key;
ALTER TABLE public.content_items DROP CONSTRAINT IF EXISTS content_items_internal_name_key;

-- Drop unique constraints on content_derivatives
ALTER TABLE public.content_derivatives DROP CONSTRAINT IF EXISTS content_derivatives_user_id_internal_name_key;
ALTER TABLE public.content_derivatives DROP CONSTRAINT IF EXISTS content_derivatives_internal_name_key;

-- Drop unique constraints on general_content_items
ALTER TABLE public.general_content_items DROP CONSTRAINT IF EXISTS general_content_items_user_id_internal_name_key;
ALTER TABLE public.general_content_items DROP CONSTRAINT IF EXISTS general_content_items_internal_name_key;