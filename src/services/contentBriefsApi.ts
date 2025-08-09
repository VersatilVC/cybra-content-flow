
import { supabase } from '@/integrations/supabase/client';
import { ContentBrief, ContentBriefFilters, CreateContentBriefData } from '@/types/contentBriefs';

export async function fetchContentBriefs(userId: string, filters?: ContentBriefFilters, options?: { page?: number; pageSize?: number }): Promise<ContentBrief[]> {
  console.log('fetchContentBriefs called with:', { userId, filters });
  
  // Check if we have a valid session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  console.log('Current session:', { 
    hasSession: !!session, 
    userId: session?.user?.id,
    sessionError: sessionError?.message 
  });
  
  if (!session) {
    throw new Error('No active session found. Please log in again.');
  }

  // With company-wide access, we don't need to filter by user_id anymore
  // The RLS policies will handle access control based on company domain
  let query = supabase
    .from('content_briefs')
    .select('id,user_id,source_id,source_type,title,description,brief_type,target_audience,status,content,file_summary,created_at,updated_at')
    .order('created_at', { ascending: false });

  if (options?.page && options?.pageSize) {
    const page = Math.max(1, options.page);
    const pageSize = Math.max(1, Math.min(50, options.pageSize));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
  }

  if (filters?.briefType && filters.briefType !== 'All Brief Types') {
    query = query.eq('brief_type', filters.briefType);
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

  console.log('Executing query...');
  const { data, error } = await query;

  if (error) {
    console.error('Query error:', error);
    throw new Error(`Failed to fetch content briefs: ${error.message}`);
  }

  console.log('Query successful, returned', data?.length || 0, 'briefs');
  return (data || []) as ContentBrief[];
}

export async function createContentBrief(briefData: CreateContentBriefData): Promise<ContentBrief> {
  const { data, error } = await supabase
    .from('content_briefs')
    .insert([briefData])
.select('id,user_id,source_id,source_type,title,description,brief_type,target_audience,status,content,file_summary,created_at,updated_at')
    .single();

  if (error) {
    throw new Error(`Failed to create content brief: ${error.message}`);
  }

  return data as ContentBrief;
}

export async function updateContentBrief(id: string, updates: Partial<ContentBrief>): Promise<ContentBrief> {
  const { data, error } = await supabase
    .from('content_briefs')
    .update(updates)
    .eq('id', id)
.select('id,user_id,source_id,source_type,title,description,brief_type,target_audience,status,content,file_summary,created_at,updated_at')
    .single();

  if (error) {
    throw new Error(`Failed to update content brief: ${error.message}`);
  }

  return data as ContentBrief;
}

export async function deleteContentBrief(id: string): Promise<void> {
  const { error } = await supabase
    .from('content_briefs')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete content brief: ${error.message}`);
  }
}

export async function getBriefBySourceId(sourceId: string, sourceType: 'idea' | 'suggestion'): Promise<ContentBrief | null> {
  const { data, error } = await supabase
    .from('content_briefs')
    .select('id,user_id,source_id,source_type,title,description,brief_type,target_audience,status,content,file_summary,created_at,updated_at')
    .eq('source_id', sourceId)
    .eq('source_type', sourceType)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get brief: ${error.message}`);
  }

  return data as ContentBrief | null;
}
