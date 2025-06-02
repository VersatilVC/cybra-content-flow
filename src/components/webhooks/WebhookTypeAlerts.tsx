
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { WebhookType } from './webhookTypes';

interface WebhookTypeAlertsProps {
  selectedType: WebhookType | undefined;
  webhookType: string;
}

export function WebhookTypeAlerts({ selectedType, webhookType }: WebhookTypeAlertsProps) {
  if (!selectedType) return null;

  return (
    <>
      <Alert>
        <selectedType.icon className="h-4 w-4" />
        <AlertDescription>
          <strong>{selectedType.label}</strong><br />
          {selectedType.description}
        </AlertDescription>
      </Alert>

      {webhookType === 'derivative_generation' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This webhook will be triggered when users request content derivatives generation. 
            Your N8N workflow should process the content item and generate the requested derivative types (text, images, documents, etc.).
          </AlertDescription>
        </Alert>
      )}

      {webhookType === 'knowledge_base' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This webhook will be triggered when files or URLs are uploaded to knowledge bases. 
            Make sure your N8N workflow is configured to handle the payload structure and respond with status updates.
          </AlertDescription>
        </Alert>
      )}

      {webhookType === 'ai_chat' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This webhook will be triggered when users send chat messages. 
            Your N8N workflow should process the message and return a JSON response with 'response' and optional 'sources' fields.
          </AlertDescription>
        </Alert>
      )}

      {(webhookType === 'idea_engine' || webhookType === 'idea_auto_generator' || webhookType === 'brief_creator') && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> This webhook will be triggered for content idea processing. 
            Make sure your N8N workflow can handle the idea data structure and respond appropriately.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
