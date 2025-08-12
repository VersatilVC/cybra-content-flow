import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, Download, Wand2, Check } from 'lucide-react';
import { GeneralContentItem } from '@/types/generalContent';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface GeneralContentBatchActionsProps {
  selectedItems: GeneralContentItem[];
  onSelectionChange: (items: GeneralContentItem[]) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onBulkAIFix: (items: GeneralContentItem[]) => void;
  isDeleting: boolean;
}

const GeneralContentBatchActions: React.FC<GeneralContentBatchActionsProps> = ({
  selectedItems,
  onSelectionChange,
  onDeleteMultiple,
  onBulkAIFix,
  isDeleting
}) => {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleSelectAll = (items: GeneralContentItem[]) => {
    if (selectedItems.length === items.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(items);
    }
  };

  const handleBulkDownload = async () => {
    try {
      const textItems = selectedItems.filter(item => item.content);
      
      if (textItems.length === 0) {
        toast({
          title: 'No content to download',
          description: 'Selected items do not contain downloadable text content.',
          variant: 'destructive',
        });
        return;
      }

      // Create a combined text file
      const combinedContent = textItems.map(item => 
        `=== ${item.title} ===\n` +
        `Category: ${item.category}\n` +
        `Type: ${item.derivative_type}\n` +
        `Created: ${new Date(item.created_at).toLocaleDateString()}\n\n` +
        `${item.content}\n\n` +
        '---\n\n'
      ).join('');

      const blob = new Blob([combinedContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `general-content-batch-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Download Started',
        description: `Downloaded ${textItems.length} content items.`,
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download content items.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteConfirm = () => {
    onDeleteMultiple(selectedItems.map(item => item.id));
    setShowDeleteDialog(false);
    onSelectionChange([]);
  };

  const handleBulkAIFixClick = () => {
    onBulkAIFix(selectedItems);
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center gap-4 min-w-[400px]">
          <div className="flex items-center gap-2">
            <Checkbox 
              checked={true}
              onChange={() => onSelectionChange([])}
            />
            <span className="text-sm font-medium">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDownload}
              className="h-8"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkAIFixClick}
              className="h-8 border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Wand2 className="w-4 h-4 mr-1" />
              AI Fix
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
              className="h-8 border-red-200 text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Items</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedItems.length} selected content item{selectedItems.length !== 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Items
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GeneralContentBatchActions;