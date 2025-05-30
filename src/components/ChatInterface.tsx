
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useChatSessions } from '@/hooks/useChatSessions';
import { Send, Bot, User, MessageSquare } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ChatInterfaceProps {
  sessionId: string | null;
  onSessionCreated: (sessionId: string) => void;
}

export function ChatInterface({ sessionId, onSessionCreated }: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const { messages, isLoading, sendMessage, isSending } = useChatMessages(sessionId);
  const { createSession, isCreating } = useChatSessions();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageContent = inputMessage.trim();
    setInputMessage('');

    if (!sessionId) {
      // Create new session first
      const title = messageContent.length > 50 
        ? messageContent.substring(0, 50) + '...' 
        : messageContent;
      
      try {
        createSession(title);
        // Note: We'll need to handle the session creation and message sending in sequence
        // For now, we'll show an error asking user to create a session first
        return;
      } catch (error) {
        console.error('Failed to create session:', error);
        return;
      }
    }

    sendMessage({ content: messageContent, sessionId });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Start a New Conversation</h3>
          <p className="text-gray-600 mb-6 max-w-md">
            Select an existing conversation from the sidebar or start a new chat to begin talking with the AI assistant.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
        <p className="text-gray-600">Chat with your AI assistant about anything</p>
      </div>

      <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p>Start the conversation by sending a message below.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-purple-600" />
                  </div>
                )}
                <div className={`max-w-2xl ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`p-4 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-purple-600 text-white ml-auto' 
                      : 'bg-gray-100'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="text-xs opacity-75 mt-2">
                        <strong>Sources:</strong> {message.sources.join(', ')}
                      </div>
                    )}
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {isSending && (
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-purple-600" />
              </div>
              <div className="max-w-2xl">
                <div className="p-4 rounded-lg bg-gray-100">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Thinking...
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isSending}
              className="flex items-center gap-2"
            >
              {isSending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
