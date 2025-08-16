import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Megaphone, Users, ArrowRight } from 'lucide-react';
import { usePRManagement } from '@/hooks/usePRManagement';

interface GeneratePRPitchesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentItem: {
    id: string;
    title: string;
    content_type: string;
    status: string;
  };
}

export const GeneratePRPitchesModal: React.FC<GeneratePRPitchesModalProps> = ({
  open,
  onOpenChange,
  contentItem
}) => {
  const { generatePRPitches, isGeneratingPitches } = usePRManagement();

  const handleGeneratePitches = () => {
    generatePRPitches({
      contentItemId: contentItem.id,
      title: contentItem.title
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            Generate PR Pitches
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium text-foreground mb-2">Content Item</h3>
            <p className="text-sm text-muted-foreground mb-1">{contentItem.title}</p>
            <p className="text-xs text-muted-foreground">
              Type: {contentItem.content_type} • Status: {contentItem.status}
            </p>
          </div>

          <div className="bg-background border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-2">What will happen:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• AI will analyze your content and identify relevant journalists</li>
                  <li>• Personalized pitches will be generated for each journalist</li>
                  <li>• All pitches will be saved to your PR Pitches section</li>
                  <li>• You can review and customize pitches before sending</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGeneratePitches}
              disabled={isGeneratingPitches}
              className="flex items-center gap-2"
            >
              {isGeneratingPitches ? (
                "Generating..."
              ) : (
                <>
                  Generate Pitches
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};