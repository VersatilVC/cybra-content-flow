
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContentSuggestion } from '@/types/contentIdeas';

export function useContentSuggestions(ideaId: string) {
  return useQuery({
    queryKey: ['content-suggestions', ideaId],
    queryFn: async (): Promise<ContentSuggestion[]> => {
      const { data, error } = await supabase
        .from('content_suggestions')
        .select('*')
        .eq('content_idea_id', ideaId)
        .order('relevance_score', { ascending: false });

      if (error) throw error;
      
      return data || [];
    },
    enabled: !!ideaId,
  });
}
