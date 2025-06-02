
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StatusSelectProps {
  value: 'draft' | 'approved' | 'published' | 'discarded';
  onChange: (value: 'draft' | 'approved' | 'published' | 'discarded') => void;
}

export const StatusSelect: React.FC<StatusSelectProps> = ({ value, onChange }) => {
  const handleStatusChange = (selectedValue: string) => {
    onChange(selectedValue as 'draft' | 'approved' | 'published' | 'discarded');
  };

  return (
    <div>
      <Label htmlFor="status">Status</Label>
      <Select value={value} onValueChange={handleStatusChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="discarded">Discarded</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
