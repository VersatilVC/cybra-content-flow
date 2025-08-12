import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, Plus, Zap } from 'lucide-react';
import { GeneralContentItem } from '@/types/generalContent';
import { useGeneralContentGeneration } from '@/hooks/useGeneralContentGeneration';
import GeneralContentTypeGrid from './GeneralContentTypeGrid';
import GeneralContentSelectedSummary from './GeneralContentSelectedSummary';

interface GeneralContentGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: 'General' | 'Social' | 'Ads';
  sourceItem?: GeneralContentItem;
}

const GeneralContentGenerationModal: React.FC<GeneralContentGenerationModalProps> = ({
  isOpen,
  onClose,
  category,
  sourceItem
}) => {
  const {
    selectedTypes,
    isGenerating,
    handleTypeToggle,
    handleGenerate,
    resetSelection
  } = useGeneralContentGeneration();

  const handleClose = () => {
    resetSelection();
    onClose();
  };

  const handleGenerateClick = async () => {
    await handleGenerate(category, sourceItem);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Generate {category} Content
            <Zap className="w-4 h-4 text-purple-600" />
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          <p className="text-gray-600">
            {sourceItem 
              ? `Generate new ${category.toLowerCase()} content variations based on "${sourceItem.title}".`
              : `Create new ${category.toLowerCase()} content using AI generation.`
            }
          </p>
          
          <GeneralContentTypeGrid
            category={category}
            selectedTypes={selectedTypes}
            onTypeToggle={handleTypeToggle}
          />
          
          <GeneralContentSelectedSummary
            selectedTypes={selectedTypes}
            category={category}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerateClick}
            disabled={selectedTypes.length === 0 || isGenerating}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Generate {selectedTypes.length} Item{selectedTypes.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GeneralContentGenerationModal;