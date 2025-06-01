
import { supabase } from '@/integrations/supabase/client';
import { ContentBrief, ContentBriefFilters, CreateContentBriefData } from '@/types/contentBriefs';

export async function fetchContentBriefs(userId: string, filters?: ContentBriefFilters): Promise<ContentBrief[]> {
  let query = supabase
    .from('content_briefs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

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

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch content briefs: ${error.message}`);
  }

  return (data || []) as ContentBrief[];
}

export async function createContentBrief(briefData: CreateContentBriefData): Promise<ContentBrief> {
  const { data, error } = await supabase
    .from('content_briefs')
    .insert([briefData])
    .select()
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
    .select()
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
    .select('*')
    .eq('source_id', sourceId)
    .eq('source_type', sourceType)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get brief: ${error.message}`);
  }

  return data as ContentBrief | null;
}
