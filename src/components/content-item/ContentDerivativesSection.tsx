
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Wand2, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { useContentDerivatives } from '@/hooks/useContentDerivatives';
import { useAuth } from '@/contexts/AuthContext';
import { ContentDerivative } from '@/services/contentDerivativesApi';
import DerivativeGenerationModal from './DerivativeGenerationModal';

interface ContentDerivativesSectionProps {
  contentItemId: string;
}

const ContentDerivativesSection: React.FC<ContentDerivativesSectionProps> = ({ contentItemId }) => {
  const { user } = useAuth();
  const { derivatives, isLoading, updateDerivative, deleteDerivative } = useContentDerivatives(contentItemId);
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'General' | 'Social' | 'Ads'>('General');

  const derivativesByCategory = {
    General: derivatives.filter(d => d.category === 'General'),
    Social: derivatives.filter(d => d.category === 'Social'),
    Ads: derivatives.filter(d => d.category === 'Ads'),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'published':
        return 'bg-blue-100 text-blue-800';
      case 'discarded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const handleStatusUpdate = (derivativeId: string, newStatus: string) => {
    updateDerivative({ 
      id: derivativeId, 
      updates: { status: newStatus as 'draft' | 'approved' | 'published' | 'discarded' } 
    });
  };

  const handleOpenGeneration = (category: 'General' | 'Social' | 'Ads') => {
    setSelectedCategory(category);
    setIsGenerationModalOpen(true);
  };

  const renderDerivativeCard = (derivative: ContentDerivative) => (
    <Card key={derivative.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-1">{derivative.title}</h4>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{derivative.content}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{derivative.derivative_type.replace('_', ' ')}</span>
              <span>•</span>
              <span>{formatDate(derivative.created_at)}</span>
              {derivative.word_count && (
                <>
                  <span>•</span>
                  <span>{derivative.word_count} words</span>
                </>
              )}
            </div>
          </div>
          <Badge className={`ml-3 ${getStatusColor(derivative.status)}`}>
            {derivative.status.charAt(0).toUpperCase() + derivative.status.slice(1)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button size="sm" variant="ghost">
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          {derivative.status === 'draft' && (
            <Button 
              size="sm" 
              onClick={() => handleStatusUpdate(derivative.id, 'approved')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approve
            </Button>
          )}
          {derivative.status === 'approved' && (
            <Button 
              size="sm" 
              onClick={() => handleStatusUpdate(derivative.id, 'published')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Publish
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => deleteDerivative(derivative.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderCategorySection = (category: 'General' | 'Social' | 'Ads', items: ContentDerivative[]) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          {category} ({items.length})
        </h3>
        <Button 
          onClick={() => handleOpenGeneration(category)}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Generate {category}
        </Button>
      </div>
      
      {items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Wand2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 mb-4">No {category.toLowerCase()} derivatives yet</p>
            <Button 
              onClick={() => handleOpenGeneration(category)}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Generate First {category} Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(renderDerivativeCard)}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Content Derivatives</h2>
        <div className="text-sm text-gray-500">
          {derivatives.length} total derivatives
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">
            General ({derivativesByCategory.General.length})
          </TabsTrigger>
          <TabsTrigger value="social">
            Social ({derivativesByCategory.Social.length})
          </TabsTrigger>
          <TabsTrigger value="ads">
            Ads ({derivativesByCategory.Ads.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          {renderCategorySection('General', derivativesByCategory.General)}
        </TabsContent>
        
        <TabsContent value="social" className="mt-6">
          {renderCategorySection('Social', derivativesByCategory.Social)}
        </TabsContent>
        
        <TabsContent value="ads" className="mt-6">
          {renderCategorySection('Ads', derivativesByCategory.Ads)}
        </TabsContent>
      </Tabs>

      <DerivativeGenerationModal
        isOpen={isGenerationModalOpen}
        onClose={() => setIsGenerationModalOpen(false)}
        contentItemId={contentItemId}
        category={selectedCategory}
      />
    </div>
  );
};

export default ContentDerivativesSection;
