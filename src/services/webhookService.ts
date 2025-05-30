
import { supabase } from '@/integrations/supabase/client';

export const triggerWebhook = async (webhookType: string, payload: any) => {
  console.log(`Triggering webhook type: ${webhookType}`);
  
  const webhooks = await supabase
    .from('webhook_configurations')
    .select('*')
    .eq('webhook_type', webhookType)
    .eq('is_active', true);

  if (webhooks.data && webhooks.data.length > 0) {
    for (const webhook of webhooks.data) {
      try {
        console.log(`Calling webhook: ${webhook.webhook_url}`);
        await fetch(webhook.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        console.log(`Webhook ${webhook.name} triggered successfully`);
      } catch (webhookError) {
        console.error(`Webhook ${webhook.name} error:`, webhookError);
      }
    }
  } else {
    console.log(`No active webhooks found for type: ${webhookType}`);
  }
};

// Helper function to get the callback URL for idea processing
export const getIdeaCallbackUrl = () => {
  const supabaseUrl = 'https://uejgjytmqpcilwfrlpai.supabase.co';
  return `${supabaseUrl}/functions/v1/process-idea-callback`;
};
