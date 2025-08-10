
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CategoryCounts = Record<string, { total: number; approved: number; published: number }>;
export type DerivativeCountsMap = Record<string, CategoryCounts>;

export function useDerivativeCounts(contentItemIds: string[]) {
  const ids = Array.isArray(contentItemIds) ? Array.from(new Set(contentItemIds)).sort() : [];
  const key = ids.join(',');
  return useQuery({
    queryKey: ['derivative-counts', key],
    enabled: ids.length > 0,
    staleTime: 15000,
    queryFn: async (): Promise<DerivativeCountsMap> => {
      const { data, error } = await supabase
        .rpc('get_derivative_counts', { item_ids: ids });

      if (error) throw error;

      const map: DerivativeCountsMap = {};
      for (const row of (data as any[]) || []) {
        const itemId = row.content_item_id as string;
        const category = row.category as string;
        if (!map[itemId]) map[itemId] = {};
        if (!map[itemId][category]) map[itemId][category] = { total: 0, approved: 0, published: 0 };
        map[itemId][category].total += (row.total || 0);
        map[itemId][category].approved += (row.approved || 0);
        map[itemId][category].published += (row.published || 0);
      }
      return map;
    },
  });
}
