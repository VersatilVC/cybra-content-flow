-- Enable pg_trgm extension for fast ILIKE search (installed under the standard Supabase extensions schema)
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- ============================
-- content_briefs performance
-- ============================
-- Ordering and common filters
CREATE INDEX IF NOT EXISTS idx_content_briefs_created_at ON public.content_briefs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_briefs_status ON public.content_briefs (status);
CREATE INDEX IF NOT EXISTS idx_content_briefs_brief_type ON public.content_briefs (brief_type);
CREATE INDEX IF NOT EXISTS idx_content_briefs_target_audience ON public.content_briefs (target_audience);
-- Fast lookup by source (used by getBriefBySourceId/useBriefBySource)
CREATE INDEX IF NOT EXISTS idx_content_briefs_source ON public.content_briefs (source_id, source_type);
-- Accelerate ILIKE search on title/description
CREATE INDEX IF NOT EXISTS idx_content_briefs_title_trgm ON public.content_briefs USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_content_briefs_description_trgm ON public.content_briefs USING gin (description gin_trgm_ops);

-- ============================
-- content_items performance
-- ============================
-- Ordering and fetching latest
CREATE INDEX IF NOT EXISTS idx_content_items_created_at ON public.content_items (created_at DESC);
-- Fetch items by brief and get latest quickly (used by useContentItemByBrief and listing by brief)
CREATE INDEX IF NOT EXISTS idx_content_items_brief_created_at ON public.content_items (content_brief_id, created_at DESC);

-- ============================
-- content_suggestions performance
-- ============================
-- Fetch suggestions for an idea ordered by relevance
CREATE INDEX IF NOT EXISTS idx_content_suggestions_idea_relevance ON public.content_suggestions (content_idea_id, relevance_score DESC);