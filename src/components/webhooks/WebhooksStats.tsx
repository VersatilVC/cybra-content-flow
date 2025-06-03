
import React from 'react';
import { CheckCircle, Clock, XCircle, Zap } from 'lucide-react';

interface WebhookConfig {
  id: string;
  name: string;
  webhook_url: string;
  webhook_type: string;
  is_active: boolean;
  created_at: string;
  description?: string;
}

interface WebhooksStatsProps {
  webhooks: WebhookConfig[];
}

export function WebhooksStats({ webhooks }: WebhooksStatsProps) {
  const activeWebhooks = webhooks.filter(w => w.is_active).length;
  const inactiveWebhooks = webhooks.filter(w => !w.is_active).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-sm font-medium text-gray-600">Active</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{activeWebhooks}</div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <span className="text-sm font-medium text-gray-600">Inactive</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{inactiveWebhooks}</div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <span className="text-sm font-medium text-gray-600">Errors</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">0</div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-600">Total Webhooks</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{webhooks.length}</div>
      </div>
    </div>
  );
}
