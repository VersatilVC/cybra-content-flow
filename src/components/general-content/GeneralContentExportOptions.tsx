import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileText, Table, Code, Package } from 'lucide-react';
import { GeneralContentItem } from '@/types/generalContent';
import JSZip from 'jszip';

interface GeneralContentExportOptionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: GeneralContentItem[];
  selectedItems?: GeneralContentItem[];
}

const exportFormats = [
  { id: 'txt', label: 'Text Files (.txt)', icon: FileText, description: 'Plain text files for each content item' },
  { id: 'csv', label: 'CSV Spreadsheet (.csv)', icon: Table, description: 'Tabular data with all metadata' },
  { id: 'json', label: 'JSON Data (.json)', icon: Code, description: 'Structured data format' },
  { id: 'zip', label: 'ZIP Archive (.zip)', icon: Package, description: 'All content in organized folders' },
];

const exportFields = [
  { id: 'title', label: 'Title', required: true },
  { id: 'content', label: 'Content', required: true },
  { id: 'category', label: 'Category', required: false },
  { id: 'derivative_type', label: 'Content Type', required: false },
  { id: 'status', label: 'Status', required: false },
  { id: 'created_at', label: 'Created Date', required: false },
  { id: 'updated_at', label: 'Updated Date', required: false },
  { id: 'file_url', label: 'File URL', required: false },
  { id: 'platform_url', label: 'Platform URL', required: false },
];

const GeneralContentExportOptions: React.FC<GeneralContentExportOptionsProps> = ({
  open,
  onOpenChange,
  items,
  selectedItems,
}) => {
  const { toast } = useToast();
  const [selectedFormat, setSelectedFormat] = useState<string>('txt');
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'title', 'content', 'category', 'derivative_type', 'status', 'created_at'
  ]);
  const [isExporting, setIsExporting] = useState(false);

  const exportItems = selectedItems && selectedItems.length > 0 ? selectedItems : items;

  const handleFieldToggle = (fieldId: string) => {
    const field = exportFields.find(f => f.id === fieldId);
    if (field?.required) return; // Can't toggle required fields

    if (selectedFields.includes(fieldId)) {
      setSelectedFields(selectedFields.filter(f => f !== fieldId));
    } else {
      setSelectedFields([...selectedFields, fieldId]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateFileName = (format: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const count = exportItems.length;
    const scope = selectedItems ? 'selected' : 'all';
    return `general-content-${scope}-${count}-items-${timestamp}.${format}`;
  };

  const exportAsText = async () => {
    if (exportItems.length === 1) {
      // Single file
      const item = exportItems[0];
      const content = [
        `Title: ${item.title}`,
        `Category: ${item.category}`,
        `Type: ${item.derivative_type}`,
        `Status: ${item.status}`,
        `Created: ${formatDate(item.created_at)}`,
        '',
        item.content || 'No content available'
      ].join('\n');
      
      downloadFile(content, `${item.title.replace(/[^a-zA-Z0-9]/g, '-')}.txt`, 'text/plain');
    } else {
      // Multiple files in ZIP
      const zip = new JSZip();
      
      exportItems.forEach((item, index) => {
        const content = [
          `Title: ${item.title}`,
          `Category: ${item.category}`,
          `Type: ${item.derivative_type}`,
          `Status: ${item.status}`,
          `Created: ${formatDate(item.created_at)}`,
          '',
          item.content || 'No content available'
        ].join('\n');
        
        const fileName = `${String(index + 1).padStart(3, '0')}-${item.title.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50)}.txt`;
        zip.file(fileName, content);
      });
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipBlob, generateFileName('zip'), 'application/zip');
    }
  };

  const exportAsCSV = () => {
    const headers = selectedFields.map(fieldId => {
      const field = exportFields.find(f => f.id === fieldId);
      return field?.label || fieldId;
    });

    const rows = exportItems.map(item => {
      return selectedFields.map(fieldId => {
        let value = (item as any)[fieldId] || '';
        if (fieldId === 'created_at' || fieldId === 'updated_at') {
          value = formatDate(value);
        }
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
    });

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    downloadFile(csvContent, generateFileName('csv'), 'text/csv');
  };

  const exportAsJSON = () => {
    const data = exportItems.map(item => {
      const exportItem: any = {};
      selectedFields.forEach(fieldId => {
        exportItem[fieldId] = (item as any)[fieldId];
      });
      return exportItem;
    });

    const jsonContent = JSON.stringify({
      exported_at: new Date().toISOString(),
      total_items: data.length,
      items: data
    }, null, 2);

    downloadFile(jsonContent, generateFileName('json'), 'application/json');
  };

  const exportAsZIP = async () => {
    const zip = new JSZip();
    
    // Create folders by category
    const itemsByCategory = exportItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, GeneralContentItem[]>);

    Object.entries(itemsByCategory).forEach(([category, categoryItems]) => {
      const folder = zip.folder(category);
      
      categoryItems.forEach((item, index) => {
        const content = [
          `Title: ${item.title}`,
          `Category: ${item.category}`,
          `Type: ${item.derivative_type}`,
          `Status: ${item.status}`,
          `Created: ${formatDate(item.created_at)}`,
          '',
          item.content || 'No content available'
        ].join('\n');
        
        const fileName = `${String(index + 1).padStart(3, '0')}-${item.title.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50)}.txt`;
        folder?.file(fileName, content);
      });
    });

    // Add metadata file
    const metadata = {
      exported_at: new Date().toISOString(),
      total_items: exportItems.length,
      categories: Object.keys(itemsByCategory),
      summary: Object.entries(itemsByCategory).map(([category, items]) => ({
        category,
        count: items.length
      }))
    };
    
    zip.file('metadata.json', JSON.stringify(metadata, null, 2));
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipBlob, generateFileName('zip'), 'application/zip');
  };

  const downloadFile = (content: string | Blob, filename: string, mimeType: string) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (exportItems.length === 0) {
      toast({
        title: 'No content to export',
        description: 'Please select or create some content items first.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);

    try {
      switch (selectedFormat) {
        case 'txt':
          await exportAsText();
          break;
        case 'csv':
          exportAsCSV();
          break;
        case 'json':
          exportAsJSON();
          break;
        case 'zip':
          await exportAsZIP();
          break;
      }

      toast({
        title: 'Export completed',
        description: `Successfully exported ${exportItems.length} content items.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'There was an error exporting your content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Content</DialogTitle>
          <DialogDescription>
            Export {exportItems.length} content item{exportItems.length !== 1 ? 's' : ''} in your preferred format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Export format selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Export Format</label>
            <Select value={selectedFormat} onValueChange={setSelectedFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exportFormats.map((format) => (
                  <SelectItem key={format.id} value={format.id}>
                    <div className="flex items-center">
                      <format.icon className="h-4 w-4 mr-2" />
                      <div>
                        <div>{format.label}</div>
                        <div className="text-xs text-gray-500">{format.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Field selection (for CSV and JSON) */}
          {(selectedFormat === 'csv' || selectedFormat === 'json') && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Include Fields</label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {exportFields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={() => handleFieldToggle(field.id)}
                      disabled={field.required}
                    />
                    <label
                      htmlFor={field.id}
                      className={`text-sm ${field.required ? 'font-medium' : ''}`}
                    >
                      {field.label}
                      {field.required && <Badge variant="secondary" className="ml-1 text-xs">Required</Badge>}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
            <strong>Preview:</strong> {generateFileName(selectedFormat === 'txt' && exportItems.length === 1 ? 'txt' : selectedFormat)}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GeneralContentExportOptions;