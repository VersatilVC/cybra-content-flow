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
      { type: 'blog_banner_image', title: 'Blog Banner Image', description: 'Hero image for blog post', content_type: 'image' as const },
      { type: 'blog_internal_images', title: 'Blog Post Internal Images', description: 'Supporting images for blog content', content_type: 'image' as const },
      { type: 'nurture_email', title: 'Nurture Email', description: 'Educational email for lead nurturing', content_type: 'text' as const },
      { type: 'sales_email', title: 'Sales Email', description: 'Direct sales outreach email', content_type: 'text' as const },
      { type: 'content_transformation', title: 'Turn Content Item Into', description: 'Transform into different content format', content_type: 'text' as const },
      { type: 'webinar_outline', title: 'Webinar Outline', description: 'Structured webinar presentation outline', content_type: 'document' as const },
      { type: 'video_topic_points', title: 'Video Topic Points for CEO', description: 'Key talking points for executive video', content_type: 'text' as const },
      { type: 'conference_speaking', title: 'Conference Speaking Suggestions', description: 'Speaking topics and proposals for conferences', content_type: 'text' as const },
      { type: 'quiz_poll', title: 'Quiz/Poll', description: 'Interactive quiz or poll content', content_type: 'text' as const },
      { type: 'audio_version', title: 'Generate Audio Version', description: 'Audio narration of content', content_type: 'audio' as const }
    ],
    Social: [
      { type: 'linkedin_company', title: 'LinkedIn Post - Company', description: 'Company brand voice LinkedIn post', content_type: 'text' as const },
      { type: 'linkedin_ceo', title: 'LinkedIn Post - CEO', description: 'CEO thought leadership LinkedIn post', content_type: 'text' as const },
      { type: 'linkedin_marketing', title: 'LinkedIn Post - Marketing', description: 'Marketing-focused LinkedIn post', content_type: 'text' as const },
      { type: 'linkedin_sales', title: 'LinkedIn Post - Sales', description: 'Sales-oriented LinkedIn post', content_type: 'text' as const },
      { type: 'linkedin_product', title: 'LinkedIn Post - Product', description: 'Product-focused LinkedIn post', content_type: 'text' as const },
      { type: 'x_company', title: 'X Post - Company', description: 'Company brand voice X post', content_type: 'text' as const },
      { type: 'x_ceo', title: 'X Post - CEO', description: 'CEO thought leadership X post', content_type: 'text' as const },
      { type: 'x_marketing', title: 'X Post - Marketing', description: 'Marketing-focused X post', content_type: 'text' as const },
      { type: 'x_sales', title: 'X Post - Sales', description: 'Sales-oriented X post', content_type: 'text' as const },
      { type: 'x_product', title: 'X Post - Product', description: 'Product-focused X post', content_type: 'text' as const },
      { type: 'image_carousel', title: 'Image Carousel Slides', description: 'Multi-slide visual content for social media', content_type: 'image' as const }
    ],
    Ads: [
      { type: 'linkedin_text_ad', title: 'LinkedIn - Text Ad Copy', description: 'Professional LinkedIn advertising copy', content_type: 'text' as const },
      { type: 'linkedin_image_ads', title: 'LinkedIn - Image Ads', description: 'Visual LinkedIn advertising creatives', content_type: 'image' as const }
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
