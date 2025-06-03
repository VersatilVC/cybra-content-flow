
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createContentIdea } from '@/services/contentIdeasApi';
import { triggerAutoGenerationWebhooks } from '@/lib/webhookHandlers';

export function useAutoGeneration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateNowMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Creating auto-generated content idea...');
      
      // Create an auto-generated content idea
      const currentDate = new Date().toLocaleDateString();
      const autoIdeaData = {
        title: `Auto generated - ${currentDate}`,
        description: 'Auto-generated content ideas based on current trends and data',
        content_type: 'Blog Post' as const,
        target_audience: 'Private Sector' as const,
        status: 'processing' as const,
        source_type: 'auto_generated' as const,
        source_data: {
          generated_at: new Date().toISOString(),
          generation_type: 'auto',
          user_id: user.id
        }
      };

      const createdIdea = await createContentIdea(user.id, autoIdeaData);
      console.log('Auto-generated content idea created:', createdIdea);

      // Trigger auto-generation webhooks with the created idea data
      await triggerAutoGenerationWebhooks(user.id, {
        content_idea_id: createdIdea.id,
        title: createdIdea.title,
        content_type: createdIdea.content_type,
        target_audience: createdIdea.target_audience,
        generated_at: new Date().toISOString(),
        generation_type: 'auto'
      });

      return createdIdea;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-ideas'] });
      toast({
        title: 'Auto-generation started',
        description: 'Content ideas are being generated automatically. Check back in a few minutes to see the results.',
      });
    },
    onError: (error) => {
      console.error('Auto-generation failed:', error);
      toast({
        title: 'Failed to start auto-generation',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  return {
    generateNow: generateNowMutation.mutate,
    isGenerating: generateNowMutation.isPending,
  };
}
