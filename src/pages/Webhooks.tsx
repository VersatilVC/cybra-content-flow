
import React, { useState } from "react";
import { AddWebhookModal } from "@/components/AddWebhookModal";
import { EditWebhookModal } from "@/components/EditWebhookModal";
import { useWebhooksData } from "@/hooks/useWebhooksData";
import { WebhooksHeader } from "@/components/webhooks/WebhooksHeader";
import { KeyWebhookSetups } from "@/components/webhooks/KeyWebhookSetups";
import { WebhooksStats } from "@/components/webhooks/WebhooksStats";
import { WebhooksTable } from "@/components/webhooks/WebhooksTable";

interface WebhookConfig {
  id: string;
  name: string;
  webhook_url: string;
  webhook_type: string;
  is_active: boolean;
  created_at: string;
  description?: string;
}

const Webhooks = () => {
  const [isAddWebhookOpen, setIsAddWebhookOpen] = useState(false);
  const [isEditWebhookOpen, setIsEditWebhookOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);
  const [preselectedType, setPreselectedType] = useState<string>('');
  
  const { webhooks, isLoading, fetchWebhooks, toggleWebhookStatus } = useWebhooksData();

  const handleEditWebhook = (webhook: WebhookConfig) => {
    setSelectedWebhook(webhook);
    setIsEditWebhookOpen(true);
  };

  const handleAddKnowledgeBaseWebhook = () => {
    setPreselectedType('knowledge_base');
    setIsAddWebhookOpen(true);
  };

  const handleAddDerivativeWebhook = () => {
    setPreselectedType('derivative_generation');
    setIsAddWebhookOpen(true);
  };

  const handleAddWebhook = () => {
    setPreselectedType('');
    setIsAddWebhookOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <WebhooksHeader onAddWebhook={handleAddWebhook} />
      
      <KeyWebhookSetups
        webhooks={webhooks}
        onAddKnowledgeBaseWebhook={handleAddKnowledgeBaseWebhook}
        onAddDerivativeWebhook={handleAddDerivativeWebhook}
        onToggleWebhookStatus={toggleWebhookStatus}
      />

      <WebhooksStats webhooks={webhooks} />

      <WebhooksTable
        webhooks={webhooks}
        isLoading={isLoading}
        onEditWebhook={handleEditWebhook}
        onToggleWebhookStatus={toggleWebhookStatus}
      />

      <AddWebhookModal 
        open={isAddWebhookOpen}
        onOpenChange={setIsAddWebhookOpen}
        onWebhookAdded={fetchWebhooks}
        preselectedType={preselectedType}
      />

      <EditWebhookModal 
        open={isEditWebhookOpen}
        onOpenChange={setIsEditWebhookOpen}
        onWebhookUpdated={fetchWebhooks}
        webhook={selectedWebhook}
      />
    </div>
  );
};

export default Webhooks;
