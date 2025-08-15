-- Knowledge Base Data Cleanup Migration
-- Phase 1: Clean up stuck processing items and unknown knowledge base entries

-- 1. Clean up stuck processing items (standardize status values)
UPDATE content_submissions 
SET processing_status = 'completed' 
WHERE processing_status = 'success';

-- 2. Remove content submissions with unknown knowledge base values
DELETE FROM content_submissions 
WHERE knowledge_base IN ('content_creation', 'derivative_generation', 'general_content');

-- 3. Clean up any stuck processing items that have been processing too long
UPDATE content_submissions 
SET processing_status = 'failed',
    error_message = 'Processing timed out - cleaned up during system maintenance',
    updated_at = now()
WHERE processing_status = 'processing' 
  AND created_at < now() - interval '1 hour';

-- 4. Add constraint to prevent future invalid knowledge base values
ALTER TABLE content_submissions 
ADD CONSTRAINT valid_knowledge_base_check 
CHECK (knowledge_base IN ('cyabra', 'industry', 'news', 'competitor'));

-- 5. Create index for better performance on knowledge base queries
CREATE INDEX IF NOT EXISTS idx_content_submissions_knowledge_base_status 
ON content_submissions (knowledge_base, processing_status);

-- 6. Create index for faster recent content queries
CREATE INDEX IF NOT EXISTS idx_content_submissions_created_at_desc 
ON content_submissions (created_at DESC);