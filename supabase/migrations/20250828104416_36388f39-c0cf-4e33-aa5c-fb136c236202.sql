-- Update PR pitch generation webhook URL
UPDATE webhook_configurations 
SET 
  webhook_url = 'https://cyabramarketing.app.n8n.cloud/webhook/8e5e465a-790e-469d-b23c-1045d7ff703d',
  updated_at = now()
WHERE webhook_type = 'pr_pitch_generation';