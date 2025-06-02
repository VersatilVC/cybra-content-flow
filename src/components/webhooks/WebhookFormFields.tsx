
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { webhookTypes } from './webhookTypes';
import LoadingSpinner from '@/components/LoadingSpinner';

interface WebhookFormFieldsProps {
  name: string;
  setName: (name: string) => void;
  webhookType: string;
  setWebhookType: (type: string) => void;
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  description: string;
  setDescription: (description: string) => void;
  isTestingWebhook: boolean;
  onTestWebhook: () => void;
}

export function WebhookFormFields({
  name,
  setName,
  webhookType,
  setWebhookType,
  webhookUrl,
  setWebhookUrl,
  description,
  setDescription,
  isTestingWebhook,
  onTestWebhook
}: WebhookFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="webhook-name">Name *</Label>
        <Input
          id="webhook-name"
          placeholder="e.g., AI Chat Assistant"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="webhook-type">Type *</Label>
        <Select value={webhookType} onValueChange={setWebhookType}>
          <SelectTrigger>
            <SelectValue placeholder="Select webhook type..." />
          </SelectTrigger>
          <SelectContent>
            {webhookTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <type.icon className="w-4 h-4" />
                  {type.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="webhook-url">Webhook URL *</Label>
        <div className="flex gap-2">
          <Input
            id="webhook-url"
            type="url"
            placeholder="https://your-n8n-instance.com/webhook/..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={onTestWebhook}
            disabled={!webhookUrl || isTestingWebhook}
          >
            {isTestingWebhook ? (
              <LoadingSpinner size="sm" />
            ) : (
              'Test'
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Copy your N8N webhook URL here. The webhook will receive POST requests with content data.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="webhook-description">Description</Label>
        <Textarea
          id="webhook-description"
          placeholder="Optional description of what this webhook does..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
    </>
  );
}
