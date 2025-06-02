import React, { useState, useEffect } from 'react';
import { Search, Filter, Briefcase, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useContentBriefs } from '@/hooks/useContentBriefs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ContentBriefFilters, ContentBrief } from '@/types/contentBriefs';
import { triggerContentProcessingWebhook } from '@/services/webhookService';
import ContentBriefCard from '@/components/ContentBriefCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ViewBriefModal from '@/components/ViewBriefModal';
import EditBriefModal from '@/components/EditBriefModal';

const ContentBriefs = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState<ContentBriefFilters>({
    briefType: 'All Brief Types',
    targetAudience: 'All Audiences',
    status: 'All Statuses',
    search: '',
  });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedBrief, setSelectedBrief] = useState<ContentBrief | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isCreatingContent, setIsCreatingContent] = useState(false);

  const { 
    briefs, 
    isLoading, 
    error,
    deleteBrief,
    updateBrief,
    isUpdating 
  } = useContentBriefs(filters);

  // Check URL params for auto-opening brief details
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewBriefId = urlParams.get('view');
    
    if (viewBriefId && briefs.length > 0) {
      const briefToView = briefs.find(brief => brief.id === viewBriefId);
      if (briefToView) {
        setSelectedBrief(briefToView);
        setViewModalOpen(true);
        // Clear the URL parameter
        window.history.replaceState({}, '', '/content-briefs');
      }
    }
  }, [briefs]);

  console.log('ContentBriefs Debug:', {
    user: !!user,
    userId: user?.id,
    authLoading,
    isLoading,
    error: error?.message,
    briefsCount: briefs.length,
    retryCount
  });

  const handleFilterChange = (key: keyof ContentBriefFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleEdit = (brief: ContentBrief) => {
    setSelectedBrief(brief);
    setEditModalOpen(true);
    setViewModalOpen(false); // Close view modal if open
  };

  const handleView = (brief: ContentBrief) => {
    setSelectedBrief(brief);
    setViewModalOpen(true);
  };

  const handleSaveBrief = (id: string, updates: Partial<ContentBrief>) => {
    updateBrief({ id, updates });
    setEditModalOpen(false);
    setSelectedBrief(null);
  };

  const handleCreateContentItem = async (briefId: string) => {
    if (!user?.id || isCreatingContent) {
      if (!user?.id) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to create content items.',
          variant: 'destructive',
        });
      }
      return;
    }

    setIsCreatingContent(true);
    
    try {
      console.log('Creating content item for brief:', briefId);
      
      // Trigger the content processing webhook
      await triggerContentProcessingWebhook(briefId, user.id);
      
      // Show fun confirmation message
      toast({
        title: '🎉 Content magic is happening!',
        description: '✨ Your content item is being crafted by our digital elves. You\'ll be notified when it\'s ready to shine! 🚀',
      });
    } catch (error) {
      console.error('Failed to create content item:', error);
      toast({
        title: 'Oops! Something went wrong',
        description: 'Failed to start content creation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingContent(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };

  // Show loading while auth is still loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Loading authentication...</span>
      </div>
    );
  }

  // Show auth error if user is not authenticated
  if (!user) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Alert className="mb-6">
          <AlertDescription>
            You need to be logged in to view content briefs. Please log in and try again.
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.location.href = '/auth'}>
          Go to Login
        </Button>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            Failed to load content briefs: {error.message}
          </AlertDescription>
        </Alert>
        <div className="flex gap-2">
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button onClick={() => window.location.href = '/dashboard'} variant="outline">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Show loading while data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2 text-gray-600">Loading content briefs...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Briefs</h1>
          <p className="text-gray-600">Manage and review your content briefs</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search briefs..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
          <Select 
            value={filters.briefType} 
            onValueChange={(value) => handleFilterChange('briefType', value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Brief Types">All Brief Types</SelectItem>
              <SelectItem value="Blog Post">Blog Post</SelectItem>
              <SelectItem value="Guide">Guide</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={filters.targetAudience} 
            onValueChange={(value) => handleFilterChange('targetAudience', value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Audiences">All Audiences</SelectItem>
              <SelectItem value="Private Sector">Private Sector</SelectItem>
              <SelectItem value="Government Sector">Government Sector</SelectItem>
            </SelectContent>
          </Select>
          <Select 
            value={filters.status} 
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Statuses">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="content_created">Content Created</SelectItem>
              <SelectItem value="discarded">Discarded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Briefs Grid */}
      <div className="space-y-4">
        {briefs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content briefs yet</h3>
            <p className="text-gray-600 mb-4">Start by creating briefs from your content ideas and suggestions.</p>
            <Button
              onClick={() => window.location.href = '/ideas'}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Go to Content Ideas
            </Button>
          </div>
        ) : (
          briefs.map((brief) => (
            <ContentBriefCard
              key={brief.id}
              brief={brief}
              onEdit={handleEdit}
              onDiscard={deleteBrief}
              onCreateContentItem={handleCreateContentItem}
              onView={handleView}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <ViewBriefModal
        brief={selectedBrief}
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedBrief(null);
        }}
        onEdit={handleEdit}
        onCreateContentItem={handleCreateContentItem}
      />
      
      <EditBriefModal
        brief={selectedBrief}
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedBrief(null);
        }}
        onSave={handleSaveBrief}
        isUpdating={isUpdating}
      />
    </div>
  );
};

export default ContentBriefs;
