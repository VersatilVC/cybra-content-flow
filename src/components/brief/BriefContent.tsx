
import React from 'react';
import { Target, FileText, BookOpen, ExternalLink } from 'lucide-react';
import BriefSection from './BriefSection';

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

interface BriefContentProps {
  briefContent: BriefContent;
}

export default function BriefContent({ briefContent }: BriefContentProps) {
  return (
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
      {briefContent.contentSections && Array.isArray(briefContent.contentSections) && briefContent.contentSections.length > 0 ? (
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
            <FileText className="w-5 h-5 text-green-600" />
            Content Sections
          </h3>
          <div className="space-y-4">
            {briefContent.contentSections.map((section, index) => (
              <BriefSection key={index} section={section} index={index} />
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-2">
            <FileText className="w-5 h-5 text-gray-600" />
            Content Sections
          </h3>
          <p className="text-gray-600 italic">No content sections have been defined for this brief yet.</p>
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
    </div>
  );
}
