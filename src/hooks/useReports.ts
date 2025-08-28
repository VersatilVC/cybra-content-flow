import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Report {
  id: string;
  title: string;
  derivative_type: string;
  category: string;
  status: string;
  created_at: string;
  content?: string;
  word_count?: number;
  metadata: Record<string, any>;
}

export const useReports = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('general_content_items')
        .select('id, title, derivative_type, category, status, created_at, content, word_count, metadata')
        .eq('category', 'Reports')
        .in('status', ['ready', 'approved', 'published', 'processing', 'draft'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Report[];
    }
  });
};