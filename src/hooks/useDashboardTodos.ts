
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
      const { data: ideasData, error: ideasError } = await supabase
        .from('content_ideas')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'processed')
        .order('created_at', { ascending: false })
        .limit(5);

      if (ideasError) throw ideasError;

      // Fetch content briefs that need review (ready or draft status)
      const { data: briefsData, error: briefsError } = await supabase
        .from('content_briefs')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['ready', 'draft'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (briefsError) throw briefsError;

      // Fetch content items that need review (pending or needs_fix status)
      const { data: itemsData, error: itemsError } = await supabase
        .from('content_items')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'needs_fix'])
        .order('created_at', { ascending: false })
        .limit(5);

      if (itemsError) throw itemsError;

      // Type cast the data to ensure proper types
      const ideas: ContentIdea[] = (ideasData || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        content_type: item.content_type as 'Blog Post' | 'Guide',
        target_audience: item.target_audience as 'Private Sector' | 'Government Sector',
        status: item.status as 'processing' | 'processed' | 'brief_created' | 'discarded',
        source_type: item.source_type as 'manual' | 'file' | 'url',
        source_data: item.source_data,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      const briefs: ContentBrief[] = (briefsData || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        content: item.content,
        status: item.status as 'draft' | 'ready' | 'approved' | 'discarded' | 'content_created',
        source_type: item.source_type as 'idea' | 'suggestion',
        source_id: item.source_id,
        brief_type: item.brief_type as 'Blog Post' | 'Guide',
        target_audience: item.target_audience as 'Private Sector' | 'Government Sector',
        user_id: item.user_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      const items: ContentItem[] = (itemsData || []).map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        content_type: item.content_type,
        status: item.status,
        summary: item.summary,
        word_count: item.word_count,
        tags: item.tags,
        resources: item.resources,
        multimedia_suggestions: item.multimedia_suggestions,
        content_brief_id: item.content_brief_id,
        submission_id: item.submission_id,
        user_id: item.user_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));

      const totalCount = ideas.length + briefs.length + items.length;

      return {
        contentIdeas: ideas,
        contentBriefs: briefs,
        contentItems: items,
        totalCount,
      };
    },
    enabled: !!user?.id,
  });
}
