-- Backfill internal names to cascade properly from parent to children
-- This ensures all related content shares the same internal name for tracking

-- First, update content briefs to inherit from their source ideas
UPDATE public.content_briefs cb
SET internal_name = ci.internal_name,
    updated_at = now()
FROM public.content_ideas ci
WHERE cb.source_type = 'idea' 
  AND cb.source_id = ci.id
  AND (cb.internal_name IS NULL OR cb.internal_name != ci.internal_name);

-- Update content briefs from suggestions (inherit from parent idea)
UPDATE public.content_briefs cb
SET internal_name = ci.internal_name,
    updated_at = now()
FROM public.content_suggestions cs
JOIN public.content_ideas ci ON cs.content_idea_id = ci.id
WHERE cb.source_type = 'suggestion' 
  AND cb.source_id = cs.id
  AND (cb.internal_name IS NULL OR cb.internal_name != ci.internal_name);

-- Update content items to inherit from their briefs
UPDATE public.content_items cit
SET internal_name = cb.internal_name,
    updated_at = now()
FROM public.content_briefs cb
WHERE cit.content_brief_id = cb.id
  AND (cit.internal_name IS NULL OR cit.internal_name != cb.internal_name);

-- Update content derivatives to inherit from their items
UPDATE public.content_derivatives cd
SET internal_name = cit.internal_name,
    updated_at = now()
FROM public.content_items cit
WHERE cd.content_item_id = cit.id
  AND (cd.internal_name IS NULL OR cd.internal_name != cit.internal_name);

-- Clean up any remaining NULL internal names with sanitized titles
-- Content ideas without internal names
UPDATE public.content_ideas
SET internal_name = REGEXP_REPLACE(TRIM(COALESCE(title, 'Untitled')), '[^A-Za-z0-9\s]', '', 'g'),
    updated_at = now()
WHERE internal_name IS NULL OR internal_name = '';

-- Content briefs without internal names (fallback)
UPDATE public.content_briefs
SET internal_name = REGEXP_REPLACE(TRIM(COALESCE(title, 'Untitled')), '[^A-Za-z0-9\s]', '', 'g'),
    updated_at = now()
WHERE internal_name IS NULL OR internal_name = '';

-- Content items without internal names (fallback)
UPDATE public.content_items
SET internal_name = REGEXP_REPLACE(TRIM(COALESCE(title, 'Untitled')), '[^A-Za-z0-9\s]', '', 'g'),
    updated_at = now()
WHERE internal_name IS NULL OR internal_name = '';

-- Content derivatives without internal names (fallback)
UPDATE public.content_derivatives
SET internal_name = REGEXP_REPLACE(TRIM(COALESCE(title, 'Untitled')), '[^A-Za-z0-9\s]', '', 'g'),
    updated_at = now()
WHERE internal_name IS NULL OR internal_name = '';

-- General content items - clean up timestamp-based names to use clean titles
UPDATE public.general_content_items
SET internal_name = SUBSTRING(REGEXP_REPLACE(TRIM(COALESCE(title, 'Untitled')), '[^A-Za-z0-9\s]', '', 'g'), 1, 100),
    updated_at = now()
WHERE internal_name LIKE '%_[0-9][0-9][0-9][0-9][0-9]%' -- Contains timestamp patterns
   OR internal_name IS NULL 
   OR internal_name = '';