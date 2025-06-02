
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
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
  const getCategoryDescription = (cat: string) => {
    switch (cat) {
      case 'General':
        return 'Blog posts, articles, summaries, and general content variations';
      case 'Social':
        return 'Social media posts, captions, tweets, and platform-specific content';
      case 'Ads':
        return 'Advertisement copy, marketing materials, and promotional content';
      default:
        return 'Content derivatives and variations';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'General':
        return '📝';
      case 'Social':
        return '📱';
      case 'Ads':
        return '📢';
      default:
        return '✨';
    }
  };

  return (
    <TabsContent value={category} className="mt-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getCategoryIcon(category)}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {category} Content
              </h3>
              <p className="text-sm text-gray-600">
                {getCategoryDescription(category)}
              </p>
            </div>
          </div>
          <Button 
            onClick={() => onGenerate(category)}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate {category}
          </Button>
        </div>
        
        {derivatives.length > 0 && (
          <div className="flex items-center gap-4 text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-lg border">
            <div className="flex items-center gap-1">
              <span className="font-medium">{derivatives.length}</span>
              <span>derivative{derivatives.length === 1 ? '' : 's'}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{derivatives.filter(d => d.status === 'approved').length}</span>
              <span>approved</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{derivatives.filter(d => d.status === 'published').length}</span>
              <span>published</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{derivatives.filter(d => d.status === 'discarded').length}</span>
              <span>discarded</span>
            </div>
          </div>
        )}
      </div>
      
      {derivatives.length === 0 ? (
        <EmptyDerivativesState category={category} onGenerate={onGenerate} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {derivatives.map(derivative => (
            <DerivativeCard key={derivative.id} derivative={derivative} />
          ))}
        </div>
      )}
    </TabsContent>
  );
};

export default DerivativeTabContent;
