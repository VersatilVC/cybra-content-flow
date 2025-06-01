
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wand2, Loader2, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useContentDerivatives } from '@/hooks/useContentDerivatives';

interface DerivativeGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentItemId: string;
  category: 'General' | 'Social' | 'Ads';
}

const DerivativeGenerationModal: React.FC<DerivativeGenerationModalProps> = ({
  isOpen,
  onClose,
  contentItemId,
  category
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createDerivative, isCreating } = useContentDerivatives(contentItemId);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const derivativeTypes = {
    General: [
      { type: 'excerpt_200', title: '200-Word Excerpt', description: 'Short summary for previews' },
      { type: 'newsletter_paragraph', title: 'Newsletter Paragraph', description: 'Email newsletter section' },
      { type: 'executive_summary', title: 'Executive Summary', description: 'High-level overview for executives' },
      { type: 'key_takeaways', title: 'Key Takeaways', description: 'Bullet points of main insights' }
    ],
    Social: [
      { type: 'linkedin_post_short', title: 'LinkedIn Post (Short)', description: '150-200 characters' },
      { type: 'linkedin_post_long', title: 'LinkedIn Post (Long)', description: '500+ characters with hashtags' },
      { type: 'twitter_thread', title: 'Twitter Thread', description: 'Multi-tweet thread' },
      { type: 'instagram_caption', title: 'Instagram Caption', description: 'Engaging caption with hashtags' },
      { type: 'facebook_post', title: 'Facebook Post', description: 'Community-focused post' }
    ],
    Ads: [
      { type: 'linkedin_ad_text', title: 'LinkedIn Ad Copy', description: 'Professional ad copy' },
      { type: 'google_ad_headline', title: 'Google Ad Headlines', description: 'Multiple headline variations' },
      { type: 'facebook_ad_copy', title: 'Facebook Ad Copy', description: 'Engaging ad content' },
      { type: 'banner_ad_text', title: 'Banner Ad Text', description: 'Short, punchy ad copy' }
    ]
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleGenerate = async () => {
    if (selectedTypes.length === 0) {
      toast({
        title: 'No types selected',
        description: 'Please select at least one derivative type to generate.',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to generate derivatives.',
        variant: 'destructive',
      });
      return;
    }

    // Generate derivatives for each selected type
    for (const type of selectedTypes) {
      const typeInfo = derivativeTypes[category].find(t => t.type === type);
      if (!typeInfo) continue;

      try {
        // This would integrate with OpenAI to generate actual content
        // For now, we'll create placeholder content
        const mockContent = `Generated ${typeInfo.title.toLowerCase()} content for content item ${contentItemId}. This would be AI-generated content based on the original content.`;
        
        await createDerivative({
          content_item_id: contentItemId,
          user_id: user.id,
          title: typeInfo.title,
          content: mockContent,
          derivative_type: type,
          category: category,
          word_count: mockContent.split(' ').length,
          metadata: {
            generated_at: new Date().toISOString(),
            generator: 'ai',
            source_category: category
          }
        });
      } catch (error) {
        console.error('Error creating derivative:', error);
      }
    }

    setSelectedTypes([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Generate {category} Derivatives
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          <p className="text-gray-600">
            Select the types of {category.toLowerCase()} content you'd like to generate from your main content item.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {derivativeTypes[category].map((typeInfo) => (
              <Card 
                key={typeInfo.type}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTypes.includes(typeInfo.type) 
                    ? 'ring-2 ring-purple-500 bg-purple-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleTypeToggle(typeInfo.type)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {typeInfo.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {typeInfo.description}
                      </p>
                    </div>
                    {selectedTypes.includes(typeInfo.type) && (
                      <Badge className="ml-2 bg-purple-600 text-white">
                        Selected
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {selectedTypes.length > 0 && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">
                Selected for Generation ({selectedTypes.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedTypes.map(type => {
                  const typeInfo = derivativeTypes[category].find(t => t.type === type);
                  return (
                    <Badge key={type} variant="secondary">
                      {typeInfo?.title}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={selectedTypes.length === 0 || isCreating}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Generate {selectedTypes.length} Derivative{selectedTypes.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DerivativeGenerationModal;
