import { supabase } from '@/integrations/supabase/client';
import { ContentIdea, ContentIdeaFilters, CreateContentIdeaData } from '@/types/contentIdeas';
import { generateInternalName } from '@/utils/internalNameGenerator';

export const fetchContentIdeas = async (
  userId: string,
  filters?: ContentIdeaFilters,
  options?: { page?: number; pageSize?: number }
): Promise<ContentIdea[]> => {
  // With company-wide access, we fetch all content ideas (RLS will filter appropriately)
  let query = supabase
    .from('content_ideas')
    .select('id,title,description,content_type,target_audience,status,source_type,source_data,internal_name,created_at,updated_at,idea_research_summary,processing_started_at,processing_timeout_at,retry_count,last_error_message')
    .order('created_at', { ascending: false });

  if (options?.page && options?.pageSize) {
    const page = Math.max(1, options.page);
    const pageSize = Math.max(1, Math.min(50, options.pageSize));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
  }

  if (filters?.contentType && filters.contentType !== 'All Content Types') {
    query = query.eq('content_type', filters.contentType);
  }
  
  if (filters?.targetAudience && filters.targetAudience !== 'All Audiences') {
    query = query.eq('target_audience', filters.targetAudience);
  }
  
  if (filters?.status && filters.status !== 'All Statuses') {
    query = query.eq('status', filters.status);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  
  // Type cast to ensure proper types
  return (data || []).map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    content_type: item.content_type as 'Blog Post' | 'Guide' | 'Blog Post (Topical)',
    target_audience: item.target_audience as 'Private Sector' | 'Government Sector',
    status: item.status as 'processing' | 'ready' | 'brief_created' | 'discarded' | 'failed',
    source_type: item.source_type as 'manual' | 'file' | 'url' | 'auto_generated',
    source_data: item.source_data,
    internal_name: item.internal_name,
    created_at: item.created_at,
    updated_at: item.updated_at,
    idea_research_summary: item.idea_research_summary,
    processing_started_at: item.processing_started_at,
    processing_timeout_at: item.processing_timeout_at,
    retry_count: item.retry_count,
    last_error_message: item.last_error_message
  })) as ContentIdea[];
};

export const createContentIdea = async (userId: string, ideaData: CreateContentIdeaData) => {
  const { createIdeaInternalName } = await import('@/utils/titleBasedNaming');
  
  // Use title as internal name (user can override if provided)
  const internalName = ideaData.internal_name || createIdeaInternalName(ideaData.title);
  
  // Prepare the data to insert
  const insertData = {
    ...ideaData,
    user_id: userId,
    internal_name: internalName
  };

  const { data, error } = await supabase
    .from('content_ideas')
    .insert(insertData)
    .select('id,title,description,content_type,target_audience,status,source_type,source_data,internal_name,created_at,updated_at,idea_research_summary,processing_started_at,processing_timeout_at,retry_count,last_error_message')
    .single();

  if (error) {
    console.error('API: Error creating content idea:', error);
    throw error;
  }
  console.log('API: Content idea created successfully:', data);
  return data;
};

export const updateContentIdea = async (id: string, updates: Partial<ContentIdea>) => {
  console.log('API: Updating content idea:', id, updates);
  const { data, error } = await supabase
    .from('content_ideas')
    .update(updates)
    .eq('id', id)
    .select('id,title,description,content_type,target_audience,status,source_type,source_data,internal_name,created_at,updated_at,idea_research_summary,processing_started_at,processing_timeout_at,retry_count,last_error_message')
    .single();

  if (error) {
    console.error('API: Error updating content idea:', error);
    throw error;
  }
  console.log('API: Content idea updated successfully:', data);
  return data;
};

export const deleteContentIdea = async (id: string) => {
  const { error } = await supabase
    .from('content_ideas')
    .delete()
    .eq('id', id);

  if (error) throw error;
};