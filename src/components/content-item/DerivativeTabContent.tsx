
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import DerivativeCard from './DerivativeCard';
import EmptyDerivativesState from './EmptyDerivativesState';

interface DerivativeTabContentProps {
  category: 'General' | 'Social' | 'Ads';
  derivatives: ContentDerivative[];
  onGenerate: (category: 'General' | 'Social' | 'Ads') => void;
}

const DerivativeTabContent: React.FC<DerivativeTabContentProps> = ({
  category,
  derivatives,
  onGenerate
}) => {
  return (
    <TabsContent value={category} className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600">
          {category} content derivatives and variations
        </p>
        <Button 
          onClick={() => onGenerate(category)}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate {category}
        </Button>
      </div>
      
      {derivatives.length === 0 ? (
        <EmptyDerivativesState category={category} onGenerate={onGenerate} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {derivatives.map(derivative => (
            <DerivativeCard key={derivative.id} derivative={derivative} />
          ))}
        </div>
      )}
    </TabsContent>
  );
};

export default DerivativeTabContent;
