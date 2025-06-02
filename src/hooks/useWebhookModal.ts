
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useWebhookModal() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookType, setWebhookType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

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

  const submitWebhook = async (onSuccess?: () => void, onWebhookAdded?: () => void) => {
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
      setWebhookType('');
      
      if (onSuccess) onSuccess();
      if (onWebhookAdded) onWebhookAdded();

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

  const resetForm = useCallback((preselectedType?: string) => {
    setName('');
    setDescription('');
    setWebhookUrl('');
    setWebhookType(preselectedType || '');
  }, []);

  return {
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
  };
}
