
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ContentBrief, ContentBriefFilters } from '@/types/contentBriefs';

export function useContentBriefs(
  filters: ContentBriefFilters,
  options?: { page?: number; pageSize?: number }
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['content-briefs', filters, options],
    queryFn: async () => {
      const start = (typeof performance !== 'undefined' ? performance.now() : Date.now());
      let q = supabase
        .from('content_briefs')
        .select('id,user_id,source_id,source_type,title,description,brief_type,target_audience,status,content,file_summary,created_at,updated_at', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (options?.page && options?.pageSize) {
        const page = Math.max(1, options.page);
        const pageSize = Math.max(1, Math.min(50, options.pageSize));
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        q = q.range(from, to);
      }

      if (filters.briefType && filters.briefType !== 'All Brief Types') {
        q = q.eq('brief_type', filters.briefType);
      }

      if (filters.targetAudience && filters.targetAudience !== 'All Audiences') {
        q = q.eq('target_audience', filters.targetAudience);
      }

      if (filters.status && filters.status !== 'All Statuses') {
        q = q.eq('status', filters.status);
      }

      if (filters.search) {
        q = q.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await q;

      if (error) throw error;
      const duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
      console.debug('useContentBriefs fetch', { count: data?.length || 0, totalCount: count ?? 0, durationMs: Math.round(duration as number), paged: !!(options?.page && options?.pageSize) });
      return { items: (data || []) as ContentBrief[], totalCount: count ?? 0 };
    },
    placeholderData: keepPreviousData,
  });

  // Prefetch next page if pagination options provided
  useEffect(() => {
    if (options?.page && options?.pageSize) {
      const nextPage = options.page + 1;
      const nextOptions = { ...options, page: nextPage };
      queryClient.prefetchQuery({
        queryKey: ['content-briefs', filters, nextOptions],
        queryFn: async () => {
          let q = supabase
            .from('content_briefs')
            .select('id,user_id,source_id,source_type,title,description,brief_type,target_audience,status,content,file_summary,created_at,updated_at')
            .order('created_at', { ascending: false });
          const from = (nextPage - 1) * options.pageSize;
          const to = from + options.pageSize - 1;
          q = q.range(from, to);

          if (filters.briefType && filters.briefType !== 'All Brief Types') q = q.eq('brief_type', filters.briefType);
          if (filters.targetAudience && filters.targetAudience !== 'All Audiences') q = q.eq('target_audience', filters.targetAudience);
          if (filters.status && filters.status !== 'All Statuses') q = q.eq('status', filters.status);
          if (filters.search) q = q.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);

          const { data } = await q;
          return (data || []) as ContentBrief[];
        },
      });
    }
  }, [options?.page, options?.pageSize, JSON.stringify(filters), queryClient]);

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
    briefs: query.data?.items || [],
    totalCount: query.data?.totalCount ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    deleteBrief: deleteBriefMutation.mutate,
    updateBrief: updateBriefMutation.mutate,
    isUpdating: updateBriefMutation.isPending,
  };
}

// Re-export the useBriefBySource hook from its own file
export { useBriefBySource } from './useBriefBySource';
