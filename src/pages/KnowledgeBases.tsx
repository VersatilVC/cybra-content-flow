
import { Database, Plus, Search, Filter, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { AddContentModal } from "@/components/AddContentModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const KnowledgeBases = () => {
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [hasKnowledgeBaseWebhook, setHasKnowledgeBaseWebhook] = useState(false);
  const [isCheckingWebhook, setIsCheckingWebhook] = useState(true);

  const knowledgeBases = [
    {
      id: 1,
      name: "Cyabra Knowledge Base",
      description: "Company-specific information and resources",
      itemCount: 156,
      lastUpdated: "2 hours ago",
      color: "bg-purple-500"
    },
    {
      id: 2,
      name: "Industry Knowledge Base",
      description: "Industry trends and insights",
      itemCount: 89,
      lastUpdated: "1 day ago",
      color: "bg-blue-500"
    },
    {
      id: 3,
      name: "News Knowledge Base",
      description: "Current news and updates",
      itemCount: 234,
      lastUpdated: "3 hours ago",
      color: "bg-green-500"
    },
    {
      id: 4,
      name: "Competitor Knowledge Base",
      description: "Competitive intelligence and analysis",
      itemCount: 67,
      lastUpdated: "5 hours ago",
      color: "bg-orange-500"
    }
  ];

  const checkWebhookConfiguration = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_configurations')
        .select('id')
        .eq('webhook_type', 'knowledge_base')
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error checking webhook configuration:', error);
        return;
      }

      setHasKnowledgeBaseWebhook(!!data);
    } catch (error) {
      console.error('Error checking webhook configuration:', error);
    } finally {
      setIsCheckingWebhook(false);
    }
  };

  useEffect(() => {
    checkWebhookConfiguration();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Bases</h1>
          <p className="text-gray-600">Manage your content repositories and data sources</p>
        </div>
        <button 
          onClick={() => setIsAddContentOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Content
        </button>
      </div>

      {/* Webhook Status Alert */}
      {!isCheckingWebhook && (
        <div className="mb-6">
          {!hasKnowledgeBaseWebhook ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Webhook Configuration Required</strong><br />
                    To process uploaded content, you need to configure a knowledge base webhook in the Webhooks section.
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/admin/webhooks">
                      Configure Webhook
                    </Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Webhook Configured</strong> - Your knowledge base is ready to process uploaded content.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search knowledge bases..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {knowledgeBases.map((kb) => (
          <div key={kb.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 ${kb.color} rounded-lg flex items-center justify-center`}>
                <Database className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">{kb.name}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">{kb.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Items:</span>
                <span className="font-medium">{kb.itemCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last updated:</span>
                <span className="font-medium">{kb.lastUpdated}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AddContentModal 
        open={isAddContentOpen}
        onOpenChange={setIsAddContentOpen}
      />
    </div>
  );
};

export default KnowledgeBases;
