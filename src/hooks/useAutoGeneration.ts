
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface AutoGenerationSchedule {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  is_active: boolean;
  next_run_at: string;
  created_at: string;
  updated_at: string;
}

export function useAutoGeneration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['auto-generation-schedule', user?.id],
    queryFn: async (): Promise<AutoGenerationSchedule | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('auto_generation_schedules')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    },
    enabled: !!user?.id,
  });

  const generateNowMutation = useMutation({
    mutationFn: async () => {
      // Trigger webhook for immediate generation
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
                type: 'auto_generation',
                mode: 'immediate',
                user_id: user?.id,
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
      toast({
        title: 'Auto-generation started',
        description: 'Content ideas are being generated automatically.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to start auto-generation',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async (scheduleData: { frequency: string; is_active: boolean }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const nextRunAt = calculateNextRun(scheduleData.frequency);
      
      const { data, error } = await supabase
        .from('auto_generation_schedules')
        .upsert({
          user_id: user.id,
          frequency: scheduleData.frequency as any,
          is_active: scheduleData.is_active,
          next_run_at: nextRunAt,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-generation-schedule'] });
      toast({
        title: 'Schedule updated',
        description: 'Auto-generation schedule has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update schedule',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  return {
    schedule,
    isLoading,
    generateNow: generateNowMutation.mutate,
    updateSchedule: updateScheduleMutation.mutate,
    isGenerating: generateNowMutation.isPending,
    isUpdatingSchedule: updateScheduleMutation.isPending,
  };
}

function calculateNextRun(frequency: string): string {
  const now = new Date();
  switch (frequency) {
    case 'daily':
      now.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      now.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
    case 'quarterly':
      now.setMonth(now.getMonth() + 3);
      break;
  }
  return now.toISOString();
}
