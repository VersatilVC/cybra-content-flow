
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ContentIdea } from '@/types/contentIdeas';
import { ContentBrief } from '@/types/contentBriefs';
import { ContentItem } from '@/services/contentItemsApi';

interface TodoSections {
  contentIdeas: ContentIdea[];
  contentBriefs: ContentBrief[];
  contentItems: ContentItem[];
  totalCount: number;
}

export function useDashboardTodos() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-todos', user?.id],
    queryFn: async (): Promise<TodoSections> => {
      if (!user?.id) throw new Error('User not authenticated');

      // Fetch content ideas that need review (processed status)
      const { data: ideas, error: ideasError } = await supabase
        .from('content_ideas')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'processed')
        .order('created_at', { ascending: false })
        .limit(5);

      if (ideasError) throw ideasError;

      // Fetch content briefs that need review (ready or draft status)
      const { data: briefs, error: briefsError } = await supabase
        .from('content_briefs')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['ready', 'draft'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (briefsError) throw briefsError;

      // Fetch content items that need review (pending or needs_fix status)
      const { data: items, error: itemsError } = await supabase
        .from('content_items')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'needs_fix'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (itemsError) throw itemsError;

      const totalCount = (ideas?.length || 0) + (briefs?.length || 0) + (items?.length || 0);

      return {
        contentIdeas: ideas || [],
        contentBriefs: briefs || [],
        contentItems: items || [],
        totalCount,
      };
    },
    enabled: !!user?.id,
  });
}
