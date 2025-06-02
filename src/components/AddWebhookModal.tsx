
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useWebhookModal } from '@/hooks/useWebhookModal';
import { webhookTypes, getWebhookDefaults } from '@/components/webhooks/webhookTypes';
import { WebhookTypeAlerts } from '@/components/webhooks/WebhookTypeAlerts';
import { WebhookFormFields } from '@/components/webhooks/WebhookFormFields';

interface AddWebhookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWebhookAdded?: () => void;
  preselectedType?: string;
}

export function AddWebhookModal({ open, onOpenChange, onWebhookAdded, preselectedType }: AddWebhookModalProps) {
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
    submitWebhook,
    resetForm
  } = useWebhookModal();

  // Reset form when modal opens with preselected type
  React.useEffect(() => {
    if (open) {
      resetForm(preselectedType);
      
      // Set defaults only if preselected type is provided and we don't already have a name
      if (preselectedType && !name) {
        const defaults = getWebhookDefaults(preselectedType);
        setName(defaults.name);
        setDescription(defaults.description);
      }
    }
  }, [open, preselectedType, resetForm, setName, setDescription, name]);

  const handleSubmit = async () => {
    await submitWebhook(
      () => onOpenChange(false),
      onWebhookAdded
    );
  };

  const selectedType = webhookTypes.find(type => type.value === webhookType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Add New Webhook
          </DialogTitle>
          <DialogDescription>
            Configure a new webhook endpoint for processing integration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <WebhookFormFields
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
                  Adding...
                </>
              ) : (
                'Add Webhook'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
