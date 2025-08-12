import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOptimizedAuthContext } from '@/contexts/OptimizedAuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useTimeoutCheck() {
  const { user } = useOptimizedAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const forceTimeoutCheckMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Forcing timeout check for stuck content ideas...');
      
      // Call the database function to check for timed out ideas
      const { data, error } = await supabase.rpc('force_check_timed_out_ideas');
      
      if (error) {
        console.error('Error checking for timed out ideas:', error);
        throw error;
      }

      console.log('Timeout check result:', data);
      return data;
    },
    onSuccess: (result) => {
      if (result && result.length > 0) {
        const { updated_count, failed_ideas } = result[0];
        
        queryClient.invalidateQueries({ queryKey: ['content-ideas'] });
        
        if (updated_count > 0) {
          toast({
            title: 'Timeout check completed',
            description: `Found and updated ${updated_count} timed-out content idea(s).`,
          });
          
          console.log('Updated timed-out ideas:', failed_ideas);
        } else {
          toast({
            title: 'No timeouts found',
            description: 'All content ideas are processing normally.',
          });
        }
      }
    },
    onError: (error) => {
      console.error('Failed to check timeouts:', error);
      toast({
        title: 'Failed to check timeouts',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  return {
    forceTimeoutCheck: forceTimeoutCheckMutation.mutate,
    isCheckingTimeouts: forceTimeoutCheckMutation.isPending,
  };
}