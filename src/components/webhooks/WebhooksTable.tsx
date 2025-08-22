
import React, { memo } from 'react';
import { CheckCircle, Clock, Database, Wand2, Zap, Edit } from 'lucide-react';

interface WebhookConfig {
  id: string;
  name: string;
  webhook_url: string;
  webhook_type: string;
  is_active: boolean;
  created_at: string;
  description?: string;
}

interface WebhooksTableProps {
  webhooks: WebhookConfig[];
  isLoading: boolean;
  onEditWebhook: (webhook: WebhookConfig) => void;
  onToggleWebhookStatus: (webhookId: string, currentStatus: boolean) => void;
}

export const WebhooksTable = memo(function WebhooksTable({
  webhooks,
  isLoading,
  onEditWebhook,
  onToggleWebhookStatus
}: WebhooksTableProps) {
  // Simple pure function - no need for useCallback optimization
  const getWebhookIcon = (webhookType: string) => {
    switch (webhookType) {
      case 'knowledge_base': return <Database className="w-5 h-5 text-purple-600" />;
      case 'derivative_generation': return <Wand2 className="w-5 h-5 text-purple-600" />;
      default: return <Zap className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-4 px-6 font-medium text-gray-900">Webhook</th>
              <th className="text-left py-4 px-6 font-medium text-gray-900">URL</th>
              <th className="text-left py-4 px-6 font-medium text-gray-900">Type</th>
              <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
              <th className="text-right py-4 px-6 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {webhooks.map((webhook) => (
              <tr key={webhook.id} className="hover:bg-gray-50">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      {getWebhookIcon(webhook.webhook_type)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{webhook.name}</div>
                      {webhook.description && (
                        <div className="text-sm text-gray-500">{webhook.description}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded max-w-xs truncate block">
                    {webhook.webhook_url}
                  </code>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    webhook.webhook_type === 'knowledge_base' 
                      ? 'bg-purple-100 text-purple-800'
                      : webhook.webhook_type === 'derivative_generation'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {webhook.webhook_type.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    {webhook.is_active ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          active
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          inactive
                        </span>
                      </>
                    )}
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex gap-2 justify-end">
                    <button 
                      onClick={() => onEditWebhook(webhook)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button 
                      onClick={() => onToggleWebhookStatus(webhook.id, webhook.is_active)}
                      className={`text-sm font-medium ${
                        webhook.is_active 
                          ? 'text-red-600 hover:text-red-700' 
                          : 'text-green-600 hover:text-green-700'
                      }`}
                    >
                      {webhook.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {webhooks.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No webhooks configured yet. Add your first webhook to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});
