
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useWebhookModal } from '@/hooks/useWebhookModal';
import { webhookTypes, getWebhookDefaults } from '@/components/webhooks/webhookTypes';
import { WebhookTypeAlerts } from '@/components/webhooks/WebhookTypeAlerts';
import { SecureWebhookFormFields } from '@/components/webhooks/SecureWebhookFormFields';

interface WebhookConfig {
  id: string;
  name: string;
  webhook_url: string;
  webhook_type: string;
  is_active: boolean;
  created_at: string;
  description?: string;
}

interface EditWebhookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWebhookUpdated?: () => void;
  webhook: WebhookConfig | null;
}

export function EditWebhookModal({ open, onOpenChange, onWebhookUpdated, webhook }: EditWebhookModalProps) {
  const {
    name,
    setName,
    description,
    setDescription,
    webhookUrl,
    setWebhookUrl,
    webhookType,
    setWebhookType,
    isSubmitting,
    isTestingWebhook,
    testWebhook,
    updateWebhook,
    resetForm
  } = useWebhookModal();

  // Load webhook data when modal opens
  useEffect(() => {
    if (open && webhook) {
      setName(webhook.name);
      setDescription(webhook.description || '');
      setWebhookUrl(webhook.webhook_url);
      setWebhookType(webhook.webhook_type);
    } else if (!open) {
      resetForm();
    }
  }, [open, webhook, setName, setDescription, setWebhookUrl, setWebhookType, resetForm]);

  const handleSubmit = async () => {
    if (!webhook) return;
    
    await updateWebhook(
      webhook.id,
      () => onOpenChange(false),
      onWebhookUpdated
    );
  };

  const selectedType = webhookTypes.find(type => type.value === webhookType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Edit Webhook
          </DialogTitle>
          <DialogDescription>
            Update your webhook configuration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <SecureWebhookFormFields
            name={name}
            setName={setName}
            webhookType={webhookType}
            setWebhookType={setWebhookType}
            webhookUrl={webhookUrl}
            setWebhookUrl={setWebhookUrl}
            description={description}
            setDescription={setDescription}
            isTestingWebhook={isTestingWebhook}
            onTestWebhook={testWebhook}
          />

          <WebhookTypeAlerts selectedType={selectedType} webhookType={webhookType} />

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name || !webhookUrl || !webhookType || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                'Update Webhook'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
