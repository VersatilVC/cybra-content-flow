
import { supabase } from '@/integrations/supabase/client';

export const triggerWebhook = async (webhookType: string, payload: any) => {
  const webhooks = await supabase
    .from('webhook_configurations')
    .select('*')
    .eq('webhook_type', webhookType)
    .eq('is_active', true);

  if (webhooks.data && webhooks.data.length > 0) {
    for (const webhook of webhooks.data) {
      try {
        await fetch(webhook.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } catch (webhookError) {
        console.error('Webhook error:', webhookError);
      }
    }
  }
};
