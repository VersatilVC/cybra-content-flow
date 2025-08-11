
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StatusSelectProps {
  value: 'draft' | 'approved' | 'published' | 'discarded' | 'processing' | 'failed' | 'completed';
  onChange: (value: 'draft' | 'approved' | 'published' | 'discarded' | 'processing' | 'failed' | 'completed') => void;
}

export const StatusSelect: React.FC<StatusSelectProps> = ({ value, onChange }) => {
  const handleStatusChange = (selectedValue: string) => {
    onChange(selectedValue as 'draft' | 'approved' | 'published' | 'discarded' | 'processing' | 'failed' | 'completed');
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
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
          <SelectItem value="discarded">Discarded</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
