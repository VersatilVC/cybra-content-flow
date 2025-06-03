
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useBriefBySource(sourceId: string, sourceType: 'idea' | 'suggestion') {
  return useQuery({
    queryKey: ['content-brief-by-source', sourceId, sourceType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_briefs')
        .select('*')
        .eq('source_id', sourceId)
        .eq('source_type', sourceType)
        .maybeSingle();

      if (error) throw error;
      
      return data;
    },
    enabled: !!sourceId,
  });
}
