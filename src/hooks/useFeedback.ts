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
      console.log('Fetching feedback submissions...');
      
      // First, fetch all feedback submissions
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback_submissions')
        .select('id,title,description,category,priority,status,submitter_id,assigned_to,attachment_url,attachment_filename,internal_notes,created_at,updated_at')
        .order('created_at', { ascending: false });

      if (feedbackError) {
        console.error('Error fetching feedback:', feedbackError);
        throw feedbackError;
      }

      console.log('Raw feedback data:', feedbackData);

      if (!feedbackData || feedbackData.length === 0) {
        return [];
      }

      // Get unique submitter IDs
      const submitterIds = [...new Set(feedbackData.map(item => item.submitter_id))];
      
      // Fetch profiles for all submitters
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', submitterIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without profiles data rather than failing completely
      }

      console.log('Profiles data:', profilesData);

      // Combine feedback with profile data
      const transformedData = feedbackData.map(feedback => ({
        ...feedback,
        profiles: profilesData?.find(profile => profile.id === feedback.submitter_id) || null
      }));
      
      console.log('Transformed feedback data:', transformedData);
      return transformedData as FeedbackSubmission[];
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

  const editFeedbackMutation = useMutation({
    mutationFn: async ({ id, title, description, category }: { 
      id: string; 
      title: string; 
      description: string; 
      category: string; 
    }) => {
      const { error } = await supabase
        .from('feedback_submissions')
        .update({ 
          title,
          description,
          category: category as FeedbackCategory,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-submissions'] });
      toast({
        title: 'Success',
        description: 'Feedback updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to update feedback',
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

  const deleteFeedbackMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('feedback_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-submissions'] });
      toast({
        title: 'Success',
        description: 'Feedback submission deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Error deleting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete feedback submission',
        variant: 'destructive',
      });
    },
  });

  return {
    feedbackList,
    isLoading,
    error,
    submitFeedback: submitFeedbackMutation.mutate,
    editFeedback: editFeedbackMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    updatePriority: updatePriorityMutation.mutate,
    addInternalNote: addInternalNoteMutation.mutate,
    deleteFeedback: deleteFeedbackMutation.mutate,
    isSubmitting: submitFeedbackMutation.isPending,
    isUpdating: updateStatusMutation.isPending || updatePriorityMutation.isPending || addInternalNoteMutation.isPending || deleteFeedbackMutation.isPending || editFeedbackMutation.isPending,
  };
}

export function useUnreadFeedbackCount() {
  return useQuery({
    queryKey: ['active-feedback-count'],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase
        .from('feedback_submissions')
        .select('id', { count: 'exact' })
        .not('status', 'in', '(resolved,closed)');

      if (error) {
        console.error('Error fetching active feedback count:', error);
        return 0;
      }

      return data?.length || 0;
    },
  });
}
