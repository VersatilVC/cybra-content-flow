import { useQuery } from '@tanstack/react-query';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedQueries } from './useOptimizedQueries';

interface DashboardStats {
  totalContentItems: number;
  pendingContentItems: number;
  knowledgeBaseItems: number;
}

export function useOptimizedDashboardStats() {
  const { user } = useOptimizedAuth();
  const { getOptimizedConfig } = useOptimizedQueries();

  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get content items counts efficiently in parallel
      const [
        { count: totalContentCount, error: totalError },
        { count: pendingCount, error: pendingError },
        ...knowledgeBaseResults
      ] = await Promise.all([
        supabase
          .from('content_items')
          .select('*', { count: 'planned', head: true })
          .eq('user_id', user.id),
        supabase
          .from('content_items')
          .select('*', { count: 'planned', head: true })
          .eq('user_id', user.id)
          .in('status', ['pending', 'draft', 'needs_fix', 'ready_for_review']),
        // Knowledge base counts
        supabase.from('documents').select('*', { count: 'planned', head: true }),
        supabase.from('documents_industry').select('*', { count: 'planned', head: true }),
        supabase.from('documents_news').select('*', { count: 'planned', head: true }),
        supabase.from('documents_competitor').select('*', { count: 'planned', head: true })
      ]);

      if (totalError) throw totalError;
      if (pendingError) throw pendingError;

      const totalContentItems = totalContentCount || 0;
      const pendingContentItems = pendingCount || 0;

      // Process knowledge base stats
      const [
        { count: documentsCount },
        { count: industryCount },
        { count: newsCount },
        { count: competitorCount }
      ] = knowledgeBaseResults;

      return {
        totalContentItems,
        pendingContentItems,
        knowledgeBaseItems: (documentsCount || 0) + (industryCount || 0) + (newsCount || 0) + (competitorCount || 0),
      };
    },
    enabled: !!user?.id,
    ...getOptimizedConfig('static', {
      staleTime: 5 * 60 * 1000, // 5 minutes - dashboard stats don't change frequently
    }),
  });
}