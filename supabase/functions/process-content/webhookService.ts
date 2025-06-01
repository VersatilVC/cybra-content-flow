
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { WebhookPayload } from "./types.ts";

export async function getWebhookConfiguration(supabase: SupabaseClient, webhookType: string) {
  const { data: webhook, error: webhookError } = await supabase
    .from('webhook_configurations')
    .select('webhook_url')
    .eq('webhook_type', webhookType)
    .eq('is_active', true)
    .maybeSingle();

  if (webhookError) {
    console.error('Error fetching webhook configuration:', webhookError);
    throw new Error(`Webhook configuration error: ${webhookError.message}`);
  }

  if (!webhook?.webhook_url) {
    console.log(`No active ${webhookType} webhook configured`);
    throw new Error(`No active ${webhookType} webhook configured. Please set up a webhook in the Webhooks section.`);
  }

  return webhook;
}

export async function triggerWebhook(webhookUrl: string, payload: WebhookPayload): Promise<void> {
  console.log('Triggering webhook with payload:', JSON.stringify(payload, null, 2));

  try {
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Webhook response status:', webhookResponse.status);
    
    if (!webhookResponse.ok) {
      const responseText = await webhookResponse.text();
      console.error('Webhook response error:', responseText);
      throw new Error(`Webhook failed with status ${webhookResponse.status}: ${responseText}`);
    }

    console.log('Webhook triggered successfully');
  } catch (webhookError) {
    console.error('Error calling webhook:', webhookError);
    throw new Error(`Failed to trigger webhook: ${webhookError.message}`);
  }
}
