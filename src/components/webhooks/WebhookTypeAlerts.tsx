
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, AlertTriangle } from 'lucide-react';

interface WebhookTypeAlertsProps {
  selectedType: any;
  webhookType: string;
}

export function WebhookTypeAlerts({ selectedType, webhookType }: WebhookTypeAlertsProps) {
  if (!selectedType) return null;

  const getAlertContent = () => {
    switch (webhookType) {
      case 'knowledge_base':
        return {
          type: 'info' as const,
          icon: InfoIcon,
          title: 'Knowledge Base Processing',
          description: 'This webhook will receive file uploads and URL submissions for processing into your knowledge base. The payload includes file metadata, content, and processing instructions.'
        };
      case 'derivative_generation':
        return {
          type: 'info' as const,
          icon: InfoIcon,
          title: 'Derivative Generation',
          description: 'This webhook will receive requests to generate content derivatives like social media posts, ads, and marketing copy. The payload includes the source content and derivative type specifications.'
        };
      case 'idea_engine':
        return {
          type: 'info' as const,
          icon: InfoIcon,
          title: 'Idea Processing',
          description: 'This webhook will receive content ideas for processing and development. The payload includes idea details, source information, and processing preferences.'
        };
      case 'brief_creation':
        return {
          type: 'info' as const,
          icon: InfoIcon,
          title: 'Brief Creation',
          description: 'This webhook will receive approved ideas for conversion into detailed content briefs. The payload includes idea data and brief generation requirements.'
        };
      case 'auto_generation':
        return {
          type: 'info' as const,
          icon: InfoIcon,
          title: 'Auto Generation',
          description: 'This webhook will receive automated content generation requests. The payload includes generation parameters, content requirements, and scheduling information.'
        };
      case 'content_processing':
        return {
          type: 'info' as const,
          icon: InfoIcon,
          title: 'Content Processing',
          description: 'This webhook will receive content briefs for processing into complete content items. The payload includes brief details, requirements, and content specifications.'
        };
      case 'content_item_fix':
        return {
          type: 'info' as const,
          icon: InfoIcon,
          title: 'Content Item Fix',
          description: 'This webhook will receive content improvement requests. The payload includes the current content, user feedback, and fix requirements for AI-powered content enhancement.'
        };
      default:
        return null;
    }
  };

  const alertContent = getAlertContent();
  if (!alertContent) return null;

  const { type, icon: Icon, title, description } = alertContent;

  return (
    <Alert className={type === 'warning' ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'}>
      <Icon className={`h-4 w-4 ${type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
      <AlertDescription>
        <div className={type === 'warning' ? 'text-yellow-800' : 'text-blue-800'}>
          <strong>{title}</strong><br />
          {description}
        </div>
      </AlertDescription>
    </Alert>
  );
}
