
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FileText, Code } from 'lucide-react';
import EditableContentSection from './EditableContentSection';
import { ContentSection, parseMarkdownToSections, sectionsToMarkdown } from '@/utils/markdownParser';

interface StructuredContentEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function StructuredContentEditor({ content, onChange }: StructuredContentEditorProps) {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [rawMarkdown, setRawMarkdown] = useState(content);
  const [activeTab, setActiveTab] = useState('structured');

  useEffect(() => {
    if (content !== rawMarkdown) {
      setRawMarkdown(content);
      setSections(parseMarkdownToSections(content));
    }
  }, [content]);

  const handleSectionChange = (index: number, section: ContentSection) => {
    const newSections = [...sections];
    newSections[index] = section;
    setSections(newSections);
    
    const markdown = sectionsToMarkdown(newSections);
    setRawMarkdown(markdown);
    onChange(markdown);
  };

  const handleDeleteSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    setSections(newSections);
    
    const markdown = sectionsToMarkdown(newSections);
    setRawMarkdown(markdown);
    onChange(markdown);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newSections.length) {
      [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
      setSections(newSections);
      
      const markdown = sectionsToMarkdown(newSections);
      setRawMarkdown(markdown);
      onChange(markdown);
    }
  };

  const addSection = (type: ContentSection['type']) => {
    const newSection: ContentSection = {
      id: `section-${sections.length}`,
      type,
      content: '',
      level: type === 'heading' ? 2 : undefined,
      items: type === 'list' ? [''] : undefined
    };
    
    const newSections = [...sections, newSection];
    setSections(newSections);
    
    const markdown = sectionsToMarkdown(newSections);
    setRawMarkdown(markdown);
    onChange(markdown);
  };

  const handleRawMarkdownChange = (value: string) => {
    setRawMarkdown(value);
    setSections(parseMarkdownToSections(value));
    onChange(value);
  };

  const syncFromRawToStructured = () => {
    setSections(parseMarkdownToSections(rawMarkdown));
    onChange(rawMarkdown);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="structured" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Visual Editor
          </TabsTrigger>
          <TabsTrigger value="markdown" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Markdown
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="structured" className="space-y-4">
          {sections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No content sections yet. Add your first section below.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((section, index) => (
                <EditableContentSection
                  key={section.id}
                  section={section}
                  index={index}
                  onChange={handleSectionChange}
                  onDelete={handleDeleteSection}
                  onMoveUp={(i) => handleMoveSection(i, 'up')}
                  onMoveDown={(i) => handleMoveSection(i, 'down')}
                />
              ))}
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSection('heading')}
              className="text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Heading
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSection('paragraph')}
              className="text-gray-600 hover:text-gray-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Paragraph
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSection('list')}
              className="text-green-600 hover:text-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add List
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addSection('blockquote')}
              className="text-yellow-600 hover:text-yellow-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Quote
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="markdown">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">Raw Markdown</label>
              <Button
                variant="outline"
                size="sm"
                onClick={syncFromRawToStructured}
                className="text-blue-600 hover:text-blue-700"
              >
                Sync to Visual Editor
              </Button>
            </div>
            <Textarea
              value={rawMarkdown}
              onChange={(e) => handleRawMarkdownChange(e.target.value)}
              placeholder="Enter your content in Markdown format..."
              rows={20}
              className="font-mono text-sm"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
