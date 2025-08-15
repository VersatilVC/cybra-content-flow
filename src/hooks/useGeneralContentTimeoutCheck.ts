import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOptimizedAuthContext } from '@/contexts/OptimizedAuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useGeneralContentTimeoutCheck() {
  const { user } = useOptimizedAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const forceTimeoutCheckMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Forcing timeout check for stuck general content items...');
      
      // Call the database function to check for timed out items
      const { data, error } = await supabase.rpc('force_check_timed_out_general_content');
      
      if (error) {
        console.error('Error checking for timed out general content:', error);
        throw error;
      }

      console.log('General content timeout check result:', data);
      return data;
    },
    onSuccess: (result) => {
      if (result && result.length > 0) {
        const { updated_count, failed_items } = result[0];
        
        queryClient.invalidateQueries({ queryKey: ['general-content'] });
        
        if (updated_count > 0) {
          toast({
            title: 'Timeout check completed',
            description: `Found and updated ${updated_count} timed-out general content item(s).`,
          });
          
          console.log('Updated timed-out general content items:', failed_items);
        } else {
          toast({
            title: 'No timeouts found',
            description: 'All general content items are processing normally.',
          });
        }
      }
    },
    onError: (error) => {
      console.error('Failed to check general content timeouts:', error);
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