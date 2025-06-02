
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wand2, 
  FileText,
  Image,
  Video
} from 'lucide-react';
import { useContentDerivativesSection } from '@/hooks/useContentDerivativesSection';
import DerivativeGenerationModal from './DerivativeGenerationModal';
import DerivativeTabContent from './DerivativeTabContent';

interface ContentDerivativesSectionProps {
  contentItemId: string;
}

const ContentDerivativesSection: React.FC<ContentDerivativesSectionProps> = ({ contentItemId }) => {
  const {
    isLoading,
    activeTab,
    setActiveTab,
    isGenerationModalOpen,
    setIsGenerationModalOpen,
    generationCategory,
    categorizedDerivatives,
    handleGenerate
  } = useContentDerivativesSection(contentItemId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Content Derivatives</h3>
        </div>
        <div className="text-center py-8 text-gray-500">Loading derivatives...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Content Derivatives</h3>
        <div className="flex gap-2">
          <Button 
            onClick={() => handleGenerate('General')}
            variant="outline" 
            size="sm"
            className="text-purple-600 border-purple-300 hover:bg-purple-50"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Generate
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="General" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            General ({categorizedDerivatives.General.length})
          </TabsTrigger>
          <TabsTrigger value="Social" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Social ({categorizedDerivatives.Social.length})
          </TabsTrigger>
          <TabsTrigger value="Ads" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Ads ({categorizedDerivatives.Ads.length})
          </TabsTrigger>
        </TabsList>

        {(['General', 'Social', 'Ads'] as const).map((category) => (
          <DerivativeTabContent
            key={category}
            category={category}
            derivatives={categorizedDerivatives[category]}
            onGenerate={handleGenerate}
          />
        ))}
      </Tabs>

      <DerivativeGenerationModal
        isOpen={isGenerationModalOpen}
        onClose={() => setIsGenerationModalOpen(false)}
        contentItemId={contentItemId}
        category={generationCategory}
      />
    </div>
  );
};

export default ContentDerivativesSection;
