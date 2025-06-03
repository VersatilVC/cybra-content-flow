
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContentBrief, ContentBriefFilters } from '@/types/contentBriefs';

export function useContentBriefs(filters: ContentBriefFilters) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['content-briefs', filters],
    queryFn: async () => {
      let query = supabase
        .from('content_briefs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.briefType && filters.briefType !== 'All Brief Types') {
        query = query.eq('brief_type', filters.briefType);
      }

      if (filters.targetAudience && filters.targetAudience !== 'All Audiences') {
        query = query.eq('target_audience', filters.targetAudience);
      }

      if (filters.status && filters.status !== 'All Statuses') {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ContentBrief[];
    },
  });

  const deleteBriefMutation = useMutation({
    mutationFn: async (briefId: string) => {
      const { error } = await supabase
        .from('content_briefs')
        .delete()
        .eq('id', briefId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-briefs'] });
    },
  });

  const updateBriefMutation = useMutation({
    mutationFn: async (brief: Partial<ContentBrief> & { id: string }) => {
      const { data, error } = await supabase
        .from('content_briefs')
        .update(brief)
        .eq('id', brief.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-briefs'] });
    },
  });

  return {
    briefs: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    deleteBrief: deleteBriefMutation.mutate,
    updateBrief: updateBriefMutation.mutate,
    isUpdating: updateBriefMutation.isPending,
  };
}

// Re-export the useBriefBySource hook from its own file
export { useBriefBySource } from './useBriefBySource';
