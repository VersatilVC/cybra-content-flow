
import React from 'react';
import { Plus } from 'lucide-react';

interface WebhooksHeaderProps {
  onAddWebhook: () => void;
}

export function WebhooksHeader({ onAddWebhook }: WebhooksHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Webhooks</h1>
        <p className="text-gray-600">Manage webhook integrations and monitor their status</p>
      </div>
      <button 
        onClick={onAddWebhook}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Webhook
      </button>
    </div>
  );
}
