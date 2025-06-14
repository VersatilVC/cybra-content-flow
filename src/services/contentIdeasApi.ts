
import { supabase } from '@/integrations/supabase/client';
import { ContentIdea, ContentIdeaFilters, CreateContentIdeaData } from '@/types/contentIdeas';

export const fetchContentIdeas = async (userId: string, filters?: ContentIdeaFilters): Promise<ContentIdea[]> => {
  // With company-wide access, we fetch all content ideas (RLS will filter appropriately)
  let query = supabase
    .from('content_ideas')
    .select('*')
    .order('created_at', { ascending: false });

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
    content_type: item.content_type as 'Blog Post' | 'Guide',
    target_audience: item.target_audience as 'Private Sector' | 'Government Sector',
    status: item.status as 'processing' | 'ready' | 'brief_created' | 'discarded',
    source_type: item.source_type as 'manual' | 'file' | 'url' | 'auto_generated',
    source_data: item.source_data,
    created_at: item.created_at,
    updated_at: item.updated_at,
    idea_research_summary: item.idea_research_summary,
  }));
};

export const createContentIdea = async (userId: string, ideaData: CreateContentIdeaData) => {
  console.log('API: Creating content idea with data:', ideaData);
  const { data, error } = await supabase
    .from('content_ideas')
    .insert({
      ...ideaData,
      user_id: userId,
    })
    .select()
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
    .select()
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
