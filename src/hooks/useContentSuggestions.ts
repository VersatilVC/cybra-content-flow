
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContentSuggestion } from '@/types/contentIdeas';

export function useContentSuggestions(ideaId: string) {
  return useQuery({
    queryKey: ['content-suggestions', ideaId],
    queryFn: async (): Promise<ContentSuggestion[]> => {
      const { data, error } = await supabase
        .from('content_suggestions')
        .select('id,content_idea_id,title,description,content_type,relevance_score,source_url,source_title,file_summary,created_at,updated_at,status,processing_started_at,processing_timeout_at,last_error_message,retry_count')
        .eq('content_idea_id', ideaId)
        .order('relevance_score', { ascending: false });

      if (error) throw error;
      
      return (data || []) as ContentSuggestion[];
    },
    enabled: !!ideaId,
  });
}
