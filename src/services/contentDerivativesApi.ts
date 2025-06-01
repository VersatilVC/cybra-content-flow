
import { supabase } from '@/integrations/supabase/client';

export interface ContentDerivative {
  id: string;
  content_item_id: string;
  user_id: string;
  title: string;
  content: string;
  derivative_type: string;
  category: 'General' | 'Social' | 'Ads';
  status: 'draft' | 'approved' | 'published' | 'discarded';
  metadata: Record<string, any>;
  word_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateContentDerivativeData {
  content_item_id: string;
  user_id: string;
  title: string;
  content: string;
  derivative_type: string;
  category: 'General' | 'Social' | 'Ads';
  status?: 'draft' | 'approved' | 'published' | 'discarded';
  metadata?: Record<string, any>;
  word_count?: number;
}

export async function fetchContentDerivatives(contentItemId: string): Promise<ContentDerivative[]> {
  console.log('Fetching content derivatives for item:', contentItemId);
  
  const { data, error } = await supabase
    .from('content_derivatives')
    .select('*')
    .eq('content_item_id', contentItemId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching content derivatives:', error);
    throw new Error(`Failed to fetch content derivatives: ${error.message}`);
  }

  return data as ContentDerivative[];
}

export async function createContentDerivative(derivativeData: CreateContentDerivativeData): Promise<ContentDerivative> {
  console.log('Creating content derivative:', derivativeData);
  
  const { data, error } = await supabase
    .from('content_derivatives')
    .insert([derivativeData])
    .select()
    .single();

  if (error) {
    console.error('Error creating content derivative:', error);
    throw new Error(`Failed to create content derivative: ${error.message}`);
  }

  return data as ContentDerivative;
}

export async function updateContentDerivative(id: string, updates: Partial<ContentDerivative>): Promise<ContentDerivative> {
  console.log('Updating content derivative:', id, updates);
  
  const { data, error } = await supabase
    .from('content_derivatives')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating content derivative:', error);
    throw new Error(`Failed to update content derivative: ${error.message}`);
  }

  return data as ContentDerivative;
}

export async function deleteContentDerivative(id: string): Promise<void> {
  console.log('Deleting content derivative:', id);
  
  const { error } = await supabase
    .from('content_derivatives')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting content derivative:', error);
    throw new Error(`Failed to delete content derivative: ${error.message}`);
  }
}
