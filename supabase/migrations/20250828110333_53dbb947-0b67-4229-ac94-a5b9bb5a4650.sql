-- Create separate webhook for report-based PR pitches
INSERT INTO webhook_configurations (
  name,
  webhook_type,
  webhook_url,
  description,
  created_by,
  is_active
) VALUES (
  'PR Pitch Generation - Reports',
  'pr_pitch_generation_reports', 
  'https://cyabramarketing.app.n8n.cloud/webhook/8e5e465a-790e-469d-b23c-1045d7ff703d',
  'Webhook for generating PR pitches from reports',
  '477b1676-802b-47b1-a4e5-b1a60269e515',
  true
);

-- Revert the original PR pitch webhook back to content-based workflow
-- Since we don't have the original URL, we'll set it to a placeholder that needs to be updated
UPDATE webhook_configurations 
SET 
  webhook_url = 'https://hook.eu1.make.com/placeholder-content-pr-pitch-webhook',
  name = 'PR Pitch Generation - Content',
  description = 'Webhook for generating PR pitches from content items',
  updated_at = now()
WHERE webhook_type = 'pr_pitch_generation';