
import { useState, useEffect, useMemo } from 'react';
import { useOptimizedAuthContext } from '@/contexts/OptimizedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';
import { sanitizeText, secureStringSchema } from '@/lib/security';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'content_item' | 'content_idea' | 'content_brief';
  status?: string;
  created_at: string;
  url: string;
}

interface SearchResults {
  contentItems: SearchResult[];
  contentIdeas: SearchResult[];
  contentBriefs: SearchResult[];
  total: number;
}

export function useGlobalSearch(query: string) {
  const { user } = useOptimizedAuthContext();
  const [results, setResults] = useState<SearchResults>({
    contentItems: [],
    contentIdeas: [],
    contentBriefs: [],
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const searchQuery = useMemo(() => {
    try {
      // Validate and sanitize search input
      const validatedQuery = secureStringSchema.parse(debouncedQuery);
      const sanitized = sanitizeText(validatedQuery).trim().toLowerCase();
      // Escape special characters for PostgreSQL ILIKE
      return sanitized.replace(/[%_\\]/g, '\\$&');
    } catch {
      return ''; // Return empty string if validation fails
    }
  }, [debouncedQuery]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2 || !user?.id) {
      setResults({
        contentItems: [],
        contentIdeas: [],
        contentBriefs: [],
        total: 0,
      });
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      try {
        // Search content items
        const { data: contentItems } = await supabase
          .from('content_items')
          .select('id, title, summary, status, created_at')
          .eq('user_id', user.id)
          .or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
          .order('created_at', { ascending: false })
          .limit(5);

        // Search content ideas
        const { data: contentIdeas } = await supabase
          .from('content_ideas')
          .select('id, title, description, status, created_at')
          .eq('user_id', user.id)
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .order('created_at', { ascending: false })
          .limit(5);

        // Search content briefs
        const { data: contentBriefs } = await supabase
          .from('content_briefs')
          .select('id, title, description, status, created_at')
          .eq('user_id', user.id)
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .order('created_at', { ascending: false })
          .limit(5);

        const mappedResults: SearchResults = {
          contentItems: (contentItems || []).map(item => ({
            id: item.id,
            title: item.title,
            description: item.summary,
            type: 'content_item' as const,
            status: item.status,
            created_at: item.created_at,
            url: `/content-items/${item.id}`,
          })),
          contentIdeas: (contentIdeas || []).map(idea => ({
            id: idea.id,
            title: idea.title,
            description: idea.description,
            type: 'content_idea' as const,
            status: idea.status,
            created_at: idea.created_at,
            url: `/content-ideas?expand=${idea.id}`,
          })),
          contentBriefs: (contentBriefs || []).map(brief => ({
            id: brief.id,
            title: brief.title,
            description: brief.description,
            type: 'content_brief' as const,
            status: brief.status,
            created_at: brief.created_at,
            url: `/content-briefs?view=${brief.id}`,
          })),
          total: 0,
        };

        mappedResults.total = mappedResults.contentItems.length + 
                             mappedResults.contentIdeas.length + 
                             mappedResults.contentBriefs.length;

        setResults(mappedResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults({
          contentItems: [],
          contentIdeas: [],
          contentBriefs: [],
          total: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [searchQuery, user?.id]);

  return { results, isLoading, hasQuery: searchQuery.length >= 2 };
}
