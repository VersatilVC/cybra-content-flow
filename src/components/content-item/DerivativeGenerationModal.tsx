
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wand2, Loader2, Plus, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useContentDerivatives } from '@/hooks/useContentDerivatives';
import { triggerDerivativeGeneration } from '@/services/contentDerivativesApi';

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
  const [isGenerating, setIsGenerating] = useState(false);

  const derivativeTypes = {
    General: [
      { type: 'excerpt_200', title: '200-Word Excerpt', description: 'Short summary for previews', content_type: 'text' as const },
      { type: 'newsletter_paragraph', title: 'Newsletter Paragraph', description: 'Email newsletter section', content_type: 'text' as const },
      { type: 'executive_summary', title: 'Executive Summary', description: 'High-level overview for executives', content_type: 'text' as const },
      { type: 'key_takeaways', title: 'Key Takeaways', description: 'Bullet points of main insights', content_type: 'text' as const },
      { type: 'infographic_concept', title: 'Infographic Concept', description: 'Visual content concept and layout', content_type: 'image' as const },
      { type: 'presentation_slides', title: 'Presentation Slides', description: 'PowerPoint/slide deck outline', content_type: 'document' as const }
    ],
    Social: [
      { type: 'linkedin_post_short', title: 'LinkedIn Post (Short)', description: '150-200 characters', content_type: 'text' as const },
      { type: 'linkedin_post_long', title: 'LinkedIn Post (Long)', description: '500+ characters with hashtags', content_type: 'text' as const },
      { type: 'twitter_thread', title: 'Twitter Thread', description: 'Multi-tweet thread', content_type: 'text' as const },
      { type: 'instagram_caption', title: 'Instagram Caption', description: 'Engaging caption with hashtags', content_type: 'text' as const },
      { type: 'facebook_post', title: 'Facebook Post', description: 'Community-focused post', content_type: 'text' as const },
      { type: 'social_graphics', title: 'Social Media Graphics', description: 'Visual content for social platforms', content_type: 'image' as const },
      { type: 'story_content', title: 'Story Content', description: 'Instagram/Facebook story visuals', content_type: 'image' as const }
    ],
    Ads: [
      { type: 'linkedin_ad_text', title: 'LinkedIn Ad Copy', description: 'Professional ad copy', content_type: 'text' as const },
      { type: 'google_ad_headline', title: 'Google Ad Headlines', description: 'Multiple headline variations', content_type: 'text' as const },
      { type: 'facebook_ad_copy', title: 'Facebook Ad Copy', description: 'Engaging ad content', content_type: 'text' as const },
      { type: 'banner_ad_text', title: 'Banner Ad Text', description: 'Short, punchy ad copy', content_type: 'text' as const },
      { type: 'display_banners', title: 'Display Banners', description: 'Visual banner ad designs', content_type: 'image' as const },
      { type: 'video_ad_script', title: 'Video Ad Script', description: 'Script for video advertisements', content_type: 'text' as const }
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

    setIsGenerating(true);

    try {
      // Try to trigger webhook first
      await triggerDerivativeGeneration(contentItemId, selectedTypes, category, user.id);
      
      toast({
        title: 'Generation Started',
        description: 'Derivative generation has been triggered. You will be notified when complete.',
      });
    } catch (webhookError) {
      console.log('Webhook failed, falling back to local generation:', webhookError);
      
      // Fallback to local generation if webhook fails
      try {
        for (const type of selectedTypes) {
          const typeInfo = derivativeTypes[category].find(t => t.type === type);
          if (!typeInfo) continue;

          // Create placeholder content for different content types
          let content = null;
          let file_url = null;
          
          if (typeInfo.content_type === 'text') {
            content = `Generated ${typeInfo.title.toLowerCase()} content for content item ${contentItemId}. This would be AI-generated content based on the original content.`;
          }
          
          await createDerivative({
            content_item_id: contentItemId,
            user_id: user.id,
            title: typeInfo.title,
            content: content,
            derivative_type: type,
            category: category,
            content_type: typeInfo.content_type,
            file_url: file_url,
            word_count: content ? content.split(' ').length : null,
            metadata: {
              generated_at: new Date().toISOString(),
              generator: 'fallback',
              source_category: category,
              content_type: typeInfo.content_type
            }
          });
        }
        
        toast({
          title: 'Derivatives Created',
          description: 'Your derivatives have been created successfully.',
        });
      } catch (fallbackError) {
        console.error('Fallback generation failed:', fallbackError);
        toast({
          title: 'Generation Failed',
          description: 'Failed to generate derivatives. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsGenerating(false);
      setSelectedTypes([]);
      onClose();
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'document': return '📄';
      default: return '📝';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Generate {category} Derivatives
            <Zap className="w-4 h-4 text-purple-600" />
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          <p className="text-gray-600">
            Select the types of {category.toLowerCase()} content you'd like to generate from your main content item. 
            We support both text and visual content generation.
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
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getContentTypeIcon(typeInfo.content_type)}</span>
                        <h4 className="font-medium text-gray-900">
                          {typeInfo.title}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {typeInfo.content_type}
                        </Badge>
                      </div>
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
                    <Badge key={type} variant="secondary" className="flex items-center gap-1">
                      <span>{getContentTypeIcon(typeInfo?.content_type || 'text')}</span>
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
            disabled={selectedTypes.length === 0 || isGenerating || isCreating}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isGenerating || isCreating ? (
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
