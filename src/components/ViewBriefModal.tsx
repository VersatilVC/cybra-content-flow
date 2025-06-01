
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContentBrief } from '@/types/contentBriefs';
import { FileText, User, Calendar, Tag, Target, BookOpen, ExternalLink, Plus } from 'lucide-react';

interface ViewBriefModalProps {
  brief: ContentBrief | null;
  open: boolean;
  onClose: () => void;
  onCreateContentItem?: (briefId: string) => void;
}

interface BriefContent {
  whatAndWhy?: {
    targetAudience?: string;
    goal?: string;
  };
  contentSections?: Array<{
    title: string;
    bulletPoints: string[];
  }>;
  supportingResearch?: Array<{
    title: string;
    url?: string;
    description: string;
  }>;
}

export default function ViewBriefModal({ brief, open, onClose, onCreateContentItem }: ViewBriefModalProps) {
  if (!brief) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'discarded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const parseBriefContent = (content: string | null): BriefContent | null => {
    if (!content) return null;
    
    try {
      return JSON.parse(content) as BriefContent;
    } catch (error) {
      console.error('Failed to parse brief content:', error);
      return null;
    }
  };

  const briefContent = parseBriefContent(brief.content);
  const canCreateContent = brief.status === 'ready' || brief.status === 'approved';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Content Brief Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{brief.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(brief.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Updated {formatDate(brief.updated_at)}</span>
                </div>
              </div>
            </div>
            <Badge className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(brief.status)}`}>
              {brief.status.charAt(0).toUpperCase() + brief.status.slice(1)}
            </Badge>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Brief Type</p>
                <p className="text-sm text-gray-600">{brief.brief_type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Target Audience</p>
                <p className="text-sm text-gray-600">{brief.target_audience}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Source</p>
                <p className="text-sm text-gray-600">{brief.source_type}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {brief.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{brief.description}</p>
              </div>
            </div>
          )}

          {/* Structured Content */}
          {briefContent ? (
            <div className="space-y-6">
              {/* What & Why Section */}
              {briefContent.whatAndWhy && (
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                    <Target className="w-5 h-5 text-blue-600" />
                    What & Why
                  </h3>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                    {briefContent.whatAndWhy.targetAudience && (
                      <div>
                        <h4 className="font-medium text-blue-900">Target Audience</h4>
                        <p className="text-blue-800">{briefContent.whatAndWhy.targetAudience}</p>
                      </div>
                    )}
                    {briefContent.whatAndWhy.goal && (
                      <div>
                        <h4 className="font-medium text-blue-900">Goal</h4>
                        <p className="text-blue-800">{briefContent.whatAndWhy.goal}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Content Sections */}
              {briefContent.contentSections && Array.isArray(briefContent.contentSections) && briefContent.contentSections.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                    <FileText className="w-5 h-5 text-green-600" />
                    Content Sections
                  </h3>
                  <div className="space-y-4">
                    {briefContent.contentSections.map((section, index) => (
                      <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">
                          {index + 1}. {section.title}
                        </h4>
                        {Array.isArray(section.bulletPoints) && section.bulletPoints.length > 0 && (
                          <ul className="list-disc list-inside space-y-1 text-green-800">
                            {section.bulletPoints.map((point, pointIndex) => (
                              <li key={pointIndex}>{point}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supporting Research */}
              {briefContent.supportingResearch && Array.isArray(briefContent.supportingResearch) && briefContent.supportingResearch.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    Supporting Research
                  </h3>
                  <div className="space-y-3">
                    {briefContent.supportingResearch.map((research, index) => (
                      <div key={index} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-purple-900 mb-1">{research.title}</h4>
                            <p className="text-purple-800 text-sm">{research.description}</p>
                          </div>
                          {research.url && (
                            <a
                              href={research.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-sm ml-3"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Create Content Item CTA */}
              {canCreateContent && (
                <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Create Content?</h3>
                    <p className="text-gray-600 mb-4">
                      Transform this brief into a content item and start writing your {brief.brief_type.toLowerCase()}.
                    </p>
                    <Button
                      onClick={() => onCreateContentItem?.(brief.id)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Content Item
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Fallback for non-JSON content */
            brief.content && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Content</h3>
                <div className="p-4 bg-white border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                  <p className="text-gray-700 whitespace-pre-wrap">{brief.content}</p>
                </div>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
