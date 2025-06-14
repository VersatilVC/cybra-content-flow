
import { supabase } from '@/integrations/supabase/client';
import { secureUrlSchema, logSecurityEvent, globalRateLimiter } from '@/lib/security';
import { z } from 'zod';

const webhookPayloadSchema = z.object({
  type: z.string().min(1).max(100),
  timestamp: z.string().datetime(),
  user_id: z.string().uuid(),
}).passthrough(); // Allow additional properties

export async function secureWebhookTrigger(
  webhookType: string, 
  payload: any, 
  userId: string
): Promise<void> {
  // Rate limiting
  if (!globalRateLimiter.isAllowed(`webhook_${userId}`)) {
    logSecurityEvent('webhook_rate_limit_exceeded', { userId, webhookType }, userId);
    throw new Error('Too many webhook requests. Please try again later.');
  }

  // Validate webhook type
  const allowedWebhookTypes = [
    'knowledge_base',
    'derivative_generation',
    'content_processing',
    'idea_engine',
    'brief_creation',
    'idea_auto_generator',
    'content_item_fix'
  ];

  if (!allowedWebhookTypes.includes(webhookType)) {
    logSecurityEvent('invalid_webhook_type', { userId, webhookType }, userId);
    throw new Error('Invalid webhook type');
  }

  // Validate payload structure
  try {
    webhookPayloadSchema.parse(payload);
  } catch (error) {
    logSecurityEvent('invalid_webhook_payload', { 
      userId, 
      webhookType, 
      error: error instanceof Error ? error.message : 'Unknown validation error' 
    }, userId);
    throw new Error('Invalid webhook payload structure');
  }

  console.log(`Triggering secure webhook type: ${webhookType}`);
  
  const webhooks = await supabase
    .from('webhook_configurations')
    .select('*')
    .eq('webhook_type', webhookType)
    .eq('is_active', true);

  if (webhooks.data && webhooks.data.length > 0) {
    for (const webhook of webhooks.data) {
      try {
        // Validate webhook URL
        secureUrlSchema.parse(webhook.webhook_url);
        
        console.log(`Calling secure webhook: ${webhook.webhook_url}`);
        
        // Add security headers and timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch(webhook.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Cyabra-ContentEngine/1.0',
            'X-Webhook-Type': webhookType,
            'X-Request-ID': crypto.randomUUID(),
          },
          body: JSON.stringify({
            ...payload,
            webhook_id: webhook.id,
            timestamp: new Date().toISOString(),
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        logSecurityEvent('webhook_success', { 
          userId, 
          webhookType, 
          webhookId: webhook.id,
          responseStatus: response.status 
        }, userId);
        
        console.log(`Webhook ${webhook.name} triggered successfully`);
      } catch (webhookError) {
        logSecurityEvent('webhook_error', { 
          userId, 
          webhookType, 
          webhookId: webhook.id,
          error: webhookError instanceof Error ? webhookError.message : 'Unknown error' 
        }, userId);
        
        console.error(`Webhook ${webhook.name} error:`, webhookError);
        // Continue with other webhooks instead of failing completely
      }
    }
  } else {
    logSecurityEvent('no_webhook_configured', { userId, webhookType }, userId);
    throw new Error(`No active ${webhookType} webhook configured. Please set up a webhook in the Webhooks section.`);
  }
}
