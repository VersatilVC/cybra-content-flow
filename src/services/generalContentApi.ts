
import { supabase } from '@/integrations/supabase/client';
import { getCallbackUrl } from '@/config/environment';
import { CreateGeneralContentRequest, GeneralContentItem } from '@/types/generalContent';

export const fetchGeneralContent = async (filters: {
  category?: string;
  derivativeType?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<GeneralContentItem[]> => {
  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.max(1, Math.min(50, filters.pageSize || 12));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('general_content_items')
    .select(
      'id,user_id,title,content,derivative_type,derivative_types,category,content_type,source_type,source_data,target_audience,status,word_count,metadata,file_path,file_url,file_size,mime_type,created_at,updated_at'
    )
    .order('created_at', { ascending: false })
    .range(from, to);

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
  console.log('Creating general content with data:', data);
  
  const { data: user } = await supabase.auth.getUser();
  if (!user.user?.id) {
    console.error('User not authenticated');
    throw new Error('User not authenticated');
  }

  console.log('Authenticated user ID:', user.user.id);

  // Prepare the data for insertion with proper derivative_types handling
  const insertData = {
    ...data,
    user_id: user.user.id,
    // Ensure derivative_type is set for backward compatibility (use first type)
    derivative_type: data.derivative_types && data.derivative_types.length > 0 
      ? data.derivative_types[0] 
      : data.derivative_type,
    // Store the full array in derivative_types
    derivative_types: data.derivative_types || [data.derivative_type],
  };

  console.log('Insert data prepared:', insertData);

  // Create the general content item in the database
  const { data: result, error } = await supabase
    .from('general_content_items')
    .insert([insertData])
.select('id,user_id,title,content,derivative_type,derivative_types,category,content_type,source_type,source_data,target_audience,status,word_count,metadata,file_path,file_url,file_size,mime_type,created_at,updated_at')
    .single();

  if (error) {
    console.error('Database insertion error:', error);
    throw new Error(`Failed to create general content: ${error.message}`);
  }

  const createdContent = result as GeneralContentItem;
  console.log('General content created successfully:', createdContent.id);

  // Trigger webhook for processing
  try {
    await triggerGeneralContentWebhook(createdContent, user.user.id, insertData.derivative_types);
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
    .select('id,user_id,title,content,derivative_type,derivative_types,category,content_type,source_type,source_data,target_audience,status,word_count,metadata,file_path,file_url,file_size,mime_type,created_at,updated_at')
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

async function triggerGeneralContentWebhook(content: GeneralContentItem, userId: string, derivativeTypes?: string[]): Promise<void> {
  console.log('Triggering webhook via edge function for:', content.id);

  const payload = {
    type: 'general_content_submission',
    general_content_id: content.id,
    user_id: userId,
    title: content.title,
    content: content.content,
    derivative_type: content.derivative_type,
    derivative_types: derivativeTypes || [content.derivative_type],
    category: content.category,
    source_type: content.source_type,
    source_data: content.source_data,
    target_audience: content.target_audience,
    content_type: content.content_type,
    file_url: content.file_url,
    file_path: content.file_path,
    timestamp: new Date().toISOString(),
    callback_url: getCallbackUrl('process-idea-callback'),
    callback_data: {
      type: 'general_content_processing_complete',
      general_content_id: content.id,
      user_id: userId,
      title: content.title
    }
  };

  const { error: fnError } = await supabase.functions.invoke('dispatch-webhook', {
    body: {
      webhook_type: 'knowledge_base',
      payload,
    },
  });

  if (fnError) {
    console.error('Edge function dispatch-webhook failed:', fnError);
    throw new Error(`Failed to trigger general content webhook: ${fnError.message}`);
  }

  console.log('General content webhook enqueued via edge function');
}
