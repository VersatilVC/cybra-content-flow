-- Remove the specific unique constraints on internal_name
ALTER TABLE public.content_briefs DROP CONSTRAINT IF EXISTS content_briefs_internal_name_user_unique;
ALTER TABLE public.content_items DROP CONSTRAINT IF EXISTS content_items_internal_name_user_unique;
ALTER TABLE public.content_derivatives DROP CONSTRAINT IF EXISTS content_derivatives_internal_name_user_unique;
ALTER TABLE public.general_content_items DROP CONSTRAINT IF EXISTS general_content_items_internal_name_user_unique;