-- Performance indexes for common queries
-- 1) Fetch latest content item by brief
CREATE INDEX IF NOT EXISTS idx_content_items_brief_created_desc
  ON public.content_items (content_brief_id, created_at DESC);

-- 2) Find brief by its source (idea/suggestion)
CREATE INDEX IF NOT EXISTS idx_content_briefs_source
  ON public.content_briefs (source_id, source_type);

-- 3) Derivative lookups by content item and aggregations by category/status
CREATE INDEX IF NOT EXISTS idx_content_derivatives_item
  ON public.content_derivatives (content_item_id);

CREATE INDEX IF NOT EXISTS idx_content_derivatives_item_category
  ON public.content_derivatives (content_item_id, category);

CREATE INDEX IF NOT EXISTS idx_content_derivatives_item_status
  ON public.content_derivatives (content_item_id, status);