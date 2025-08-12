import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useOptimizedAuth } from './useOptimizedAuth';

interface OptimizedQueryConfig {
  staleTime?: number;
  gcTime?: number;
  refetchInterval?: number;
  prefetch?: boolean;
}

export function useOptimizedQueries() {
  const { user } = useOptimizedAuth();
  const queryClient = useQueryClient();

  const getOptimizedConfig = (type: 'static' | 'dynamic' | 'realtime', custom?: OptimizedQueryConfig): OptimizedQueryConfig => {
    const baseConfigs = {
      static: {
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
      },
      dynamic: {
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      },
      realtime: {
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 60 * 1000, // 1 minute
      }
    };

    return { ...baseConfigs[type], ...custom };
  };

  const prefetchDashboardData = () => {
    if (!user?.id) return;

    // Prefetch dashboard stats
    queryClient.prefetchQuery({
      queryKey: ['dashboard-stats', user.id],
      staleTime: 5 * 60 * 1000,
    });

    // Prefetch recent content ideas
    queryClient.prefetchQuery({
      queryKey: ['content-ideas', user.id, { limit: 5 }],
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchContentPages = () => {
    if (!user?.id) return;

    // Prefetch content ideas
    queryClient.prefetchQuery({
      queryKey: ['content-ideas', user.id],
      staleTime: 2 * 60 * 1000,
    });

    // Prefetch content briefs
    queryClient.prefetchQuery({
      queryKey: ['content-briefs', user.id],
      staleTime: 2 * 60 * 1000,
    });

    // Prefetch content items
    queryClient.prefetchQuery({
      queryKey: ['content-items', user.id, { page: 1, limit: 20 }],
      staleTime: 2 * 60 * 1000,
    });
  };

  const invalidateUserData = () => {
    if (!user?.id) return;

    queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user.id] });
    queryClient.invalidateQueries({ queryKey: ['content-ideas', user.id] });
    queryClient.invalidateQueries({ queryKey: ['content-briefs', user.id] });
    queryClient.invalidateQueries({ queryKey: ['content-items', user.id] });
  };

  return {
    getOptimizedConfig,
    prefetchDashboardData,
    prefetchContentPages,
    invalidateUserData,
  };
}