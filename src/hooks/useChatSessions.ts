
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuthContext } from '@/contexts/OptimizedAuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export function useChatSessions() {
  const { user } = useOptimizedAuthContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['chat-sessions', user?.id],
    queryFn: async (): Promise<ChatSession[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (title: string): Promise<ChatSession> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          title,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      // Return the new session for immediate use
      return newSession;
    },
    onError: (error) => {
      toast({
        title: 'Failed to create chat session',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, title }: { sessionId: string; title: string }) => {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update chat session',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete chat session',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  // Helper function to create session and return promise
  const createSessionAsync = async (title: string): Promise<ChatSession> => {
    return createSessionMutation.mutateAsync(title);
  };

  return {
    sessions,
    isLoading,
    createSession: createSessionMutation.mutate,
    createSessionAsync,
    updateSession: updateSessionMutation.mutate,
    deleteSession: deleteSessionMutation.mutate,
    isCreating: createSessionMutation.isPending,
    isUpdating: updateSessionMutation.isPending,
    isDeleting: deleteSessionMutation.isPending,
  };
}
