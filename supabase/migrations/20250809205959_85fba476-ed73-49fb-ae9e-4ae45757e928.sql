-- Composite indexes to optimize content_submissions queries
CREATE INDEX IF NOT EXISTS idx_content_submissions_user_status_created_desc
  ON public.content_submissions (user_id, processing_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_submissions_kb_type_created_desc
  ON public.content_submissions (knowledge_base, content_type, created_at DESC);