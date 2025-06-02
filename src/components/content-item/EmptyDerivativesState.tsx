
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Plus } from 'lucide-react';

interface EmptyDerivativesStateProps {
  category: 'General' | 'Social' | 'Ads';
  onGenerate: (category: 'General' | 'Social' | 'Ads') => void;
}

const EmptyDerivativesState: React.FC<EmptyDerivativesStateProps> = ({
  category,
  onGenerate
}) => {
  return (
    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
      <Wand2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h4 className="text-lg font-medium text-gray-900 mb-2">
        No {category} derivatives yet
      </h4>
      <p className="text-gray-600 mb-4">
        Generate {category.toLowerCase()} content variations from your main content.
      </p>
      <Button 
        onClick={() => onGenerate(category)}
        className="bg-purple-600 hover:bg-purple-700 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Generate {category} Derivatives
      </Button>
    </div>
  );
};

export default EmptyDerivativesState;
