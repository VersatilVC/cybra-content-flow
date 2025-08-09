
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContentItem } from '@/services/contentItemsApi';

export function useContentItemByBrief(briefId: string) {
  return useQuery({
    queryKey: ['content-item-by-brief', briefId],
    queryFn: async (): Promise<ContentItem | null> => {
      if (!briefId) return null;
      
      const { data, error } = await supabase
        .from('content_items')
        .select('id,user_id,title,content,content_type,status,summary,word_count,tags,resources,multimedia_suggestions,content_brief_id,submission_id,wordpress_url,created_at,updated_at,file_summary')
        .eq('content_brief_id', briefId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching content item by brief:', error);
        return null;
      }
      
      return data as ContentItem | null;
    },
    enabled: !!briefId,
  });
}
