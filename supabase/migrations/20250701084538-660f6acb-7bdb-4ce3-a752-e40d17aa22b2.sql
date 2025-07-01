
-- Check existing webhook types to see what values are allowed
SELECT DISTINCT webhook_type FROM webhook_configurations;

-- Insert webhook configuration using existing 'knowledge_base' type since it's the closest match
INSERT INTO webhook_configurations (
  name,
  webhook_type,
  webhook_url,
  description,
  created_by,
  is_active
) VALUES (
  'General Content Processing',
  'knowledge_base',
  'https://cyabramarketing.app.n8n.cloud/webhook/8a3f4dae-49b3-436f-8a57-e91c4a82548c',
  'N8N webhook for processing general content submissions',
  (SELECT id FROM profiles WHERE email LIKE '%@cyabra.com' LIMIT 1),
  true
);
