
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wand2, 
  Plus, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  Image,
  Video,
  Music,
  File
} from 'lucide-react';
import { useContentDerivatives } from '@/hooks/useContentDerivatives';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import DerivativeGenerationModal from './DerivativeGenerationModal';
import { formatDate } from '@/lib/utils';

interface ContentDerivativesSectionProps {
  contentItemId: string;
}

const ContentDerivativesSection: React.FC<ContentDerivativesSectionProps> = ({ contentItemId }) => {
  const { derivatives, isLoading } = useContentDerivatives(contentItemId);
  const [activeTab, setActiveTab] = useState('General');
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [generationCategory, setGenerationCategory] = useState<'General' | 'Social' | 'Ads'>('General');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'discarded': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'document': return <File className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const handleGenerate = (category: 'General' | 'Social' | 'Ads') => {
    setGenerationCategory(category);
    setIsGenerationModalOpen(true);
  };

  const renderDerivativeCard = (derivative: ContentDerivative) => (
    <Card key={derivative.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getContentTypeIcon(derivative.content_type)}
            <CardTitle className="text-lg">{derivative.title}</CardTitle>
            <Badge variant="outline" className="text-xs">
              {derivative.content_type}
            </Badge>
          </div>
          <Badge className={`px-2 py-1 text-xs ${getStatusColor(derivative.status)}`}>
            {derivative.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {derivative.content_type === 'text' && derivative.content && (
            <div className="text-sm text-gray-700 line-clamp-3">
              {derivative.content}
            </div>
          )}
          
          {derivative.content_type !== 'text' && derivative.file_url && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>File:</span>
              <a 
                href={derivative.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View {derivative.content_type}
              </a>
              {derivative.file_size && (
                <span className="text-gray-400">
                  ({formatFileSize(derivative.file_size)})
                </span>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-gray-500">
              <div>Type: {derivative.derivative_type.replace('_', ' ')}</div>
              <div>Created: {formatDate(derivative.created_at)}</div>
              {derivative.word_count && (
                <div>Words: {derivative.word_count}</div>
              )}
            </div>
            <div className="flex gap-2">
              {derivative.file_url && (
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const categorizedDerivatives = {
    General: derivatives.filter(d => d.category === 'General'),
    Social: derivatives.filter(d => d.category === 'Social'),
    Ads: derivatives.filter(d => d.category === 'Ads')
  };

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
          <TabsContent key={category} value={category} className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                {category} content derivatives and variations
              </p>
              <Button 
                onClick={() => handleGenerate(category)}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Generate {category}
              </Button>
            </div>
            
            {categorizedDerivatives[category].length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <Wand2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No {category} derivatives yet
                </h4>
                <p className="text-gray-600 mb-4">
                  Generate {category.toLowerCase()} content variations from your main content.
                </p>
                <Button 
                  onClick={() => handleGenerate(category)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Generate {category} Derivatives
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categorizedDerivatives[category].map(renderDerivativeCard)}
              </div>
            )}
          </TabsContent>
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
