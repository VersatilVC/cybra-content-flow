
import { 
  Database, 
  MessageSquare, 
  Lightbulb, 
  Zap, 
  Briefcase, 
  Wand2, 
  FileText, 
  Link 
} from 'lucide-react';

export interface WebhookType {
  value: string;
  label: string;
  icon: typeof Database;
  color: string;
  description: string;
}

export const webhookTypes: WebhookType[] = [
  { 
    value: 'knowledge_base', 
    label: 'Knowledge Base Processing', 
    icon: Database, 
    color: 'text-purple-600',
    description: 'Processes uploaded files and URLs for knowledge base integration'
  },
  { 
    value: 'ai_chat', 
    label: 'AI Chat Assistant', 
    icon: MessageSquare, 
    color: 'text-blue-600',
    description: 'Handles AI chat conversations and responses'
  },
  { 
    value: 'idea_engine', 
    label: 'Idea Engine', 
    icon: Lightbulb, 
    color: 'text-yellow-600',
    description: 'Processes general content idea submissions'
  },
  { 
    value: 'idea_auto_generator', 
    label: 'Idea Auto Generator', 
    icon: Zap, 
    color: 'text-green-600',
    description: 'Automatically generates content ideas on schedule or demand'
  },
  { 
    value: 'brief_creator', 
    label: 'Brief Creator', 
    icon: Briefcase, 
    color: 'text-indigo-600',
    description: 'Creates detailed content briefs from processed ideas'
  },
  { 
    value: 'derivative_generation', 
    label: 'Derivative Generation', 
    icon: Wand2, 
    color: 'text-purple-600',
    description: 'Generates content derivatives like social posts, ads, and summaries from main content'
  },
  { 
    value: 'content_processing', 
    label: 'Content Processing', 
    icon: FileText, 
    color: 'text-green-600',
    description: 'General content processing and transformation'
  },
  { 
    value: 'notification', 
    label: 'Notification Webhook', 
    icon: Link, 
    color: 'text-orange-600',
    description: 'Send notifications and alerts'
  },
];

export const getWebhookDefaults = (webhookType: string) => {
  const defaults: Record<string, { name: string; description: string }> = {
    knowledge_base: {
      name: 'Knowledge Base Processing Webhook',
      description: 'Webhook for processing files and URLs uploaded to knowledge bases'
    },
    ai_chat: {
      name: 'AI Chat Assistant Webhook',
      description: 'Webhook for handling AI chat conversations and generating responses'
    },
    idea_engine: {
      name: 'Idea Engine Webhook',
      description: 'Webhook for processing general content idea submissions'
    },
    idea_auto_generator: {
      name: 'Idea Auto Generator Webhook',
      description: 'Webhook for automatically generating content ideas'
    },
    brief_creator: {
      name: 'Brief Creator Webhook',
      description: 'Webhook for creating detailed content briefs from ideas'
    },
    derivative_generation: {
      name: 'Derivative Generation Webhook',
      description: 'Webhook for generating content derivatives like social posts, ads, and summaries'
    }
  };

  return defaults[webhookType] || { name: '', description: '' };
};
