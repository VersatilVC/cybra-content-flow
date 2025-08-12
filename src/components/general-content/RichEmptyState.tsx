import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface RichEmptyStateProps {
  category: 'General' | 'Social' | 'Ads';
  onCreateContent: () => void;
}

const RichEmptyState: React.FC<RichEmptyStateProps> = ({
  category,
  onCreateContent
}) => {
  const getEmptyStateContent = (cat: string) => {
    switch (cat) {
      case 'General':
        return {
          emoji: '📝',
          title: 'No general content yet',
          description: 'Create blog posts, articles, summaries, and other general content for your audience.',
          examples: ['Blog posts', 'Article summaries', 'FAQ sections', 'How-to guides']
        };
      case 'Social':
        return {
          emoji: '📱',
          title: 'No social content yet',
          description: 'Generate engaging social media posts, captions, and platform-specific content.',
          examples: ['Twitter threads', 'Instagram captions', 'LinkedIn posts', 'Facebook updates']
        };
      case 'Ads':
        return {
          emoji: '📢',
          title: 'No ad content yet',
          description: 'Create compelling advertisement copy, marketing materials, and promotional content.',
          examples: ['Google Ads copy', 'Banner text', 'Email campaigns', 'Product descriptions']
        };
      default:
        return {
          emoji: '✨',
          title: 'No content yet',
          description: 'Create content to get started.',
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
            <p className="text-sm font-medium text-gray-700 mb-2">You can create:</p>
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
          onClick={onCreateContent}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Create {category} Content
        </Button>
        
        <p className="text-xs text-gray-500 mt-4">
          Choose from various content types and input methods
        </p>
      </div>
    </div>
  );
};

export default RichEmptyState;