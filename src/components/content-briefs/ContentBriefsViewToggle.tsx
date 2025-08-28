import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid3X3, List } from 'lucide-react';

interface ContentBriefsViewToggleProps {
  viewMode: 'card' | 'table';
  onViewModeChange: (mode: 'card' | 'table') => void;
}

export default function ContentBriefsViewToggle({ 
  viewMode, 
  onViewModeChange 
}: ContentBriefsViewToggleProps) {
  return (
    <div className="flex items-center border border-border rounded-lg p-1">
      <Button
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('table')}
        className="h-8 px-2"
      >
        <List className="w-4 h-4" />
      </Button>
      <Button
        variant={viewMode === 'card' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('card')}
        className="h-8 px-2"
      >
        <Grid3X3 className="w-4 h-4" />
      </Button>
    </div>
  );
}