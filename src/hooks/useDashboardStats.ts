
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalContentItems: number;
  pendingContentItems: number;
  knowledgeBaseItems: number;
}

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user?.id) throw new Error('User not authenticated');

// Get content items counts efficiently
      const [
        { count: totalContentCount, error: totalError },
        { count: pendingCount, error: pendingError }
      ] = await Promise.all([
        supabase
          .from('content_items')
          .select('*', { count: 'planned', head: true })
          .eq('user_id', user.id),
        supabase
          .from('content_items')
          .select('*', { count: 'planned', head: true })
          .eq('user_id', user.id)
          .in('status', ['pending', 'draft', 'needs_fix', 'ready_for_review'])
      ]);

      if (totalError) throw totalError;
      if (pendingError) throw pendingError;

      // Get knowledge base items count from all 4 tables
      const [
        { count: documentsCount },
        { count: industryCount },
        { count: newsCount },
        { count: competitorCount }
      ] = await Promise.all([
supabase.from('documents').select('*', { count: 'planned', head: true }),
        supabase.from('documents_industry').select('*', { count: 'planned', head: true }),
        supabase.from('documents_news').select('*', { count: 'planned', head: true }),
        supabase.from('documents_competitor').select('*', { count: 'planned', head: true })
      ]);

return {
        totalContentItems: totalContentCount || 0,
        pendingContentItems: pendingCount || 0,
        knowledgeBaseItems: (documentsCount || 0) + (industryCount || 0) + (newsCount || 0) + (competitorCount || 0),
      };
    },
    enabled: !!user?.id,
  });
}
