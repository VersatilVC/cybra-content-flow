-- Update the timed out content idea to failed status
UPDATE content_ideas 
SET 
  status = 'failed',
  last_error_message = 'Processing timed out after 30 minutes',
  processing_started_at = NULL,
  processing_timeout_at = NULL,
  updated_at = NOW()
WHERE id = '175cfa03-1320-4fb4-af08-6b5285505807' 
  AND status = 'processing' 
  AND processing_timeout_at < NOW();