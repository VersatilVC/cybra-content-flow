-- Phase 2 performance optimizations
-- 1) Enable pg_trgm for fast ILIKE searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2) GIN trigram indexes for search on content_items
CREATE INDEX IF NOT EXISTS idx_content_items_title_trgm
  ON public.content_items USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_content_items_summary_trgm
  ON public.content_items USING GIN (summary gin_trgm_ops);

-- 3) Composite indexes aligned with RLS filters and common access patterns
CREATE INDEX IF NOT EXISTS idx_content_items_user_created_at
  ON public.content_items (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_items_user_status
  ON public.content_items (user_id, status);

CREATE INDEX IF NOT EXISTS idx_content_derivatives_user_item
  ON public.content_derivatives (user_id, content_item_id);

-- 4) Active webhook lookup optimization
CREATE INDEX IF NOT EXISTS idx_webhook_configurations_type_active
  ON public.webhook_configurations (webhook_type, is_active);

-- 5) Lightweight aggregation RPC to reduce network payload for derivative counts
-- Note: Runs as invoker (default), so RLS policies still apply.
CREATE OR REPLACE FUNCTION public.get_derivative_counts(item_ids uuid[])
RETURNS TABLE (
  content_item_id uuid,
  category text,
  total integer,
  approved integer,
  published integer
)
LANGUAGE sql
AS $$
  SELECT
    cd.content_item_id,
    cd.category,
    COUNT(*)::int AS total,
    COUNT(*) FILTER (WHERE cd.status = 'approved')::int AS approved,
    COUNT(*) FILTER (WHERE cd.status = 'published')::int AS published
  FROM public.content_derivatives cd
  WHERE cd.content_item_id = ANY(item_ids)
  GROUP BY cd.content_item_id, cd.category
  ORDER BY cd.content_item_id, cd.category;
$$;