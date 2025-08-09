
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
    queryFn: async (): Promise<DerivativeCountsMap> => {
      const { data, error } = await supabase
        .from('content_derivatives')
        .select('content_item_id, category, status')
        .in('content_item_id', ids);

      if (error) throw error;

      const map: DerivativeCountsMap = {};
      for (const d of (data as any[]) || []) {
        const itemId = d.content_item_id as string;
        const category = d.category as string;
        const status = d.status as string;
        if (!map[itemId]) map[itemId] = {};
        if (!map[itemId][category]) map[itemId][category] = { total: 0, approved: 0, published: 0 };
        map[itemId][category].total++;
        if (status === 'approved') map[itemId][category].approved++;
        if (status === 'published') map[itemId][category].published++;
      }
      return map;
    },
  });
}
