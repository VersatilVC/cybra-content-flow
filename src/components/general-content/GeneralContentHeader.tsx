
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface GeneralContentHeaderProps {
  onCreateContent: () => void;
}

const GeneralContentHeader: React.FC<GeneralContentHeaderProps> = ({ onCreateContent }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">General Content</h1>
        <p className="text-gray-600">Create standalone content pieces directly</p>
      </div>
      <Button onClick={onCreateContent} className="bg-purple-600 hover:bg-purple-700">
        <Plus className="w-4 h-4 mr-2" />
        Create Content
      </Button>
    </div>
  );
};

export default GeneralContentHeader;
