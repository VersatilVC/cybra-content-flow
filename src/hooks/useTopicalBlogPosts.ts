import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TopicalBlogPost {
  id: string;
  title: string;
  content_type: string;
  status: string;
  created_at: string;
  summary?: string;
}

export const useTopicalBlogPosts = () => {
  return useQuery({
    queryKey: ['topical-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_items')
        .select('id, title, content_type, status, created_at, summary')
        .in('content_type', ['Blog Post', 'Blog Post (Topical)'])
        .in('status', ['completed', 'published'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TopicalBlogPost[];
    }
  });
};