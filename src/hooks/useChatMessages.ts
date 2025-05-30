
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  created_at: string;
}

export function useChatMessages(sessionId: string | null) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-messages', sessionId],
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Type assertion to ensure role matches our interface
      return (data || []).map(message => ({
        ...message,
        role: message.role as 'user' | 'assistant'
      }));
    },
    enabled: !!sessionId && !!user?.id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, sessionId: targetSessionId }: { content: string; sessionId: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Insert user message
      const { data: userMessage, error: userError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: targetSessionId,
          role: 'user',
          content,
        })
        .select()
        .single();

      if (userError) throw userError;

      // Get active AI chat webhook
      const { data: webhook } = await supabase
        .from('webhook_configurations')
        .select('*')
        .eq('webhook_type', 'ai_chat')
        .eq('is_active', true)
        .maybeSingle();

      if (!webhook) {
        throw new Error('No AI chat webhook configured. Please configure an AI chat webhook in the admin panel.');
      }

      // Trigger webhook with message data including session ID
      const webhookPayload = {
        message_id: userMessage.id,
        session_id: targetSessionId,
        user_message: content,
        user_id: user.id,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(webhook.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Insert AI response message
      const { error: assistantError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: targetSessionId,
          role: 'assistant',
          content: result.response || 'I apologize, but I encountered an error processing your message.',
          sources: result.sources || null,
        });

      if (assistantError) throw assistantError;

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to send message',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });

  return {
    messages,
    isLoading,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
  };
}
