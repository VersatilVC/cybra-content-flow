
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Zap, Link, Database, AlertCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AddWebhookModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWebhookAdded?: () => void;
  preselectedType?: string;
}

const webhookTypes = [
  { 
    value: 'knowledge_base', 
    label: 'Knowledge Base Processing', 
    icon: Database, 
    color: 'text-purple-600',
    description: 'Processes uploaded files and URLs for knowledge base integration'
  },
  { 
    value: 'content_processing', 
    label: 'Content Processing', 
    icon: Zap, 
    color: 'text-blue-600',
    description: 'General content processing and transformation'
  },
  { 
    value: 'notification', 
    label: 'Notification Webhook', 
    icon: Link, 
    color: 'text-green-600',
    description: 'Send notifications and alerts'
  },
];

export function AddWebhookModal({ open, onOpenChange, onWebhookAdded, preselectedType }: AddWebhookModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookType, setWebhookType] = useState(preselectedType || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Set defaults when knowledge base type is selected
  React.useEffect(() => {
    if (webhookType === 'knowledge_base' && !name) {
      setName('Knowledge Base Processing Webhook');
      setDescription('Webhook for processing files and URLs uploaded to knowledge bases');
    }
  }, [webhookType, name]);

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const testWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: 'Missing URL',
        description: 'Please enter a webhook URL to test.',
        variant: 'destructive',
      });
      return;
    }

    if (!validateUrl(webhookUrl)) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid webhook URL.',
        variant: 'destructive',
      });
      return;
    }

    setIsTestingWebhook(true);

    try {
      const testPayload = {
        test: true,
        timestamp: new Date().toISOString(),
        webhook_type: webhookType || 'test',
        message: 'This is a test webhook from Cyabra CMS'
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        toast({
          title: 'Webhook Test Successful! ✅',
          description: 'Your webhook endpoint is responding correctly.',
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Webhook test failed:', error);
      toast({
        title: 'Webhook Test Failed',
        description: error instanceof Error ? error.message : 'Failed to reach webhook endpoint',
        variant: 'destructive',
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !webhookUrl || !webhookType) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (!validateUrl(webhookUrl)) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid webhook URL.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to create webhooks.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if there's already an active webhook of this type
      if (webhookType === 'knowledge_base') {
        const { data: existingWebhooks } = await supabase
          .from('webhook_configurations')
          .select('id, is_active')
          .eq('webhook_type', 'knowledge_base')
          .eq('is_active', true);

        if (existingWebhooks && existingWebhooks.length > 0) {
          toast({
            title: 'Webhook Already Exists',
            description: 'There is already an active knowledge base webhook. Please disable it first or update the existing one.',
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }
      }

      const { error } = await supabase
        .from('webhook_configurations')
        .insert({
          name,
          description,
          webhook_url: webhookUrl,
          webhook_type: webhookType,
          created_by: user.id,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: 'Webhook Added Successfully! 🎉',
        description: `Webhook "${name}" has been configured and is now active.`,
      });

      // Reset form
      setName('');
      setDescription('');
      setWebhookUrl('');
      setWebhookType(preselectedType || '');
      onOpenChange(false);
      
      if (onWebhookAdded) {
        onWebhookAdded();
      }

    } catch (error) {
      console.error('Error adding webhook:', error);
      toast({
        title: 'Failed to Add Webhook',
        description: error instanceof Error ? error.message : 'Failed to add webhook',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="space-y-2">
            <Label htmlFor="webhook-name">Name *</Label>
            <Input
              id="webhook-name"
              placeholder="e.g., Knowledge Base Processing"
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

          {selectedType && (
            <Alert>
              <selectedType.icon className="h-4 w-4" />
              <AlertDescription>
                <strong>{selectedType.label}</strong><br />
                {selectedType.description}
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
                onClick={testWebhook}
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
