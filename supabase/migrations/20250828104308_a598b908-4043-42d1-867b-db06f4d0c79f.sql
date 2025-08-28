-- Update or insert PR pitch generation webhook configuration
INSERT INTO webhook_configurations (
  name,
  webhook_url,
  webhook_type,
  is_active,
  created_by
) VALUES (
  'PR Pitch Generation',
  'https://cyabramarketing.app.n8n.cloud/webhook/8e5e465a-790e-469d-b23c-1045d7ff703d',
  'pr_pitch_generation',
  true,
  '477b1676-802b-47b1-a4e5-b1a60269e515'
) ON CONFLICT (webhook_type)
DO UPDATE SET
  webhook_url = EXCLUDED.webhook_url,
  is_active = EXCLUDED.is_active,
  updated_at = now();