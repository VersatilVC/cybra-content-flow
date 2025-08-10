-- 1) Create helpful indexes for status + timeout and common filters
CREATE INDEX IF NOT EXISTS idx_content_ideas_status_timeout ON public.content_ideas (status, processing_timeout_at);
CREATE INDEX IF NOT EXISTS idx_content_ideas_user_status ON public.content_ideas (user_id, status);

CREATE INDEX IF NOT EXISTS idx_content_briefs_status_timeout ON public.content_briefs (status, processing_timeout_at);
CREATE INDEX IF NOT EXISTS idx_content_briefs_user_status ON public.content_briefs (user_id, status);

CREATE INDEX IF NOT EXISTS idx_content_items_status_timeout ON public.content_items (status, processing_timeout_at);
CREATE INDEX IF NOT EXISTS idx_content_items_user_status ON public.content_items (user_id, status);

CREATE INDEX IF NOT EXISTS idx_content_derivatives_status_timeout ON public.content_derivatives (status, processing_timeout_at);
CREATE INDEX IF NOT EXISTS idx_content_derivatives_user_status ON public.content_derivatives (user_id, status);

CREATE INDEX IF NOT EXISTS idx_content_suggestions_status_timeout ON public.content_suggestions (status, processing_timeout_at);
CREATE INDEX IF NOT EXISTS idx_content_suggestions_idea_status ON public.content_suggestions (content_idea_id, status);

CREATE INDEX IF NOT EXISTS idx_content_submissions_processing_timeout ON public.content_submissions (processing_status, webhook_triggered_at);

-- 2) Historical data backfill and timeout normalization
-- 2.1 Briefs: normalize completed -> ready
UPDATE public.content_briefs
SET status = 'ready', updated_at = now()
WHERE status = 'completed';

-- 2.2 Items: draft with content becomes ready_for_review
UPDATE public.content_items
SET status = 'ready_for_review', updated_at = now()
WHERE status = 'draft' AND content IS NOT NULL AND length(trim(content)) > 0;

-- 2.3 Ideas: submitted with summary becomes ready
UPDATE public.content_ideas
SET status = 'ready', updated_at = now()
WHERE status = 'submitted' AND idea_research_summary IS NOT NULL AND length(trim(idea_research_summary)) > 0;

-- 2.4 Ideas: fail timed-out processing
UPDATE public.content_ideas
SET status = 'failed',
    last_error_message = COALESCE(last_error_message, 'Processing timed out after 30 minutes - please try again'),
    processing_started_at = NULL,
    processing_timeout_at = NULL,
    updated_at = now()
WHERE status = 'processing'
  AND processing_timeout_at IS NOT NULL
  AND processing_timeout_at < now();

-- 2.5 Suggestions: ensure status populated
UPDATE public.content_suggestions
SET status = 'ready'
WHERE status IS NULL;

-- 2.6 Items: propagate failed submissions to items
UPDATE public.content_items ci
SET status = 'failed',
    last_error_message = COALESCE(ci.last_error_message, cs.error_message),
    processing_started_at = NULL,
    processing_timeout_at = NULL,
    updated_at = now()
FROM public.content_submissions cs
WHERE ci.submission_id = cs.id
  AND cs.processing_status = 'failed'
  AND ci.status IN ('processing', 'draft');

-- 2.7 Submissions: mark stuck > 30m as failed
WITH stuck AS (
  SELECT id FROM public.content_submissions
  WHERE processing_status = 'processing'
    AND (
      (webhook_triggered_at IS NOT NULL AND webhook_triggered_at < now() - interval '30 minutes')
      OR (webhook_triggered_at IS NULL AND created_at < now() - interval '30 minutes')
    )
)
UPDATE public.content_submissions s
SET processing_status = 'failed',
    error_message = COALESCE(error_message, 'Processing timed out after 30 minutes - please try again'),
    updated_at = now()
WHERE s.id IN (SELECT id FROM stuck);

-- 2.8 Briefs: fail timed-out processing
UPDATE public.content_briefs
SET status = 'failed',
    last_error_message = COALESCE(last_error_message, 'Processing timed out after 30 minutes - please try again'),
    processing_started_at = NULL,
    processing_timeout_at = NULL,
    updated_at = now()
WHERE status = 'processing'
  AND processing_timeout_at IS NOT NULL
  AND processing_timeout_at < now();

-- 2.9 Items: fail timed-out processing
UPDATE public.content_items
SET status = 'failed',
    last_error_message = COALESCE(last_error_message, 'Processing timed out after 30 minutes - please try again'),
    processing_started_at = NULL,
    processing_timeout_at = NULL,
    updated_at = now()
WHERE status = 'processing'
  AND processing_timeout_at IS NOT NULL
  AND processing_timeout_at < now();

-- 2.10 Derivatives: fail timed-out processing
UPDATE public.content_derivatives
SET status = 'failed',
    last_error_message = COALESCE(last_error_message, 'Processing timed out after 30 minutes - please try again'),
    processing_started_at = NULL,
    processing_timeout_at = NULL,
    updated_at = now()
WHERE status = 'processing'
  AND processing_timeout_at IS NOT NULL
  AND processing_timeout_at < now();