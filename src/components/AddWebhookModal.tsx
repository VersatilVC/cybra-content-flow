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
import { Zap, Link, Database, AlertCircle, MessageSquare, Lightbulb, FileText, Briefcase, Wand2 } from 'lucide-react';
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
    value: 'ai_chat', 
    label: 'AI Chat Assistant', 
    icon: MessageSquare, 
    color: 'text-blue-600',
    description: 'Handles AI chat conversations and responses'
  },
  { 
    value: 'idea_engine', 
    label: 'Idea Engine', 
    icon: Lightbulb, 
    color: 'text-yellow-600',
    description: 'Processes general content idea submissions'
  },
  { 
    value: 'idea_auto_generator', 
    label: 'Idea Auto Generator', 
    icon: Zap, 
    color: 'text-green-600',
    description: 'Automatically generates content ideas on schedule or demand'
  },
  { 
    value: 'brief_creator', 
    label: 'Brief Creator', 
    icon: Briefcase, 
    color: 'text-indigo-600',
    description: 'Creates detailed content briefs from processed ideas'
  },
  { 
    value: 'derivative_generation', 
    label: 'Derivative Generation', 
    icon: Wand2, 
    color: 'text-purple-600',
    description: 'Generates content derivatives like social posts, ads, and summaries from main content'
  },
  { 
    value: 'content_processing', 
    label: 'Content Processing', 
    icon: FileText, 
    color: 'text-green-600',
    description: 'General content processing and transformation'
  },
  { 
    value: 'notification', 
    label: 'Notification Webhook', 
    icon: Link, 
    color: 'text-orange-600',
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

  // Set defaults when webhook types are selected
  React.useEffect(() => {
    if (webhookType === 'knowledge_base' && !name) {
      setName('Knowledge Base Processing Webhook');
      setDescription('Webhook for processing files and URLs uploaded to knowledge bases');
    } else if (webhookType === 'ai_chat' && !name) {
      setName('AI Chat Assistant Webhook');
      setDescription('Webhook for handling AI chat conversations and generating responses');
    } else if (webhookType === 'idea_engine' && !name) {
      setName('Idea Engine Webhook');
      setDescription('Webhook for processing general content idea submissions');
    } else if (webhookType === 'idea_auto_generator' && !name) {
      setName('Idea Auto Generator Webhook');
      setDescription('Webhook for automatically generating content ideas');
    } else if (webhookType === 'brief_creator' && !name) {
      setName('Brief Creator Webhook');
      setDescription('Webhook for creating detailed content briefs from ideas');
    } else if (webhookType === 'derivative_generation' && !name) {
      setName('Derivative Generation Webhook');
      setDescription('Webhook for generating content derivatives like social posts, ads, and summaries');
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
      // Check if there's already an active webhook of this type for certain types
      if (['knowledge_base', 'ai_chat', 'idea_engine', 'idea_auto_generator', 'brief_creator', 'derivative_generation'].includes(webhookType)) {
        const { data: existingWebhooks } = await supabase
          .from('webhook_configurations')
          .select('id, is_active')
          .eq('webhook_type', webhookType)
          .eq('is_active', true);

        if (existingWebhooks && existingWebhooks.length > 0) {
          const typeLabels: Record<string, string> = {
            'knowledge_base': 'knowledge base',
            'ai_chat': 'AI chat',
            'idea_engine': 'idea engine',
            'idea_auto_generator': 'idea auto generator',
            'brief_creator': 'brief creator',
            'derivative_generation': 'derivative generation'
          };
          
          toast({
            title: 'Webhook Already Exists',
            description: `There is already an active ${typeLabels[webhookType]} webhook. Please disable it first or update the existing one.`,
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

          {selectedType && (
            <Alert>
              <selectedType.icon className="h-4 w-4" />
              <AlertDescription>
                <strong>{selectedType.label}</strong><br />
                {selectedType.description}
              </AlertDescription>
            </Alert>
          )}

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
