
import { Database, Plus, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useState } from "react";
import { AddContentModal } from "@/components/AddContentModal";
import { RecentContentItem } from "@/components/RecentContentItem";
import { useKnowledgeBaseData } from "@/hooks/useKnowledgeBaseData";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const KnowledgeBases = () => {
  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const { knowledgeBases, recentItems, isLoading } = useKnowledgeBaseData();

  const getKnowledgeBaseStatus = (itemCount: number) => {
    if (itemCount === 0) {
      return { icon: Clock, color: "text-yellow-500", status: "Empty" };
    }
    return { icon: CheckCircle, color: "text-green-500", status: "Active" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 to-white">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Knowledge Bases</h1>
            <p className="text-muted-foreground">Manage your content repositories and data sources</p>
          </div>
          <Button 
            onClick={() => setIsAddContentOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Content
          </Button>
        </div>

        {/* Knowledge Base Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            // Loading skeletons
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border-0 p-6">
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
              const status = getKnowledgeBaseStatus(kb.itemCount);
              const StatusIcon = status.icon;
              
              return (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border-0 p-6 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 ${kb.color} rounded-lg flex items-center justify-center shadow-sm`}>
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{kb.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <StatusIcon className={`w-3 h-3 ${status.color}`} />
                        <span className={`text-xs ${status.color} font-medium`}>{status.status}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{kb.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items:</span>
                      <span className="font-medium flex items-center gap-1 text-foreground">
                        {kb.itemCount.toLocaleString()}
                        {kb.itemCount > 0 && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last updated:</span>
                      <span className="font-medium text-foreground">{kb.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Recent Content Items */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border-0 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Latest Content</h2>
              <p className="text-muted-foreground text-sm">Recent files and URLs added to your knowledge bases</p>
            </div>
            {recentItems.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {recentItems.length} recent items
              </span>
            )}
          </div>

          {isLoading ? (
            // Loading skeletons for recent items
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border border-border/50 rounded-lg p-4">
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
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No content yet</h3>
              <p className="text-muted-foreground mb-4">Start by uploading files or adding URLs to your knowledge bases.</p>
              <Button onClick={() => setIsAddContentOpen(true)} className="bg-primary hover:bg-primary/90">
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
    </div>
  );
};

export default KnowledgeBases;
