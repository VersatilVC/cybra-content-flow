import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Wand2, 
  Share, 
  Calendar,
  User,
  FileText,
  Tag,
  Link as LinkIcon,
  Loader2,
  AlertTriangle,
  Globe,
  Copy,
  Check
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useContentItems } from '@/hooks/useContentItems';
import { supabase } from '@/integrations/supabase/client';
import { ContentItem } from '@/services/contentItemsApi';
import ContentDerivativesSection from '@/components/content-item/ContentDerivativesSection';
import { RequestAIFixModal } from '@/components/content-item/RequestAIFixModal';
import { EditContentModal } from '@/components/content-item/EditContentModal';
import { publishToWordPress } from '@/services/wordpressPublishingService';
import ReactMarkdown from 'react-markdown';

const ContentItemView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateContentItem, isUpdating } = useContentItems();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAIFixModalOpen, setIsAIFixModalOpen] = useState(false);
  const [isPublishingToWordPress, setIsPublishingToWordPress] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const { data: contentItem, isLoading, error, refetch } = useQuery({
    queryKey: ['content-item', id],
    queryFn: async () => {
      if (!id || !user?.id) throw new Error('Missing ID or user');
      
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw new Error(`Failed to fetch content item: ${error.message}`);
      return data as ContentItem;
    },
    enabled: !!id && !!user?.id,
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ready_for_review':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Ready for Review' };
      case 'approved':
        return { color: 'bg-green-100 text-green-800', label: 'Approved' };
      case 'needs_revision':
        return { color: 'bg-red-100 text-red-800', label: 'Needs Revision' };
      case 'draft':
        return { color: 'bg-gray-100 text-gray-800', label: 'Draft' };
      case 'published':
        return { color: 'bg-blue-100 text-blue-800', label: 'Published' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: status };
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

  const handleStatusUpdate = (newStatus: string) => {
    if (!contentItem) return;
    
    updateContentItem({ 
      id: contentItem.id, 
      updates: { status: newStatus } 
    });
    
    toast({
      title: 'Status updated',
      description: `Content item has been ${newStatus === 'approved' ? 'approved' : newStatus === 'discarded' ? 'discarded' : 'updated'}.`,
    });
  };

  const handleEditContent = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveContent = (updates: Partial<ContentItem>) => {
    if (!contentItem) return;
    
    updateContentItem({ 
      id: contentItem.id, 
      updates 
    });
    
    setIsEditModalOpen(false);
    refetch(); // Refresh the data to show updated content
  };

  const handleRequestAIFix = () => {
    setIsAIFixModalOpen(true);
  };

  const handleAIFixRequested = () => {
    // Update status to indicate AI processing
    if (contentItem) {
      updateContentItem({ 
        id: contentItem.id, 
        updates: { status: 'needs_revision' } 
      });
    }
  };

  const handlePublish = () => {
    if (!contentItem) return;
    
    updateContentItem({ 
      id: contentItem.id, 
      updates: { status: 'published' } 
    });
    
    toast({
      title: 'Content Published',
      description: 'Your content item has been published successfully.',
    });
  };

  const handleWordPressPublish = async () => {
    if (!contentItem || !user) return;
    
    setIsPublishingToWordPress(true);
    
    try {
      await publishToWordPress(contentItem, user.id);
      
      toast({
        title: 'WordPress Publishing Started',
        description: 'Your content is being published to WordPress. You will receive a notification when complete.',
      });
      
      // Refresh the content item to show updated status
      refetch();
    } catch (error) {
      console.error('WordPress publishing failed:', error);
      toast({
        title: 'WordPress Publishing Failed',
        description: error instanceof Error ? error.message : 'Failed to start WordPress publishing. Please check your webhook configuration.',
        variant: 'destructive',
      });
    } finally {
      setIsPublishingToWordPress(false);
    }
  };

  const handleDiscard = () => {
    if (!contentItem) return;
    
    updateContentItem({ 
      id: contentItem.id, 
      updates: { status: 'discarded' } 
    });
    
    toast({
      title: 'Content Discarded',
      description: 'The content item has been discarded.',
    });
  };

  const convertToMarkdown = (contentItem: ContentItem): string => {
    const statusInfo = getStatusInfo(contentItem.status);
    const createdDate = formatDate(contentItem.created_at);
    
    let markdown = `# ${contentItem.title}\n\n`;
    
    // Add metadata
    markdown += `**Status:** ${statusInfo.label} | **Type:** ${contentItem.content_type} | **Created:** ${createdDate}\n`;
    if (contentItem.word_count) {
      markdown += `**Word Count:** ${contentItem.word_count} words\n`;
    }
    markdown += '\n';
    
    // Add summary if available
    if (contentItem.summary) {
      markdown += `## Summary\n\n${contentItem.summary}\n\n`;
    }
    
    // Add main content
    if (contentItem.content) {
      markdown += `## Content\n\n${contentItem.content}\n\n`;
    }
    
    // Add tags if available
    if (contentItem.tags && contentItem.tags.length > 0) {
      markdown += `## Tags\n\n`;
      contentItem.tags.forEach(tag => {
        markdown += `- ${tag}\n`;
      });
      markdown += '\n';
    }
    
    // Add resources if available
    if (contentItem.resources && contentItem.resources.length > 0) {
      markdown += `## Resources\n\n`;
      contentItem.resources.forEach(resource => {
        markdown += `- ${resource}\n`;
      });
      markdown += '\n';
    }
    
    // Add multimedia suggestions if available
    if (contentItem.multimedia_suggestions) {
      markdown += `## Multimedia Suggestions\n\n${contentItem.multimedia_suggestions}\n\n`;
    }
    
    return markdown;
  };

  const handleCopyAsMarkdown = async () => {
    if (!contentItem) return;
    
    try {
      const markdown = convertToMarkdown(contentItem);
      await navigator.clipboard.writeText(markdown);
      
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
      toast({
        title: 'Copied to clipboard',
        description: 'Content has been copied as Markdown to your clipboard.',
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: 'Copy failed',
        description: 'Failed to copy content to clipboard. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  if (error || !contentItem) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Content item not found</h3>
          <p className="text-gray-600 mb-4">The content item you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/content-items')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Content Items
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(contentItem.status);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          onClick={() => navigate('/content-items')} 
          variant="ghost" 
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Content Items
        </Button>
        <div className="h-6 w-px bg-gray-300" />
        <nav className="text-sm text-gray-500">
          Content Items / {contentItem.title}
        </nav>
      </div>

      {/* Title and Status */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{contentItem.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>{contentItem.content_type}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Created {formatDate(contentItem.created_at)}</span>
            </div>
            {contentItem.word_count && (
              <div className="flex items-center gap-1">
                <span>{contentItem.word_count} words</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-8 p-4 bg-gray-50 rounded-lg">
        {contentItem.status === 'ready_for_review' && (
          <>
            <Button 
              onClick={() => handleStatusUpdate('approved')}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button 
              onClick={() => handleStatusUpdate('needs_revision')}
              disabled={isUpdating}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Request Revision
            </Button>
          </>
        )}
        
        {contentItem.status === 'approved' && (
          <Button 
            onClick={handlePublish}
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Share className="w-4 h-4 mr-2" />
            Publish
          </Button>
        )}
        
        <Button 
          onClick={handleEditContent}
          variant="outline"
          className="border-blue-300 text-blue-600 hover:bg-blue-50"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Content
        </Button>
        
        <Button 
          onClick={handleRequestAIFix}
          disabled={isUpdating}
          variant="outline"
          className="border-purple-300 text-purple-600 hover:bg-purple-50"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Request AI Fix
        </Button>

        <Button 
          onClick={handleWordPressPublish}
          disabled={isPublishingToWordPress || isUpdating}
          variant="outline"
          className="border-orange-300 text-orange-600 hover:bg-orange-50"
        >
          {isPublishingToWordPress ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Globe className="w-4 h-4 mr-2" />
          )}
          {isPublishingToWordPress ? 'Publishing...' : 'Publish to WordPress'}
        </Button>
        
        <Button 
          onClick={handleDiscard}
          disabled={isUpdating}
          variant="ghost"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Discard
        </Button>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="derivatives">Derivatives</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Content
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAsMarkdown}
                  className="flex items-center gap-2"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {isCopied ? 'Copied!' : 'Copy as Markdown'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {contentItem.summary && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{contentItem.summary}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Full Content</h4>
                <div className="prose prose-gray max-w-none bg-white border rounded-lg p-6">
                  {contentItem.content ? (
                    <ReactMarkdown 
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-semibold mb-3" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-medium mb-2" {...props} />,
                        p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />,
                        code: ({node, ...props}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} />,
                        pre: ({node, ...props}) => <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                        em: ({node, ...props}) => <em className="italic" {...props} />,
                        a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 underline" {...props} />,
                      }}
                    >
                      {contentItem.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-gray-500 italic">No content available</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="metadata" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contentItem.tags && contentItem.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {contentItem.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {contentItem.resources && contentItem.resources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5" />
                    Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {contentItem.resources.map((resource, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                        {resource}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {contentItem.multimedia_suggestions && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Multimedia Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{contentItem.multimedia_suggestions}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="derivatives" className="mt-6">
          <ContentDerivativesSection contentItemId={contentItem.id} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <EditContentModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        contentItem={contentItem}
        onSave={handleSaveContent}
        isUpdating={isUpdating}
      />

      <RequestAIFixModal
        open={isAIFixModalOpen}
        onOpenChange={setIsAIFixModalOpen}
        contentItem={contentItem}
        onFixRequested={handleAIFixRequested}
      />
    </div>
  );
};

export default ContentItemView;
