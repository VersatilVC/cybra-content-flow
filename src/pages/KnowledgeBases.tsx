
import { Database, Plus, AlertCircle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { AddContentModal } from "@/components/AddContentModal";
import { RecentContentItem } from "@/components/RecentContentItem";
import { useKnowledgeBaseData } from "@/hooks/useKnowledgeBaseData";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const KnowledgeBases = () => {
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [hasKnowledgeBaseWebhook, setHasKnowledgeBaseWebhook] = useState(false);
  const [isCheckingWebhook, setIsCheckingWebhook] = useState(true);
  const { knowledgeBases, recentItems, isLoading } = useKnowledgeBaseData();

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

  const getKnowledgeBaseStatus = (itemCount: number, lastUpdated: string) => {
    if (itemCount === 0) {
      return { icon: Clock, color: "text-yellow-500", status: "Empty" };
    }
    if (lastUpdated === 'No data') {
      return { icon: AlertCircle, color: "text-orange-500", status: "Needs attention" };
    }
    return { icon: CheckCircle, color: "text-green-500", status: "Active" };
  };

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

      {/* Knowledge Base Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          // Loading skeletons
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-3 w-full mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))
        ) : (
          knowledgeBases.map((kb, index) => {
            const status = getKnowledgeBaseStatus(kb.itemCount, kb.lastUpdated);
            const StatusIcon = status.icon;
            
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 ${kb.color} rounded-lg flex items-center justify-center`}>
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{kb.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <StatusIcon className={`w-3 h-3 ${status.color}`} />
                      <span className={`text-xs ${status.color}`}>{status.status}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{kb.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Items:</span>
                    <span className="font-medium flex items-center gap-1">
                      {kb.itemCount.toLocaleString()}
                      {kb.itemCount > 0 && <TrendingUp className="w-3 h-3 text-green-500" />}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last updated:</span>
                    <span className="font-medium">{kb.lastUpdated}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Recent Content Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Latest Content</h2>
            <p className="text-gray-600 text-sm">Recent files and URLs added to your knowledge bases</p>
          </div>
          {recentItems.length > 0 && (
            <span className="text-sm text-gray-500">
              {recentItems.length} recent items
            </span>
          )}
        </div>

        {isLoading ? (
          // Loading skeletons for recent items
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : recentItems.length > 0 ? (
          <div className="space-y-4">
            {recentItems.map((item) => (
              <RecentContentItem
                key={item.id}
                id={item.id}
                originalFilename={item.original_filename}
                fileUrl={item.file_url}
                knowledgeBase={item.knowledge_base}
                contentType={item.content_type}
                processingStatus={item.processing_status}
                fileSize={item.file_size}
                createdAt={item.created_at}
                errorMessage={item.error_message}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
            <p className="text-gray-600 mb-4">Start by uploading files or adding URLs to your knowledge bases.</p>
            <Button onClick={() => setIsAddContentOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Content
            </Button>
          </div>
        )}
      </div>

      <AddContentModal 
        open={isAddContentOpen}
        onOpenChange={setIsAddContentOpen}
      />
    </div>
  );
};

export default KnowledgeBases;
