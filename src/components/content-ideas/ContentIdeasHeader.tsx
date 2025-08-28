
import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AutoGenerationControls from '@/components/AutoGenerationControls';
import { useTimeoutCheck } from '@/hooks/useTimeoutCheck';
import ContentIdeasViewToggle from './ContentIdeasViewToggle';

interface ContentIdeasHeaderProps {
  onNewIdea: () => void;
  viewMode: 'card' | 'table';
  onViewModeChange: (mode: 'card' | 'table') => void;
}

export default function ContentIdeasHeader({ 
  onNewIdea, 
  viewMode, 
  onViewModeChange 
}: ContentIdeasHeaderProps) {
  const { forceTimeoutCheck, isCheckingTimeouts } = useTimeoutCheck();

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Ideas</h1>
        <p className="text-gray-600">Generate and manage content ideas for your marketing campaigns</p>
      </div>
      <div className="flex gap-3">
        <AutoGenerationControls />
        <ContentIdeasViewToggle 
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
        />
        <Button
          onClick={() => forceTimeoutCheck()}
          disabled={isCheckingTimeouts}
          variant="outline"
          className="text-gray-700 border-gray-300 hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isCheckingTimeouts ? 'animate-spin' : ''}`} />
          {isCheckingTimeouts ? 'Checking...' : 'Check Timeouts'}
        </Button>
        <Button
          onClick={onNewIdea}
          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Idea
        </Button>
      </div>
    </div>
  );
}
