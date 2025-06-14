
import React from 'react';
import { PenTool, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyGeneralContentStateProps {
  onCreateContent: () => void;
}

const EmptyGeneralContentState: React.FC<EmptyGeneralContentStateProps> = ({
  onCreateContent
}) => {
  return (
    <div className="text-center py-12">
      <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No general content found</h3>
      <p className="text-gray-600 mb-6">
        Start creating standalone content pieces directly
      </p>
      <Button onClick={onCreateContent} className="bg-purple-600 hover:bg-purple-700">
        <Plus className="w-4 h-4 mr-2" />
        Create Your First Content
      </Button>
    </div>
  );
};

export default EmptyGeneralContentState;
