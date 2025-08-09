import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface ContentItem {
  id: string;
  user_id: string;
  content_brief_id: string | null;
  submission_id: string | null;
  title: string;
  content: string | null;
  summary: string | null;
  tags: string[] | null;
  resources: string[] | null;
  multimedia_suggestions: string | null;
  content_type: string;
  status: 'ready_for_review' | 'derivatives_created' | 'published' | 'discarded' | 'needs_revision' | 'needs_fix';
  word_count: number | null;
  wordpress_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateContentItemData {
  user_id: string;
  content_brief_id?: string;
  submission_id?: string;
  title: string;
  content?: string;
  summary?: string;
  tags?: string[];
  resources?: string[];
  multimedia_suggestions?: string;
  content_type: string;
  status?: 'ready_for_review' | 'derivatives_created' | 'published' | 'discarded' | 'needs_revision' | 'needs_fix';
  word_count?: number;
}

export interface ContentItemFilters {
  status?: string; // e.g., 'draft', 'published', etc. Use undefined for all
  type?: string;   // maps to content_type. Use undefined for all
  search?: string; // free text search across title and summary
}

export async function fetchContentItems(
  userId: string,
  filters?: ContentItemFilters,
  options?: { page?: number; pageSize?: number }
): Promise<{ items: ContentItem[]; totalCount: number }> {
  logger.info('Fetching content items for user:', userId, { filters, options });
  
  let query = supabase
    .from('content_items')
    .select(
      'id,user_id,content_brief_id,submission_id,title,summary,tags,resources,multimedia_suggestions,content_type,status,word_count,wordpress_url,created_at,updated_at',
      { count: 'planned' }
    )
    .order('created_at', { ascending: false });

  // Apply server-side filters
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.type) {
    query = query.eq('content_type', filters.type);
  }
  if (filters?.search) {
    const term = filters.search.trim();
    if (term.length > 0) {
      query = query.or(`title.ilike.%${term}%,summary.ilike.%${term}%`);
    }
  }
  
  if (options?.page && options?.pageSize) {
    const page = Math.max(1, options.page);
    const pageSize = Math.max(1, Math.min(50, options.pageSize));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) {
    logger.error('Error fetching content items:', error);
    throw new Error(`Failed to fetch content items: ${error.message}`);
  }

  return { items: (data || []) as ContentItem[], totalCount: count ?? 0 };
}

export async function fetchContentItemsByBrief(briefId: string): Promise<ContentItem[]> {
  logger.info('Fetching content items for brief:', briefId);
  
  const { data, error } = await supabase
    .from('content_items')
    .select('id,user_id,content_brief_id,submission_id,title,content,summary,tags,resources,multimedia_suggestions,content_type,status,word_count,wordpress_url,created_at,updated_at')
    .eq('content_brief_id', briefId)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching content items by brief:', error);
    throw new Error(`Failed to fetch content items: ${error.message}`);
  }

  return data as ContentItem[];
}

export async function createContentItem(itemData: CreateContentItemData): Promise<ContentItem> {
  logger.info('Creating content item:', itemData);
  
  const { data, error } = await supabase
    .from('content_items')
    .insert([itemData])
.select('id,user_id,content_brief_id,submission_id,title,content,summary,tags,resources,multimedia_suggestions,content_type,status,word_count,wordpress_url,created_at,updated_at')
    .single();

  if (error) {
    logger.error('Error creating content item:', error);
    throw new Error(`Failed to create content item: ${error.message}`);
  }

  return data as ContentItem;
}

export async function updateContentItem(id: string, updates: Partial<ContentItem>): Promise<ContentItem> {
  logger.info('Updating content item:', id, updates);
  
  const { data, error } = await supabase
    .from('content_items')
    .update(updates)
    .eq('id', id)
.select('id,user_id,content_brief_id,submission_id,title,content,summary,tags,resources,multimedia_suggestions,content_type,status,word_count,wordpress_url,created_at,updated_at')
    .single();

  if (error) {
    logger.error('Error updating content item:', error);
    throw new Error(`Failed to update content item: ${error.message}`);
  }

  return data as ContentItem;
}

export async function deleteContentItem(id: string): Promise<void> {
  logger.info('Deleting content item:', id);
  
  const { error } = await supabase
    .from('content_items')
    .delete()
    .eq('id', id);

  if (error) {
    logger.error('Error deleting content item:', error);
    throw new Error(`Failed to delete content item: ${error.message}`);
  }
}
