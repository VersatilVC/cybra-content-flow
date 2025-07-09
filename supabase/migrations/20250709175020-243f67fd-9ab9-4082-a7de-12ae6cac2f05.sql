-- Add RLS policies to allow service role access to content_submissions for callbacks
CREATE POLICY "Service role can read all submissions"
ON public.content_submissions
FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Service role can update all submissions"
ON public.content_submissions
FOR UPDATE
TO service_role
USING (true);

-- Also allow service role access to content_briefs for callback updates
CREATE POLICY "Service role can read all briefs"
ON public.content_briefs
FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Service role can update all briefs"
ON public.content_briefs
FOR UPDATE
TO service_role
USING (true);