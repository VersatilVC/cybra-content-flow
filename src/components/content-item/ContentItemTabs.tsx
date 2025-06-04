
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText,
  Tag,
  Link as LinkIcon,
  Copy,
  Check
} from 'lucide-react';
import { ContentItem } from '@/services/contentItemsApi';
import ContentDerivativesSection from './ContentDerivativesSection';
import { convertToMarkdown } from '@/utils/contentItemMarkdown';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

interface ContentItemTabsProps {
  contentItem: ContentItem;
}

const ContentItemTabs: React.FC<ContentItemTabsProps> = ({ contentItem }) => {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyAsMarkdown = async () => {
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

  return (
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
  );
};

export default ContentItemTabs;
