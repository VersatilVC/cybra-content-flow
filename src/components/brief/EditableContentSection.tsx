
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

interface ContentSection {
  title?: string;
  sectionTitle?: string;
  sectionPoints?: string[];
}

interface EditableContentSectionProps {
  section: ContentSection;
  index: number;
  onChange: (index: number, section: ContentSection) => void;
  onDelete: (index: number) => void;
}

export default function EditableContentSection({ 
  section, 
  index, 
  onChange, 
  onDelete 
}: EditableContentSectionProps) {
  const sectionTitle = section.sectionTitle || section.title || '';
  const bulletPoints = section.sectionPoints || [];

  const handleTitleChange = (value: string) => {
    onChange(index, { ...section, sectionTitle: value });
  };

  const handleBulletPointChange = (pointIndex: number, value: string) => {
    const newPoints = [...bulletPoints];
    newPoints[pointIndex] = value;
    onChange(index, { ...section, sectionPoints: newPoints });
  };

  const addBulletPoint = () => {
    const newPoints = [...bulletPoints, ''];
    onChange(index, { ...section, sectionPoints: newPoints });
  };

  const removeBulletPoint = (pointIndex: number) => {
    const newPoints = bulletPoints.filter((_, i) => i !== pointIndex);
    onChange(index, { ...section, sectionPoints: newPoints });
  };

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 mr-3">
          <label className="block text-sm font-medium text-green-900 mb-2">
            Section {index + 1} Title
          </label>
          <Input
            value={sectionTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter section title"
            className="bg-white"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(index)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-green-900">
          Bullet Points
        </label>
        {bulletPoints.map((point, pointIndex) => (
          <div key={pointIndex} className="flex items-center gap-2">
            <Textarea
              value={point}
              onChange={(e) => handleBulletPointChange(pointIndex, e.target.value)}
              placeholder="Enter bullet point"
              rows={2}
              className="bg-white flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => removeBulletPoint(pointIndex)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addBulletPoint}
          className="text-green-600 hover:text-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Bullet Point
        </Button>
      </div>
    </div>
  );
}
