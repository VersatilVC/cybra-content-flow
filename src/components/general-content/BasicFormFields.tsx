
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicFormFieldsProps {
  title: string;
  targetAudience: string;
  onTitleChange: (value: string) => void;
  onTargetAudienceChange: (value: string) => void;
}

export const BasicFormFields: React.FC<BasicFormFieldsProps> = ({
  title,
  targetAudience,
  onTitleChange,
  onTargetAudienceChange
}) => {
  return (
    <>
      <div>
        <Label htmlFor="title">Content Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter content title"
          required
        />
      </div>

      <div>
        <Label htmlFor="target_audience">Target Audience *</Label>
        <Select 
          value={targetAudience} 
          onValueChange={onTargetAudienceChange}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Private Sector">Private Sector</SelectItem>
            <SelectItem value="Government Sector">Government Sector</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
