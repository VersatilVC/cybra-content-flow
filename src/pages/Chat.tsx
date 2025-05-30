
import React, { useState } from 'react';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatInterface } from '@/components/ChatInterface';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Settings } from 'lucide-react';
import { AddWebhookModal } from '@/components/AddWebhookModal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Chat = () => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const { user } = useAuth();

  // Check if AI chat webhook is configured
  const { data: aiWebhook, isLoading: webhookLoading } = useQuery({
    queryKey: ['ai-chat-webhook'],
    queryFn: async () => {
      const { data } = await supabase
        .from('webhook_configurations')
        .select('*')
        .eq('webhook_type', 'ai_chat')
        .eq('is_active', true)
        .maybeSingle();
      
      return data;
    },
    enabled: !!user,
  });

  const handleNewChat = () => {
    setSelectedSessionId(null);
  };

  const handleSessionCreated = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  if (!webhookLoading && !aiWebhook) {
    return (
      <div className="flex flex-col h-screen">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">AI Chat</h1>
          <p className="text-gray-600">Chat with your AI assistant</p>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>AI Chat Webhook Required</strong><br />
                To use the AI chat feature, you need to configure an AI chat webhook that connects to your N8N workflow.
              </AlertDescription>
            </Alert>
            
            <Button onClick={() => setShowWebhookModal(true)} className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configure AI Chat Webhook
            </Button>
          </div>
        </div>

        <AddWebhookModal
          open={showWebhookModal}
          onOpenChange={setShowWebhookModal}
          preselectedType="ai_chat"
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <ChatSidebar
        selectedSessionId={selectedSessionId}
        onSessionSelect={setSelectedSessionId}
        onNewChat={handleNewChat}
      />
      <ChatInterface
        sessionId={selectedSessionId}
        onSessionCreated={handleSessionCreated}
      />
    </div>
  );
};

export default Chat;
