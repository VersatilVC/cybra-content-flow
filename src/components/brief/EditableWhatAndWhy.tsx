
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Target } from 'lucide-react';

interface WhatAndWhyData {
  targetAudience?: string;
  goal?: string;
}

interface EditableWhatAndWhyProps {
  data: WhatAndWhyData;
  onChange: (data: WhatAndWhyData) => void;
}

export default function EditableWhatAndWhy({ data, onChange }: EditableWhatAndWhyProps) {
  const handleTargetAudienceChange = (value: string) => {
    onChange({ ...data, targetAudience: value });
  };

  const handleGoalChange = (value: string) => {
    onChange({ ...data, goal: value });
  };

  return (
    <div>
      <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
        <Target className="w-5 h-5 text-blue-600" />
        What & Why
      </h3>
      <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">
            Target Audience
          </label>
          <Input
            value={data.targetAudience || ''}
            onChange={(e) => handleTargetAudienceChange(e.target.value)}
            placeholder="Describe the target audience"
            className="bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">
            Goal
          </label>
          <Textarea
            value={data.goal || ''}
            onChange={(e) => handleGoalChange(e.target.value)}
            placeholder="Describe the goal of this content"
            rows={3}
            className="bg-white"
          />
        </div>
      </div>
    </div>
  );
}
