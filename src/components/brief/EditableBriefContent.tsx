
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import EditableWhatAndWhy from './EditableWhatAndWhy';
import EditableContentSection from './EditableContentSection';
import EditableSupportingResearch from './EditableSupportingResearch';

interface BriefContentData {
  whatAndWhy?: {
    targetAudience?: string;
    goal?: string;
  };
  contentSections?: Array<{
    title?: string;
    sectionTitle?: string;
    sectionPoints?: string[];
  }>;
  supportingResearch?: Array<{
    title: string;
    url?: string;
    description: string;
  }>;
}

interface EditableBriefContentProps {
  briefContent: BriefContentData;
  onChange: (content: BriefContentData) => void;
}

export default function EditableBriefContent({ briefContent, onChange }: EditableBriefContentProps) {
  const handleWhatAndWhyChange = (whatAndWhy: BriefContentData['whatAndWhy']) => {
    onChange({ ...briefContent, whatAndWhy });
  };

  const handleContentSectionChange = (index: number, section: BriefContentData['contentSections'][0]) => {
    const newSections = [...(briefContent.contentSections || [])];
    newSections[index] = section;
    onChange({ ...briefContent, contentSections: newSections });
  };

  const handleDeleteContentSection = (index: number) => {
    const newSections = (briefContent.contentSections || []).filter((_, i) => i !== index);
    onChange({ ...briefContent, contentSections: newSections });
  };

  const addContentSection = () => {
    const newSections = [...(briefContent.contentSections || []), { sectionTitle: '', sectionPoints: [''] }];
    onChange({ ...briefContent, contentSections: newSections });
  };

  const handleSupportingResearchChange = (research: BriefContentData['supportingResearch']) => {
    onChange({ ...briefContent, supportingResearch: research });
  };

  return (
    <div className="space-y-6">
      {/* What & Why Section */}
      <EditableWhatAndWhy
        data={briefContent.whatAndWhy || {}}
        onChange={handleWhatAndWhyChange}
      />

      {/* Content Sections */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
          <FileText className="w-5 h-5 text-green-600" />
          Content Sections
        </h3>
        <div className="space-y-4">
          {(briefContent.contentSections || []).map((section, index) => (
            <EditableContentSection
              key={index}
              section={section}
              index={index}
              onChange={handleContentSectionChange}
              onDelete={handleDeleteContentSection}
            />
          ))}
          <Button
            variant="outline"
            onClick={addContentSection}
            className="text-green-600 hover:text-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Content Section
          </Button>
        </div>
      </div>

      {/* Supporting Research */}
      <EditableSupportingResearch
        research={briefContent.supportingResearch || []}
        onChange={handleSupportingResearchChange}
      />
    </div>
  );
}
