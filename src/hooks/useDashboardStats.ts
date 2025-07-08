
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

      // Get content items stats
      const { data: contentItems, error: contentItemsError } = await supabase
        .from('content_items')
        .select('status, created_at')
        .eq('user_id', user.id);

      if (contentItemsError) throw contentItemsError;

      // Get knowledge base items count from all 4 tables
      const [
        { count: documentsCount },
        { count: industryCount },
        { count: newsCount },
        { count: competitorCount }
      ] = await Promise.all([
        supabase.from('documents').select('*', { count: 'exact', head: true }),
        supabase.from('documents_industry').select('*', { count: 'exact', head: true }),
        supabase.from('documents_news').select('*', { count: 'exact', head: true }),
        supabase.from('documents_competitor').select('*', { count: 'exact', head: true })
      ]);

      const pendingItems = contentItems?.filter(item => 
        ['pending', 'draft', 'needs_fix'].includes(item.status)
      ) || [];

      return {
        totalContentItems: contentItems?.length || 0,
        pendingContentItems: pendingItems.length,
        knowledgeBaseItems: (documentsCount || 0) + (industryCount || 0) + (newsCount || 0) + (competitorCount || 0),
      };
    },
    enabled: !!user?.id,
  });
}
