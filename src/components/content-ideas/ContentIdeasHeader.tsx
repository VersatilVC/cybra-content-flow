
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentIdeasHeaderProps {
  onNewIdea: () => void;
}

export default function ContentIdeasHeader({ onNewIdea }: ContentIdeasHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Ideas</h1>
        <p className="text-gray-600">Generate and manage content ideas for your marketing campaigns</p>
      </div>
      <div className="flex gap-3">
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
