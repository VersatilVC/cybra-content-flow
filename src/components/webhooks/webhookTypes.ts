
import { Database, Wand2, Lightbulb, FileText, RefreshCw, Wrench } from 'lucide-react';

export const webhookTypes = [
  {
    value: 'knowledge_base',
    label: 'Knowledge Base Processing',
    icon: Database,
    description: 'Process uploaded files and URLs into your knowledge base'
  },
  {
    value: 'derivative_generation',
    label: 'Derivative Generation',
    icon: Wand2,
    description: 'Generate content derivatives like social posts and ads'
  },
  {
    value: 'idea_engine',
    label: 'Idea Engine',
    icon: Lightbulb,
    description: 'Process content ideas and suggestions'
  },
  {
    value: 'brief_creation',
    label: 'Brief Creation',
    icon: FileText,
    description: 'Generate content briefs from ideas'
  },
  {
    value: 'auto_generation',
    label: 'Auto Generation',
    icon: RefreshCw,
    description: 'Automatically generate content based on parameters'
  },
  {
    value: 'content_processing',
    label: 'Content Processing',
    icon: FileText,
    description: 'Process and create content items from briefs'
  },
  {
    value: 'content_item_fix',
    label: 'Content Item Fix',
    icon: Wrench,
    description: 'Fix and improve existing content items based on feedback'
  }
];

export const getWebhookDefaults = (type: string) => {
  const defaults = {
    knowledge_base: {
      name: 'Knowledge Base Processor',
      description: 'Processes uploaded files and URLs into searchable knowledge base entries'
    },
    derivative_generation: {
      name: 'Content Derivative Generator',
      description: 'Generates social media posts, ads, and other content derivatives'
    },
    idea_engine: {
      name: 'Content Idea Engine',
      description: 'Processes and analyzes content ideas for development'
    },
    brief_creation: {
      name: 'Content Brief Creator',
      description: 'Creates detailed content briefs from approved ideas'
    },
    auto_generation: {
      name: 'Auto Content Generator',
      description: 'Automatically generates content based on specified parameters'
    },
    content_processing: {
      name: 'Content Processor',
      description: 'Processes content briefs into complete content items'
    },
    content_item_fix: {
      name: 'Content Item Fixer',
      description: 'Fixes and improves existing content items based on user feedback'
    }
  };

  return defaults[type as keyof typeof defaults] || { name: '', description: '' };
};
