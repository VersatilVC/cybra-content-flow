
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WebhookConfig {
  id: string;
  name: string;
  webhook_url: string;
  webhook_type: string;
  is_active: boolean;
  created_at: string;
  description?: string;
}

export function useWebhooksData() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load webhook configurations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWebhookStatus = async (webhookId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('webhook_configurations')
        .update({ is_active: !currentStatus })
        .eq('id', webhookId);

      if (error) throw error;

      setWebhooks(prev => 
        prev.map(w => w.id === webhookId ? { ...w, is_active: !currentStatus } : w)
      );

      toast({
        title: 'Webhook Updated',
        description: `Webhook has been ${!currentStatus ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      console.error('Error updating webhook:', error);
      toast({
        title: 'Error',
        description: 'Failed to update webhook status',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  return {
    webhooks,
    isLoading,
    fetchWebhooks,
    toggleWebhookStatus
  };
}
