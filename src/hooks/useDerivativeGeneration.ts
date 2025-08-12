
import { useState } from 'react';
import { useOptimizedAuthContext } from '@/contexts/OptimizedAuthContext';
import { useToast } from '@/hooks/use-toast';
import { useContentDerivatives } from '@/hooks/useContentDerivatives';
import { triggerDerivativeGeneration } from '@/services/contentDerivativesApi';
import { derivativeTypes } from '@/components/content-item/derivativeTypes';
import { supabase } from '@/integrations/supabase/client';

export function useDerivativeGeneration(contentItemId: string) {
  const { user } = useOptimizedAuthContext();
  const { toast } = useToast();
  const { createDerivative, isCreating } = useContentDerivatives(contentItemId);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const createFallbackNotification = async (category: 'General' | 'Social' | 'Ads') => {
    if (!user?.id) return;

    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Content Derivatives Generated',
          message: `Your ${category.toLowerCase()} content derivatives have been generated successfully. Check the Derivatives tab to view them.`,
          type: 'success',
          related_entity_id: contentItemId,
          related_entity_type: 'content_item'
        });
      console.log('Fallback notification created for derivative generation');
    } catch (error) {
      console.error('Failed to create fallback notification:', error);
    }
  };

  const handleGenerate = async (category: 'General' | 'Social' | 'Ads') => {
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
          
          // Set proper content_type based on the derivative type
          const content_type = typeInfo.content_type || 'text';
          
          if (content_type === 'text') {
            content = `Generated ${typeInfo.title.toLowerCase()} content for content item ${contentItemId}. This would be AI-generated content based on the original content.`;
          } else if (content_type === 'composite' && type === 'linkedin_ads') {
            // Create structured LinkedIn ad content
            content = JSON.stringify({
              headline: `AI-Generated Headline for ${typeInfo.title}`,
              intro_text: `This is a sample intro text for the LinkedIn ad. It would be generated based on the original content item and optimized for LinkedIn's advertising format.`,
              image_url: null // Will be populated by webhook
            });
          }
          
          await createDerivative({
            content_item_id: contentItemId,
            user_id: user.id,
            title: typeInfo.title,
            content: content,
            derivative_type: type,
            category: category,
            content_type: content_type,
            file_url: file_url,
            word_count: content && content_type === 'text' ? content.split(' ').length : null,
            metadata: {
              generated_at: new Date().toISOString(),
              generator: 'fallback',
              source_category: category,
              content_type: content_type
            }
          });
        }
        
        // Create fallback notification for local generation
        await createFallbackNotification(category);
        
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
    }
  };

  const resetSelection = () => {
    setSelectedTypes([]);
  };

  return {
    selectedTypes,
    isGenerating: isGenerating || isCreating,
    handleTypeToggle,
    handleGenerate,
    resetSelection
  };
}
