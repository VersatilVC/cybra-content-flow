
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
  const { data: result, error } = await supabase
    .from('general_content_items')
    .insert([{
      ...data,
      user_id: (await supabase.auth.getUser()).data.user?.id
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating general content:', error);
    throw new Error('Failed to create general content');
  }

  return result as GeneralContentItem;
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
