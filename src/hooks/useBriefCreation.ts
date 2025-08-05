
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ContentIdea, ContentSuggestion } from '@/types/contentIdeas';
import { updateContentIdea } from '@/services/contentIdeasApi';
import { supabase } from '@/integrations/supabase/client';
import { triggerWebhook } from '@/services/webhookService';
import { getCallbackUrl } from '@/config/environment';
import { useState } from 'react';

interface BriefCreationParams {
  id: string;
  type: 'idea' | 'suggestion';
  ideaId?: string; // For suggestions, we need the parent idea ID
}

export function useBriefCreation(ideas: ContentIdea[]) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [creatingBriefId, setCreatingBriefId] = useState<string | null>(null);

  const createBriefMutation = useMutation({
    mutationFn: async ({ id, type, ideaId }: BriefCreationParams) => {
      console.log('Creating brief for:', { id, type, ideaId });
      setCreatingBriefId(id);
      
      if (type === 'idea') {
        // First check if brief already exists to prevent duplicates
        const { data: existingBrief } = await supabase
          .from('content_briefs')
          .select('id')
          .eq('source_id', id)
          .eq('source_type', 'idea')
          .maybeSingle();

        if (existingBrief) {
          throw new Error('Brief already exists for this idea');
        }

        // Update idea status to show brief is being created
        await updateContentIdea(id, { status: 'brief_created' });

        // Get idea data for webhook
        const idea = ideas.find(i => i.id === id);
        
        // Trigger webhook for brief creator - N8N will handle brief creation
        await triggerWebhook('brief_creator', {
          type: 'brief_creation',
          idea: idea,
          user_id: user?.id,
          timestamp: new Date().toISOString(),
          callback_url: getCallbackUrl('process-idea-callback'),
          callback_data: {
            type: 'brief_completion',
            content_idea_id: idea?.id,
            user_id: user?.id,
            title: idea?.title || 'Content Brief'
          }
        });
      } else if (type === 'suggestion') {
        // First check if brief already exists for this suggestion
        const { data: existingBrief } = await supabase
          .from('content_briefs')
          .select('id')
          .eq('source_id', id)
          .eq('source_type', 'suggestion')
          .maybeSingle();

        if (existingBrief) {
          throw new Error('Brief already exists for this suggestion');
        }

        // For suggestions, get the suggestion data
        const { data: suggestion, error } = await supabase
          .from('content_suggestions')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        // Update suggestion timestamp to show activity
        await supabase
          .from('content_suggestions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', id);

        // Get the parent idea if ideaId is provided
        let parentIdea = null;
        if (ideaId || suggestion.content_idea_id) {
          parentIdea = ideas.find(i => i.id === (ideaId || suggestion.content_idea_id));
        }

        // Trigger webhook for brief creator with suggestion data - N8N will handle brief creation
        await triggerWebhook('brief_creator', {
          type: 'brief_creation',
          suggestion: suggestion,
          idea: parentIdea,
          user_id: user?.id,
          timestamp: new Date().toISOString(),
          callback_url: getCallbackUrl('process-idea-callback'),
          callback_data: {
            type: 'brief_completion',
            content_idea_id: parentIdea?.id || suggestion.content_idea_id,
            user_id: user?.id,
            title: suggestion.title || 'Content Brief'
          }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-ideas'] });
      queryClient.invalidateQueries({ queryKey: ['content-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['content-briefs'] });
      queryClient.invalidateQueries({ queryKey: ['content-brief'] });
      queryClient.invalidateQueries({ queryKey: ['content-brief-by-source'] });
      setCreatingBriefId(null);
      toast({
        title: 'Brief creation started',
        description: 'The content brief is being created by our AI workflow.',
      });
    },
    onError: (error) => {
      console.error('Brief creation error:', error);
      setCreatingBriefId(null);
      toast({
        title: 'Failed to start brief creation',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  return {
    createBrief: (id: string, type: 'idea' | 'suggestion' = 'idea', ideaId?: string) => 
      createBriefMutation.mutate({ id, type, ideaId }),
    isCreatingBrief: (id: string) => creatingBriefId === id,
  };
}
