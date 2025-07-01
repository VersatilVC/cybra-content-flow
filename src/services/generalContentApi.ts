
import { supabase } from '@/integrations/supabase/client';
import { CreateGeneralContentRequest, GeneralContentItem } from '@/types/generalContent';

export const fetchGeneralContent = async (filters: {
  category?: string;
  derivativeType?: string;
  status?: string;
  search?: string;
}): Promise<GeneralContentItem[]> => {
  let query = supabase
    .from('general_content_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }

  if (filters.derivativeType && filters.derivativeType !== 'all') {
    query = query.eq('derivative_type', filters.derivativeType);
  }

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching general content:', error);
    throw new Error('Failed to fetch general content');
  }

  return (data || []) as GeneralContentItem[];
};

export const createGeneralContent = async (data: CreateGeneralContentRequest): Promise<GeneralContentItem> => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user?.id) {
    throw new Error('User not authenticated');
  }

  // First, create the general content item in the database
  const { data: result, error } = await supabase
    .from('general_content_items')
    .insert([{
      ...data,
      user_id: user.user.id
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating general content:', error);
    throw new Error('Failed to create general content');
  }

  const createdContent = result as GeneralContentItem;
  console.log('General content created:', createdContent.id);

  // Trigger webhook for processing
  try {
    await triggerGeneralContentWebhook(createdContent, user.user.id);
    console.log('General content webhook triggered successfully');
  } catch (webhookError) {
    console.error('General content webhook failed:', webhookError);
    // Don't fail the whole operation if webhook fails
    // The content was still created successfully
  }

  return createdContent;
};

export const updateGeneralContent = async (id: string, data: Partial<CreateGeneralContentRequest>): Promise<GeneralContentItem> => {
  const { data: result, error } = await supabase
    .from('general_content_items')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating general content:', error);
    throw new Error('Failed to update general content');
  }

  return result as GeneralContentItem;
};

export const deleteGeneralContent = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('general_content_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting general content:', error);
    throw new Error('Failed to delete general content');
  }
};

async function triggerGeneralContentWebhook(content: GeneralContentItem, userId: string): Promise<void> {
  console.log('Triggering general content webhook for:', content.id);
  
  // Get the webhook configuration for general content processing
  const { data: webhooks, error: webhookError } = await supabase
    .from('webhook_configurations')
    .select('*')
    .eq('webhook_type', 'knowledge_base') // Using knowledge_base type as configured
    .eq('is_active', true)
    .eq('webhook_url', 'https://cyabramarketing.app.n8n.cloud/webhook/8a3f4dae-49b3-436f-8a57-e91c4a82548c');

  if (webhookError) {
    console.error('Error fetching webhook configuration:', webhookError);
    throw new Error(`Webhook configuration error: ${webhookError.message}`);
  }

  if (!webhooks || webhooks.length === 0) {
    console.log('No active general content webhook configured');
    throw new Error('No active general content webhook configured');
  }

  const webhook = webhooks[0];
  console.log('Using webhook:', webhook.name);

  // Prepare webhook payload
  const payload = {
    type: 'general_content_submission',
    general_content_id: content.id,
    user_id: userId,
    title: content.title,
    content: content.content,
    derivative_type: content.derivative_type,
    category: content.category,
    source_type: content.source_type,
    source_data: content.source_data,
    target_audience: content.target_audience,
    content_type: content.content_type,
    file_url: content.file_url,
    file_path: content.file_path,
    timestamp: new Date().toISOString(),
    callback_url: `https://uejgjytmqpcilwfrlpai.supabase.co/functions/v1/process-idea-callback`,
    callback_data: {
      type: 'general_content_processing_complete',
      general_content_id: content.id,
      user_id: userId,
      title: content.title
    }
  };

  console.log('Triggering webhook with payload:', payload);

  try {
    const response = await fetch(webhook.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Webhook failed with status ${response.status}: ${responseText}`);
    }

    console.log('General content webhook triggered successfully');
  } catch (error) {
    console.error('Error calling general content webhook:', error);
    throw new Error(`Failed to trigger general content webhook: ${error.message}`);
  }
}
