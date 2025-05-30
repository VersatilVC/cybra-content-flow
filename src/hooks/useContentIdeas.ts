import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ContentIdea {
  id: string;
  title: string;
  description: string | null;
  content_type: 'Blog Post' | 'Guide';
  target_audience: 'Private Sector' | 'Government Sector';
  status: 'submitted' | 'processing' | 'processed' | 'brief_created' | 'discarded';
  source_type: 'manual' | 'file' | 'url';
  source_data: any;
  created_at: string;
  updated_at: string;
}

export interface ContentIdeaFilters {
  contentType?: string;
  targetAudience?: string;
  status?: string;
  search?: string;
}

export function useContentIdeas(filters?: ContentIdeaFilters) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ideas = [], isLoading, error } = useQuery({
    queryKey: ['content-ideas', user?.id, filters],
    queryFn: async (): Promise<ContentIdea[]> => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('content_ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.contentType && filters.contentType !== 'All Content Types') {
        query = query.eq('content_type', filters.contentType);
      }
      
      if (filters?.targetAudience && filters.targetAudience !== 'All Audiences') {
        query = query.eq('target_audience', filters.targetAudience);
      }
      
      if (filters?.status && filters.status !== 'All Statuses') {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Type cast to ensure proper types
      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        content_type: item.content_type as 'Blog Post' | 'Guide',
        target_audience: item.target_audience as 'Private Sector' | 'Government Sector',
        status: item.status as 'submitted' | 'processing' | 'processed' | 'brief_created' | 'discarded',
        source_type: item.source_type as 'manual' | 'file' | 'url',
        source_data: item.source_data,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
    },
    enabled: !!user?.id,
  });

  const createIdeaMutation = useMutation({
    mutationFn: async (ideaData: Omit<ContentIdea, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('content_ideas')
        .insert({
          ...ideaData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Trigger webhook for idea engine
      const webhooks = await supabase
        .from('webhook_configurations')
        .select('*')
        .eq('webhook_type', 'idea_engine')
        .eq('is_active', true);

      if (webhooks.data && webhooks.data.length > 0) {
        for (const webhook of webhooks.data) {
          try {
            await fetch(webhook.webhook_url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'idea_submission',
                idea: data,
                timestamp: new Date().toISOString(),
              }),
            });
          } catch (webhookError) {
            console.error('Webhook error:', webhookError);
          }
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-ideas'] });
      toast({
        title: 'Idea submitted successfully',
        description: 'Your content idea has been submitted and is being processed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to submit idea',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const updateIdeaMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ContentIdea> }) => {
      const { data, error } = await supabase
        .from('content_ideas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-ideas'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update idea',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const deleteIdeaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('content_ideas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-ideas'] });
      toast({
        title: 'Idea discarded',
        description: 'The content idea has been discarded.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to discard idea',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const createBriefMutation = useMutation({
    mutationFn: async (ideaId: string) => {
      // Update idea status
      await updateIdeaMutation.mutateAsync({
        id: ideaId,
        updates: { status: 'brief_created' }
      });

      // Trigger webhook for brief creator
      const webhooks = await supabase
        .from('webhook_configurations')
        .select('*')
        .eq('webhook_type', 'brief_creator')
        .eq('is_active', true);

      if (webhooks.data && webhooks.data.length > 0) {
        const idea = ideas.find(i => i.id === ideaId);
        for (const webhook of webhooks.data) {
          try {
            await fetch(webhook.webhook_url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'brief_creation',
                idea: idea,
                timestamp: new Date().toISOString(),
              }),
            });
          } catch (webhookError) {
            console.error('Webhook error:', webhookError);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-ideas'] });
      toast({
        title: 'Brief creation started',
        description: 'The content brief is being created.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create brief',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  return {
    ideas,
    isLoading,
    error,
    createIdea: createIdeaMutation.mutate,
    updateIdea: updateIdeaMutation.mutate,
    deleteIdea: deleteIdeaMutation.mutate,
    createBrief: createBriefMutation.mutate,
    isCreating: createIdeaMutation.isPending,
    isUpdating: updateIdeaMutation.isPending,
    isDeleting: deleteIdeaMutation.isPending,
    isCreatingBrief: createBriefMutation.isPending,
  };
}
