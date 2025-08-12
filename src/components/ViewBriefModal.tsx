
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentBrief } from '@/types/contentBriefs';
import { FileText, Edit, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import BriefHeader from './brief/BriefHeader';
import BriefMetadata from './brief/BriefMetadata';
import BriefContent from './brief/BriefContent';
import CreateContentCTA from './brief/CreateContentCTA';

interface ViewBriefModalProps {
  brief: ContentBrief | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (brief: ContentBrief) => void;
  onCreateContentItem?: (briefId: string) => void;
}

interface BriefContent {
  whatAndWhy?: {
    targetAudience?: string;
    goal?: string;
  };
  contentSections?: Array<{
    title?: string;
    sectionTitle?: string;
    bulletPoints?: string[] | string;
    sectionPoints?: string[];
    content?: string;
    points?: string[];
    items?: string[];
  }>;
  supportingResearch?: Array<{
    title: string;
    url?: string;
    description: string;
  }>;
}

export default function ViewBriefModal({ brief, open, onClose, onEdit, onCreateContentItem }: ViewBriefModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!brief) return null;

  const parseBriefContent = (content: string | null): BriefContent | null => {
    if (!content) {
      console.log('No content to parse');
      return null;
    }
    
    // Check if content is already an object
    if (typeof content === 'object') {
      console.log('Content is already an object:', content);
      return content as BriefContent;
    }
    
    try {
      const parsed = JSON.parse(content) as BriefContent;
      console.log('✅ Successfully parsed brief content:', parsed);
      console.log('Content sections found:', parsed.contentSections?.length || 0);
      return parsed;
    } catch (error) {
      console.error('❌ Failed to parse brief content:', error);
      console.log('Raw content type:', typeof content);
      console.log('Raw content preview:', content.substring(0, 200) + '...');
      
      // Try to extract structured data from text content
      const fallbackContent = tryExtractStructuredContent(content);
      if (fallbackContent) {
        console.log('✅ Extracted fallback structured content');
        return fallbackContent;
      }
      
      return null;
    }
  };

  const tryExtractStructuredContent = (content: string): BriefContent | null => {
    try {
      // Look for section patterns in text content
      const sections = content.split(/(?:^|\n)(?:\d+\.|#+\s*)/m).filter(s => s.trim());
      if (sections.length > 1) {
        const contentSections = sections.slice(1).map((sectionText, index) => {
          const lines = sectionText.split('\n').filter(l => l.trim());
          const title = lines[0]?.trim() || `Section ${index + 1}`;
          const points = lines.slice(1).filter(l => l.trim().startsWith('-') || l.trim().startsWith('•'))
            .map(l => l.replace(/^[-•]\s*/, '').trim());
          
          return {
            sectionTitle: title,
            sectionPoints: points.length > 0 ? points : [sectionText.trim()]
          };
        });
        
        return { contentSections };
      }
    } catch (error) {
      console.error('Failed to extract structured content:', error);
    }
    return null;
  };

  const briefContent = parseBriefContent(brief.content);

  const convertToMarkdown = (): string => {
    let markdown = '';
    
    // Title
    markdown += `# ${brief.title}\n\n`;
    
    // Metadata
    markdown += `**Status:** ${brief.status} | **Type:** ${brief.brief_type} | **Audience:** ${brief.target_audience}\n`;
    markdown += `**Created:** ${new Date(brief.created_at).toLocaleDateString()} | **Updated:** ${new Date(brief.updated_at).toLocaleDateString()}\n\n`;
    
    // Description
    if (brief.description) {
      markdown += `## Description\n\n${brief.description}\n\n`;
    }
    
    if (briefContent) {
      // What & Why Section
      if (briefContent.whatAndWhy) {
        markdown += `## What & Why\n\n`;
        if (briefContent.whatAndWhy.targetAudience) {
          markdown += `**Target Audience:** ${briefContent.whatAndWhy.targetAudience}\n\n`;
        }
        if (briefContent.whatAndWhy.goal) {
          markdown += `**Goal:** ${briefContent.whatAndWhy.goal}\n\n`;
        }
      }
      
      // Content Sections
      if (briefContent.contentSections && Array.isArray(briefContent.contentSections) && briefContent.contentSections.length > 0) {
        markdown += `## Content Sections\n\n`;
        briefContent.contentSections.forEach((section, index) => {
          const sectionTitle = section.sectionTitle || section.title || `Section ${index + 1}`;
          markdown += `### ${index + 1}. ${sectionTitle}\n\n`;
          
          // Get bullet points
          let bulletPoints: string[] = [];
          if (section.sectionPoints && Array.isArray(section.sectionPoints)) {
            bulletPoints = section.sectionPoints;
          } else if (section.bulletPoints) {
            if (Array.isArray(section.bulletPoints)) {
              bulletPoints = section.bulletPoints;
            } else if (typeof section.bulletPoints === 'string') {
              bulletPoints = section.bulletPoints.split('\n').filter(point => point.trim().length > 0);
            }
          } else if (section.points && Array.isArray(section.points)) {
            bulletPoints = section.points;
          } else if (section.items && Array.isArray(section.items)) {
            bulletPoints = section.items;
          } else if (section.content && typeof section.content === 'string') {
            bulletPoints = section.content.split('\n').filter(line => line.trim().length > 0);
          }
          
          bulletPoints.forEach(point => {
            markdown += `- ${point}\n`;
          });
          markdown += '\n';
        });
      }
      
      // Supporting Research
      if (briefContent.supportingResearch && Array.isArray(briefContent.supportingResearch) && briefContent.supportingResearch.length > 0) {
        markdown += `## Supporting Research\n\n`;
        briefContent.supportingResearch.forEach((research) => {
          markdown += `### ${research.title}\n\n`;
          markdown += `${research.description}\n\n`;
          if (research.url) {
            markdown += `[View Source](${research.url})\n\n`;
          }
        });
      }
    } else if (brief.content) {
      // Fallback for non-JSON content
      markdown += `## Content\n\n${brief.content}\n\n`;
    }
    
    return markdown;
  };

  const handleCopyMarkdown = async () => {
    try {
      const markdownContent = convertToMarkdown();
      await navigator.clipboard.writeText(markdownContent);
      setCopied(true);
      toast({
        title: 'Copied to clipboard',
        description: 'Brief has been copied as Markdown format.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy brief to clipboard.',
        variant: 'destructive',
      });
    }
  };

  // Debug logging
  console.log('Brief content structure:', {
    rawContent: brief.content,
    parsedContent: briefContent,
    contentSections: briefContent?.contentSections,
    contentSectionsLength: briefContent?.contentSections?.length,
    isArray: Array.isArray(briefContent?.contentSections)
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Content Brief Details
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyMarkdown}
                className="text-green-600 hover:text-green-700"
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied ? 'Copied!' : 'Copy as Markdown'}
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(brief)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Brief
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content Structure</TabsTrigger>
            <TabsTrigger value="raw">Raw Content</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Header */}
            <BriefHeader brief={brief} />

            {/* Metadata */}
            <BriefMetadata brief={brief} />

            {/* Description */}
            {brief.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{brief.description}</p>
                </div>
              </div>
            )}

            <CreateContentCTA brief={brief} onCreateContentItem={onCreateContentItem} />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            {briefContent ? (
              <BriefContent briefContent={briefContent} />
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Structure</h3>
                <p className="text-gray-600 italic">No structured content has been defined for this brief yet.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="raw" className="space-y-6">
            {brief.content ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Raw Content</h3>
                  <div className="p-3 bg-white border border-gray-200 rounded max-h-96 overflow-y-auto">
                    <pre className="text-gray-700 whitespace-pre-wrap text-sm">{brief.content}</pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Raw Content</h3>
                <p className="text-gray-600 italic">No content has been defined for this brief yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
