-- Check and remove any remaining unique constraints on internal_name
-- Some constraints might have different names

-- Check all unique constraints on content tables
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(c.oid) as constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
JOIN pg_class cl ON cl.oid = c.conrelid
WHERE n.nspname = 'public' 
  AND cl.relname IN ('content_briefs', 'content_items', 'content_derivatives', 'general_content_items')
  AND c.contype = 'u'
  AND pg_get_constraintdef(c.oid) LIKE '%internal_name%';