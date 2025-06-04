
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { ContentSection } from '@/utils/markdownParser';

interface EditableContentSectionProps {
  section: ContentSection;
  index: number;
  onChange: (index: number, section: ContentSection) => void;
  onDelete: (index: number) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
}

export default function EditableContentSection({ 
  section, 
  index, 
  onChange, 
  onDelete,
  onMoveUp,
  onMoveDown
}: EditableContentSectionProps) {
  const handleTypeChange = (newType: string) => {
    const updatedSection: ContentSection = {
      ...section,
      type: newType as ContentSection['type'],
      items: newType === 'list' ? section.items || [''] : undefined,
      level: newType === 'heading' ? section.level || 1 : undefined
    };
    onChange(index, updatedSection);
  };

  const handleContentChange = (value: string) => {
    onChange(index, { ...section, content: value });
  };

  const handleLevelChange = (level: string) => {
    onChange(index, { ...section, level: parseInt(level) });
  };

  const handleListItemChange = (itemIndex: number, value: string) => {
    const newItems = [...(section.items || [])];
    newItems[itemIndex] = value;
    onChange(index, { ...section, items: newItems });
  };

  const addListItem = () => {
    const newItems = [...(section.items || []), ''];
    onChange(index, { ...section, items: newItems });
  };

  const removeListItem = (itemIndex: number) => {
    const newItems = (section.items || []).filter((_, i) => i !== itemIndex);
    onChange(index, { ...section, items: newItems });
  };

  const getBackgroundColor = () => {
    switch (section.type) {
      case 'heading': return 'bg-blue-50 border-blue-200';
      case 'paragraph': return 'bg-gray-50 border-gray-200';
      case 'list': return 'bg-green-50 border-green-200';
      case 'blockquote': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getTypeLabel = () => {
    switch (section.type) {
      case 'heading': return 'Heading';
      case 'paragraph': return 'Paragraph';
      case 'list': return 'List';
      case 'blockquote': return 'Quote';
      default: return 'Content';
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${getBackgroundColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
          <Select value={section.type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-32 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="heading">Heading</SelectItem>
              <SelectItem value="paragraph">Paragraph</SelectItem>
              <SelectItem value="list">List</SelectItem>
              <SelectItem value="blockquote">Quote</SelectItem>
            </SelectContent>
          </Select>
          
          {section.type === 'heading' && (
            <Select value={section.level?.toString() || '1'} onValueChange={handleLevelChange}>
              <SelectTrigger className="w-20 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">H1</SelectItem>
                <SelectItem value="2">H2</SelectItem>
                <SelectItem value="3">H3</SelectItem>
                <SelectItem value="4">H4</SelectItem>
                <SelectItem value="5">H5</SelectItem>
                <SelectItem value="6">H6</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="flex gap-2">
          {onMoveUp && index > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMoveUp(index)}
              className="text-gray-600"
            >
              ↑
            </Button>
          )}
          {onMoveDown && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMoveDown(index)}
              className="text-gray-600"
            >
              ↓
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(index)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {section.type === 'list' ? (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            List Items
          </label>
          {(section.items || []).map((item, itemIndex) => (
            <div key={itemIndex} className="flex items-center gap-2">
              <Input
                value={item}
                onChange={(e) => handleListItemChange(itemIndex, e.target.value)}
                placeholder="Enter list item"
                className="bg-white flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeListItem(itemIndex)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addListItem}
            className="text-green-600 hover:text-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getTypeLabel()} Content
          </label>
          {section.type === 'heading' ? (
            <Input
              value={section.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Enter heading text"
              className="bg-white"
            />
          ) : (
            <Textarea
              value={section.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={`Enter ${section.type} content`}
              rows={section.type === 'paragraph' ? 4 : 2}
              className="bg-white"
            />
          )}
        </div>
      )}
    </div>
  );
}
