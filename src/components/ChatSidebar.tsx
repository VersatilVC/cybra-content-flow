
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatSessions } from '@/hooks/useChatSessions';
import { MessageSquare, Plus, Trash2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  selectedSessionId: string | null;
  onSessionSelect: (sessionId: string | null) => void;
  onNewChat: () => void;
}

export function ChatSidebar({ selectedSessionId, onSessionSelect, onNewChat }: ChatSidebarProps) {
  const { sessions, isLoading, createSession, deleteSession, isCreating } = useChatSessions();
  const [searchTerm, setSearchTerm] = useState('');
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [showNewSessionInput, setShowNewSessionInput] = useState(false);

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSession = () => {
    if (newSessionTitle.trim()) {
      createSession(newSessionTitle.trim());
      setNewSessionTitle('');
      setShowNewSessionInput(false);
    }
  };

  const handleNewChat = () => {
    onSessionSelect(null);
    onNewChat();
  };

  return (
    <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          <h2 className="font-semibold text-gray-900">Chat History</h2>
        </div>
        
        <Button 
          onClick={handleNewChat}
          className="w-full mb-3"
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {showNewSessionInput && (
            <div className="p-3 border border-purple-200 rounded-lg mb-2 bg-white">
              <Input
                placeholder="Enter chat title..."
                value={newSessionTitle}
                onChange={(e) => setNewSessionTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateSession();
                  if (e.key === 'Escape') setShowNewSessionInput(false);
                }}
                className="mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleCreateSession}
                  disabled={!newSessionTitle.trim() || isCreating}
                >
                  Create
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowNewSessionInput(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center text-gray-500 py-4">Loading...</div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              {searchTerm ? 'No matching conversations' : 'No conversations yet'}
              {!searchTerm && (
                <Button 
                  variant="link" 
                  onClick={() => setShowNewSessionInput(true)}
                  className="text-purple-600 mt-2"
                >
                  Start your first chat
                </Button>
              )}
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "p-3 rounded-lg mb-2 cursor-pointer transition-colors group hover:bg-white",
                  selectedSessionId === session.id ? "bg-purple-100 border border-purple-200" : "bg-gray-100"
                )}
                onClick={() => onSessionSelect(session.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {session.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(session.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 h-auto"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
