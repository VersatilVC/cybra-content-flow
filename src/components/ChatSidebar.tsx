
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatSessions } from '@/hooks/useChatSessions';
import { MessageSquare, Plus, Trash2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EditableChatTitle } from '@/components/chat/EditableChatTitle';
import { DeleteChatConfirmDialog } from '@/components/chat/DeleteChatConfirmDialog';

interface ChatSidebarProps {
  selectedSessionId: string | null;
  onSessionSelect: (sessionId: string | null) => void;
  onNewChat: () => void;
}

export function ChatSidebar({ selectedSessionId, onSessionSelect, onNewChat }: ChatSidebarProps) {
  const { sessions, isLoading, createSessionAsync, updateSession, deleteSession, isCreating, isUpdating, isDeleting } = useChatSessions();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; title: string } | null>(null);

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewChat = async () => {
    try {
      const newSession = await createSessionAsync('New Chat');
      onSessionSelect(newSession.id);
    } catch (error) {
      console.error('Failed to create new session:', error);
    }
  };

  const handleStartFirstChat = () => {
    onSessionSelect(null);
    onNewChat();
  };

  const handleDeleteClick = (sessionId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionToDelete({ id: sessionId, title });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (sessionToDelete) {
      deleteSession(sessionToDelete.id);
      if (selectedSessionId === sessionToDelete.id) {
        onSessionSelect(null);
      }
    }
    setDeleteConfirmOpen(false);
    setSessionToDelete(null);
  };

  const handleUpdateTitle = (sessionId: string, newTitle: string) => {
    updateSession({ sessionId, title: newTitle });
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
          disabled={isCreating}
        >
          <Plus className="w-4 h-4 mr-2" />
          {isCreating ? 'Creating...' : 'New Chat'}
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
          {isLoading ? (
            <div className="text-center text-gray-500 py-4">Loading...</div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              {searchTerm ? 'No matching conversations' : 'No conversations yet'}
              {!searchTerm && (
                <Button 
                  variant="link" 
                  onClick={handleStartFirstChat}
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
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="font-medium text-gray-900">
                      <EditableChatTitle
                        title={session.title}
                        onSave={(newTitle) => handleUpdateTitle(session.id, newTitle)}
                        isUpdating={isUpdating}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(session.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleDeleteClick(session.id, session.title, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-red-500 hover:text-red-600"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <DeleteChatConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        chatTitle={sessionToDelete?.title || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
}
