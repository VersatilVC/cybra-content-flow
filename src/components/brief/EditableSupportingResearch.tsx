
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, Trash2 } from 'lucide-react';

interface ResearchItem {
  title: string;
  url?: string;
  description: string;
}

interface EditableSupportingResearchProps {
  research: ResearchItem[];
  onChange: (research: ResearchItem[]) => void;
}

export default function EditableSupportingResearch({ research, onChange }: EditableSupportingResearchProps) {
  const handleResearchChange = (index: number, field: keyof ResearchItem, value: string) => {
    const newResearch = [...research];
    newResearch[index] = { ...newResearch[index], [field]: value };
    onChange(newResearch);
  };

  const addResearchItem = () => {
    onChange([...research, { title: '', description: '', url: '' }]);
  };

  const removeResearchItem = (index: number) => {
    onChange(research.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
        <BookOpen className="w-5 h-5 text-purple-600" />
        Supporting Research
      </h3>
      <div className="space-y-4">
        {research.map((item, index) => (
          <div key={index} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium text-purple-900">Research Item {index + 1}</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeResearchItem(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-purple-900 mb-1">
                  Title
                </label>
                <Input
                  value={item.title}
                  onChange={(e) => handleResearchChange(index, 'title', e.target.value)}
                  placeholder="Research title"
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-900 mb-1">
                  URL (optional)
                </label>
                <Input
                  value={item.url || ''}
                  onChange={(e) => handleResearchChange(index, 'url', e.target.value)}
                  placeholder="https://..."
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-900 mb-1">
                  Description
                </label>
                <Textarea
                  value={item.description}
                  onChange={(e) => handleResearchChange(index, 'description', e.target.value)}
                  placeholder="Description of the research"
                  rows={2}
                  className="bg-white"
                />
              </div>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={addResearchItem}
          className="text-purple-600 hover:text-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Research Item
        </Button>
      </div>
    </div>
  );
}
