-- Safer Knowledge Base Data Cleanup Migration
-- Phase 1: Clean up and standardize without breaking foreign keys

-- 1. Standardize processing status values (success -> completed)
UPDATE content_submissions 
SET processing_status = 'completed' 
WHERE processing_status = 'success';

-- 2. Clean up stuck processing items that have been processing too long
UPDATE content_submissions 
SET processing_status = 'failed',
    error_message = 'Processing timed out - cleaned up during system maintenance',
    updated_at = now()
WHERE processing_status = 'processing' 
  AND created_at < now() - interval '1 hour';

-- 3. Mark submissions with invalid knowledge bases as failed instead of deleting
-- This preserves foreign key relationships while marking them as invalid
UPDATE content_submissions 
SET processing_status = 'failed',
    error_message = 'Invalid knowledge base - please resubmit with valid knowledge base',
    updated_at = now()
WHERE knowledge_base IN ('content_creation', 'derivative_generation', 'general_content');

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_submissions_knowledge_base_status 
ON content_submissions (knowledge_base, processing_status);

CREATE INDEX IF NOT EXISTS idx_content_submissions_created_at_desc 
ON content_submissions (created_at DESC);