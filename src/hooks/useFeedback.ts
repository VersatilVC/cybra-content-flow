
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type FeedbackCategory = Database['public']['Enums']['feedback_category'];
type FeedbackPriority = Database['public']['Enums']['feedback_priority'];
type FeedbackStatus = Database['public']['Enums']['feedback_status'];

export interface FeedbackSubmission {
  id: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  submitter_id: string;
  assigned_to: string | null;
  attachment_url: string | null;
  attachment_filename: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
}

export function useFeedback() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: feedbackList = [], isLoading, error } = useQuery({
    queryKey: ['feedback-submissions'],
    queryFn: async (): Promise<FeedbackSubmission[]> => {
      const { data, error } = await supabase
        .from('feedback_submissions')
        .select(`
          id,
          title,
          description,
          category,
          priority,
          status,
          submitter_id,
          assigned_to,
          attachment_url,
          attachment_filename,
          internal_notes,
          created_at,
          updated_at,
          profiles (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as FeedbackSubmission[];
    },
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedback: {
      title: string;
      description: string;
      category: string;
      priority: string;
      submitter_id: string;
    }) => {
      const { error } = await supabase
        .from('feedback_submissions')
        .insert({
          title: feedback.title,
          description: feedback.description,
          category: feedback.category as FeedbackCategory,
          priority: feedback.priority as FeedbackPriority,
          submitter_id: feedback.submitter_id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-submissions'] });
      toast({
        title: 'Success',
        description: 'Feedback submitted successfully!',
      });
    },
    onError: (error) => {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('feedback_submissions')
        .update({ 
          status: status as FeedbackStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-submissions'] });
      toast({
        title: 'Success',
        description: 'Status updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    },
  });

  const updatePriorityMutation = useMutation({
    mutationFn: async ({ id, priority }: { id: string; priority: string }) => {
      const { error } = await supabase
        .from('feedback_submissions')
        .update({ 
          priority: priority as FeedbackPriority, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-submissions'] });
      toast({
        title: 'Success',
        description: 'Priority updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating priority:', error);
      toast({
        title: 'Error',
        description: 'Failed to update priority',
        variant: 'destructive',
      });
    },
  });

  const addInternalNoteMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('feedback_submissions')
        .update({ internal_notes: notes, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-submissions'] });
      toast({
        title: 'Success',
        description: 'Internal notes updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating internal notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to update internal notes',
        variant: 'destructive',
      });
    },
  });

  return {
    feedbackList,
    isLoading,
    error,
    submitFeedback: submitFeedbackMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    updatePriority: updatePriorityMutation.mutate,
    addInternalNote: addInternalNoteMutation.mutate,
    isSubmitting: submitFeedbackMutation.isPending,
    isUpdating: updateStatusMutation.isPending || updatePriorityMutation.isPending || addInternalNoteMutation.isPending,
  };
}
