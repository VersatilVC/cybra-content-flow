
import { supabase } from '@/integrations/supabase/client';

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

export async function fetchContentItems(userId: string, options?: { page?: number; pageSize?: number }): Promise<ContentItem[]> {
  console.log('Fetching content items for user:', userId);
  
  // With company-wide access, we fetch all content items (RLS will filter appropriately)
  let query = supabase
    .from('content_items')
    .select('id,user_id,content_brief_id,submission_id,title,content,summary,tags,resources,multimedia_suggestions,content_type,status,word_count,wordpress_url,created_at,updated_at')
    .order('created_at', { ascending: false });
  
  if (options?.page && options?.pageSize) {
    const page = Math.max(1, options.page);
    const pageSize = Math.max(1, Math.min(50, options.pageSize));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching content items:', error);
    throw new Error(`Failed to fetch content items: ${error.message}`);
  }

  return data as ContentItem[];
}

export async function fetchContentItemsByBrief(briefId: string): Promise<ContentItem[]> {
  console.log('Fetching content items for brief:', briefId);
  
  const { data, error } = await supabase
    .from('content_items')
    .select('id,user_id,content_brief_id,submission_id,title,content,summary,tags,resources,multimedia_suggestions,content_type,status,word_count,wordpress_url,created_at,updated_at')
    .eq('content_brief_id', briefId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching content items by brief:', error);
    throw new Error(`Failed to fetch content items: ${error.message}`);
  }

  return data as ContentItem[];
}

export async function createContentItem(itemData: CreateContentItemData): Promise<ContentItem> {
  console.log('Creating content item:', itemData);
  
  const { data, error } = await supabase
    .from('content_items')
    .insert([itemData])
.select('id,user_id,content_brief_id,submission_id,title,content,summary,tags,resources,multimedia_suggestions,content_type,status,word_count,wordpress_url,created_at,updated_at')
    .single();

  if (error) {
    console.error('Error creating content item:', error);
    throw new Error(`Failed to create content item: ${error.message}`);
  }

  return data as ContentItem;
}

export async function updateContentItem(id: string, updates: Partial<ContentItem>): Promise<ContentItem> {
  console.log('Updating content item:', id, updates);
  
  const { data, error } = await supabase
    .from('content_items')
    .update(updates)
    .eq('id', id)
.select('id,user_id,content_brief_id,submission_id,title,content,summary,tags,resources,multimedia_suggestions,content_type,status,word_count,wordpress_url,created_at,updated_at')
    .single();

  if (error) {
    console.error('Error updating content item:', error);
    throw new Error(`Failed to update content item: ${error.message}`);
  }

  return data as ContentItem;
}

export async function deleteContentItem(id: string): Promise<void> {
  console.log('Deleting content item:', id);
  
  const { error } = await supabase
    .from('content_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting content item:', error);
    throw new Error(`Failed to delete content item: ${error.message}`);
  }
}
