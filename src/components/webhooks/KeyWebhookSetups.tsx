
import React from 'react';
import { Database, Wand2, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface WebhookConfig {
  id: string;
  name: string;
  webhook_url: string;
  webhook_type: string;
  is_active: boolean;
  created_at: string;
  description?: string;
}

interface KeyWebhookSetupsProps {
  webhooks: WebhookConfig[];
  onAddKnowledgeBaseWebhook: () => void;
  onAddDerivativeWebhook: () => void;
  onAddGeneralContentWebhook: () => void;
  onToggleWebhookStatus: (webhookId: string, currentStatus: boolean) => void;
}

export function KeyWebhookSetups({
  webhooks,
  onAddKnowledgeBaseWebhook,
  onAddDerivativeWebhook,
  onAddGeneralContentWebhook,
  onToggleWebhookStatus
}: KeyWebhookSetupsProps) {
  const knowledgeBaseWebhook = webhooks.find(w => w.webhook_type === 'knowledge_base' && w.is_active);
  const derivativeWebhook = webhooks.find(w => w.webhook_type === 'derivative_generation' && w.is_active);
  const generalWebhook = webhooks.find(w => w.webhook_type === 'general_content' && w.is_active);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Knowledge Base Webhook Setup */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Knowledge Base Processing</h2>
        </div>
        
        {!knowledgeBaseWebhook ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>No knowledge base webhook configured.</strong><br />
                  To process uploaded files and URLs, you need to set up a webhook that connects to your processing pipeline.
                </div>
                <Button onClick={onAddKnowledgeBaseWebhook} className="ml-4">
                  <Database className="w-4 h-4 mr-2" />
                  Setup
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Knowledge base webhook is configured</p>
                <p className="text-sm text-green-700">{knowledgeBaseWebhook.name}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleWebhookStatus(knowledgeBaseWebhook.id, knowledgeBaseWebhook.is_active)}
            >
              Disable
            </Button>
          </div>
        )}
      </div>

      {/* Derivative Generation Webhook Setup */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Wand2 className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">Derivative Generation</h2>
        </div>
        
        {!derivativeWebhook ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>No derivative generation webhook configured.</strong><br />
                  To generate content derivatives like social posts and ads, set up a webhook for automated processing.
                </div>
                <Button onClick={onAddDerivativeWebhook} className="ml-4">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Setup
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Derivative generation webhook is configured</p>
                <p className="text-sm text-green-700">{derivativeWebhook.name}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleWebhookStatus(derivativeWebhook.id, derivativeWebhook.is_active)}
            >
              Disable
            </Button>
          </div>
        )}
      </div>

      {/* General Content Processing Webhook Setup */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">General Content Processing</h2>
        </div>
        {!generalWebhook ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>No general content webhook configured.</strong><br />
                  To process general content submissions (text, links, files), set up your processing webhook.
                </div>
                <Button onClick={onAddGeneralContentWebhook} className="ml-4">
                  <FileText className="w-4 h-4 mr-2" />
                  Setup
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">General content webhook is configured</p>
                <p className="text-sm text-green-700">{generalWebhook.name}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleWebhookStatus(generalWebhook.id, generalWebhook.is_active)}
            >
              Disable
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

