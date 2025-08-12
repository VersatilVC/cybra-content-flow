
import { supabase } from '@/integrations/supabase/client';
import { getCallbackUrl } from '@/config/environment';
import { CreateGeneralContentRequest, GeneralContentItem } from '@/types/generalContent';

export interface GeneralContentPage {
  items: GeneralContentItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const fetchGeneralContent = async (filters: {
  category?: string;
  derivativeType?: string;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<GeneralContentPage> => {
  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.max(1, Math.min(50, filters.pageSize || 12));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());

  let query = supabase
    .from('general_content_items')
    .select(
      'id,user_id,title,content,derivative_type,derivative_types,category,content_type,source_type,source_data,target_audience,status,word_count,metadata,file_path,file_url,file_size,mime_type,created_at,updated_at',
      { count: 'exact' }
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

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching general content:', error);
    throw new Error('Failed to fetch general content');
  }

  const total = count || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
  console.debug('GeneralContent fetch', { page, pageSize, total, totalPages, durationMs: Math.round(duration as number) });

  return {
    items: (data || []) as GeneralContentItem[],
    total,
    page,
    pageSize,
    totalPages,
  };
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

  // Create a content submission record for tracking and N8N processing
  const submissionData = {
    user_id: user.user.id,
    knowledge_base: 'general_content',
    content_type: createdContent.content_type,
    file_path: createdContent.file_path,
    file_url: createdContent.file_url,
    original_filename: createdContent.source_data?.originalFilename || null,
    file_size: createdContent.file_size ? parseInt(createdContent.file_size) : null,
    mime_type: createdContent.mime_type,
    processing_status: 'queued'
  };

  const { data: submissionResult, error: submissionError } = await supabase
    .from('content_submissions')
    .insert([submissionData])
    .select('id')
    .single();

  if (submissionError) {
    console.error('Failed to create content submission:', submissionError);
    throw new Error(`Failed to create content submission: ${submissionError.message}`);
  }

  const submissionId = submissionResult.id;
  console.log('Content submission created:', submissionId);

  // Trigger the submission-based webhook processing
  try {
    await triggerGeneralContentWebhook(createdContent, user.user.id, insertData.derivative_types, submissionId);
    console.log('General content webhook triggered successfully');
  } catch (webhookError) {
    console.error('General content webhook failed:', webhookError);
    // Update submission status to failed
    await supabase
      .from('content_submissions')
      .update({ 
        processing_status: 'failed',
        error_message: `Webhook trigger failed: ${webhookError.message}`
      })
      .eq('id', submissionId);
    // Don't fail the whole operation since the content was created
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

async function triggerGeneralContentWebhook(content: GeneralContentItem, userId: string, derivativeTypes?: string[], submissionId?: string): Promise<void> {
  console.log('Triggering process-content webhook for submission:', submissionId);

  // Use the process-content edge function with submission-based flow
  const { error: fnError } = await supabase.functions.invoke('process-content', {
    body: {
      submissionId: submissionId,
      type: 'general_content_submission',
      general_content_id: content.id,
      user_id: userId,
      title: content.title,
      timestamp: new Date().toISOString()
    },
  });

  if (fnError) {
    console.error('Edge function process-content failed:', fnError);
    throw new Error(`Failed to trigger general content webhook: ${fnError.message}`);
  }

  console.log('General content webhook processing started via process-content function');
}
