
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ContentIdea, ContentSuggestion } from '@/types/contentIdeas';
import { updateContentIdea } from '@/services/contentIdeasApi';
import { supabase } from '@/integrations/supabase/client';
import { triggerWebhook } from '@/services/webhookService';

interface BriefCreationParams {
  id: string;
  type: 'idea' | 'suggestion';
  ideaId?: string; // For suggestions, we need the parent idea ID
}

export function useBriefCreation(ideas: ContentIdea[]) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createBriefMutation = useMutation({
    mutationFn: async ({ id, type, ideaId }: BriefCreationParams) => {
      console.log('Creating brief for:', { id, type, ideaId });
      
      if (type === 'idea') {
        // Update idea status
        await updateContentIdea(id, { status: 'brief_created' });

        // Trigger webhook for brief creator
        const idea = ideas.find(i => i.id === id);
        await triggerWebhook('brief_creator', {
          type: 'brief_creation',
          idea: idea,
          user_id: user?.id,
          timestamp: new Date().toISOString(),
        });
      } else if (type === 'suggestion') {
        // For suggestions, we update the suggestion status and use the suggestion data
        const { data: suggestion, error } = await supabase
          .from('content_suggestions')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        // Update suggestion status (if there's a status field)
        await supabase
          .from('content_suggestions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', id);

        // Get the parent idea if ideaId is provided
        let parentIdea = null;
        if (ideaId || suggestion.content_idea_id) {
          parentIdea = ideas.find(i => i.id === (ideaId || suggestion.content_idea_id));
        }

        // Trigger webhook for brief creator with suggestion data
        await triggerWebhook('brief_creator', {
          type: 'brief_creation',
          suggestion: suggestion,
          idea: parentIdea,
          user_id: user?.id,
          timestamp: new Date().toISOString(),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-ideas'] });
      queryClient.invalidateQueries({ queryKey: ['content-suggestions'] });
      toast({
        title: 'Brief creation started',
        description: 'The content brief is being created.',
      });
    },
    onError: (error) => {
      console.error('Brief creation error:', error);
      toast({
        title: 'Failed to create brief',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  return {
    createBrief: (id: string, type: 'idea' | 'suggestion' = 'idea', ideaId?: string) => 
      createBriefMutation.mutate({ id, type, ideaId }),
    isCreatingBrief: createBriefMutation.isPending,
  };
}
