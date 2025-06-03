import { Zap, Plus, CheckCircle, XCircle, Clock, Database, AlertCircle, Wand2, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import { AddWebhookModal } from "@/components/AddWebhookModal";
import { EditWebhookModal } from "@/components/EditWebhookModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [preselectedType, setPreselectedType] = useState<string>('');
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

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'inactive': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getWebhookIcon = (webhookType: string) => {
    switch (webhookType) {
      case 'knowledge_base': return <Database className="w-5 h-5 text-purple-600" />;
      case 'derivative_generation': return <Wand2 className="w-5 h-5 text-purple-600" />;
      default: return <Zap className="w-5 h-5 text-purple-600" />;
    }
  };

  const activeWebhooks = webhooks.filter(w => w.is_active).length;
  const inactiveWebhooks = webhooks.filter(w => !w.is_active).length;
  const knowledgeBaseWebhook = webhooks.find(w => w.webhook_type === 'knowledge_base' && w.is_active);
  const derivativeWebhook = webhooks.find(w => w.webhook_type === 'derivative_generation' && w.is_active);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Webhooks</h1>
          <p className="text-gray-600">Manage webhook integrations and monitor their status</p>
        </div>
        <button 
          onClick={handleAddWebhook}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Webhook
        </button>
      </div>

      {/* Key Webhook Setups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Knowledge Base Webhook Setup */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Knowledge Base Processing</h2>
          </div>
          
          {!knowledgeBaseWebhook ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>No knowledge base webhook configured.</strong><br />
                    To process uploaded files and URLs, you need to set up a webhook that connects to your processing pipeline.
                  </div>
                  <Button onClick={handleAddKnowledgeBaseWebhook} className="ml-4">
                    <Database className="w-4 h-4 mr-2" />
                    Setup
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Knowledge base webhook is configured</p>
                  <p className="text-sm text-green-700">{knowledgeBaseWebhook.name}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleWebhookStatus(knowledgeBaseWebhook.id, knowledgeBaseWebhook.is_active)}
              >
                Disable
              </Button>
            </div>
          )}
        </div>

        {/* Derivative Generation Webhook Setup */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Wand2 className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Derivative Generation</h2>
          </div>
          
          {!derivativeWebhook ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>No derivative generation webhook configured.</strong><br />
                    To generate content derivatives like social posts and ads, set up a webhook for automated processing.
                  </div>
                  <Button onClick={handleAddDerivativeWebhook} className="ml-4">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Setup
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Derivative generation webhook is configured</p>
                  <p className="text-sm text-green-700">{derivativeWebhook.name}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleWebhookStatus(derivativeWebhook.id, derivativeWebhook.is_active)}
              >
                Disable
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Active</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{activeWebhooks}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Inactive</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{inactiveWebhooks}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Errors</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">0</div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total Webhooks</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{webhooks.length}</div>
        </div>
      </div>

      {/* Webhooks Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Webhook</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">URL</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Type</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                <th className="text-right py-4 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {webhooks.map((webhook) => (
                <tr key={webhook.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        {getWebhookIcon(webhook.webhook_type)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{webhook.name}</div>
                        {webhook.description && (
                          <div className="text-sm text-gray-500">{webhook.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded max-w-xs truncate block">
                      {webhook.webhook_url}
                    </code>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      webhook.webhook_type === 'knowledge_base' 
                        ? 'bg-purple-100 text-purple-800'
                        : webhook.webhook_type === 'derivative_generation'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {webhook.webhook_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {webhook.is_active ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            active
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-5 h-5 text-yellow-600" />
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            inactive
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => handleEditWebhook(webhook)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button 
                        onClick={() => toggleWebhookStatus(webhook.id, webhook.is_active)}
                        className={`text-sm font-medium ${
                          webhook.is_active 
                            ? 'text-red-600 hover:text-red-700' 
                            : 'text-green-600 hover:text-green-700'
                        }`}
                      >
                        {webhook.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {webhooks.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No webhooks configured yet. Add your first webhook to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
