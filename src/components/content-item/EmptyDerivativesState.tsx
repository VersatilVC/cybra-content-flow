
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wand2, Sparkles } from 'lucide-react';

interface EmptyDerivativesStateProps {
  category: 'General' | 'Social' | 'Ads';
  onGenerate: (category: 'General' | 'Social' | 'Ads') => void;
}

const EmptyDerivativesState: React.FC<EmptyDerivativesStateProps> = ({
  category,
  onGenerate
}) => {
  const getEmptyStateContent = (cat: string) => {
    switch (cat) {
      case 'General':
        return {
          emoji: '📝',
          title: 'No general content yet',
          description: 'Create blog posts, articles, summaries, and other general content variations from your original content.',
          examples: ['Blog posts', 'Article summaries', 'FAQ sections', 'How-to guides']
        };
      case 'Social':
        return {
          emoji: '📱',
          title: 'No social content yet',
          description: 'Generate engaging social media posts, captions, and platform-specific content for your audience.',
          examples: ['Twitter threads', 'Instagram captions', 'LinkedIn posts', 'Facebook updates']
        };
      case 'Ads':
        return {
          emoji: '📢',
          title: 'No ad content yet',
          description: 'Create compelling advertisement copy, marketing materials, and promotional content to drive engagement.',
          examples: ['Google Ads copy', 'Banner text', 'Email campaigns', 'Product descriptions']
        };
      default:
        return {
          emoji: '✨',
          title: 'No content yet',
          description: 'Generate content derivatives to expand your reach.',
          examples: []
        };
    }
  };

  const content = getEmptyStateContent(category);

  return (
    <div className="text-center py-12 px-6">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-4">{content.emoji}</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {content.title}
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          {content.description}
        </p>
        
        {content.examples.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">You can generate:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {content.examples.map((example, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full border border-purple-200"
                >
                  {example}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <Button 
          onClick={() => onGenerate(category)}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Generate {category} Content
        </Button>
        
        <p className="text-xs text-gray-500 mt-4">
          AI will analyze your content and create relevant derivatives
        </p>
      </div>
    </div>
  );
};

export default EmptyDerivativesState;
