
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
      console.log('useWebhooksData: Fetching webhook configurations');
      
      const { data, error } = await supabase
        .from('webhook_configurations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useWebhooksData: Error fetching webhooks:', error);
        throw error;
      }
      
      console.log('useWebhooksData: Successfully fetched webhooks:', data?.length || 0);
      setWebhooks(data || []);
    } catch (error) {
      console.error('useWebhooksData: Failed to fetch webhooks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load webhook configurations. Please check your permissions.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWebhookStatus = async (webhookId: string, currentStatus: boolean) => {
    try {
      console.log('useWebhooksData: Toggling webhook status:', webhookId, 'from', currentStatus, 'to', !currentStatus);
      
      const { error } = await supabase
        .from('webhook_configurations')
        .update({ is_active: !currentStatus })
        .eq('id', webhookId);

      if (error) {
        console.error('useWebhooksData: Error updating webhook:', error);
        throw error;
      }

      setWebhooks(prev => 
        prev.map(w => w.id === webhookId ? { ...w, is_active: !currentStatus } : w)
      );

      toast({
        title: 'Webhook Updated',
        description: `Webhook has been ${!currentStatus ? 'enabled' : 'disabled'}.`,
      });
      
      console.log('useWebhooksData: Successfully updated webhook status');
    } catch (error) {
      console.error('useWebhooksData: Failed to update webhook:', error);
      toast({
        title: 'Error',
        description: 'Failed to update webhook status. Please check your permissions.',
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
