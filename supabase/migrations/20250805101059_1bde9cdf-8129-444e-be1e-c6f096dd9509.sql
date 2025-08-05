-- Add timeout tracking columns to content_ideas table
ALTER TABLE public.content_ideas 
ADD COLUMN processing_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN processing_timeout_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN retry_count INTEGER DEFAULT 0,
ADD COLUMN last_error_message TEXT;

-- Create index for efficient timeout queries
CREATE INDEX idx_content_ideas_timeout ON public.content_ideas(processing_timeout_at, status) 
WHERE status = 'processing';

-- Migrate existing 'processing' ideas to 'failed' status with retry capability
UPDATE public.content_ideas 
SET 
  status = 'failed',
  last_error_message = 'Processing timed out - please try again',
  retry_count = 0
WHERE status = 'processing';