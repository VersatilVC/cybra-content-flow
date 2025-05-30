
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface KnowledgeBaseStats {
  name: string;
  description: string;
  itemCount: number;
  lastUpdated: string;
  color: string;
  tableName: string;
}

interface ContentSubmission {
  id: string;
  original_filename?: string;
  file_url?: string;
  knowledge_base: string;
  content_type: string;
  processing_status: string;
  file_size?: number;
  created_at: string;
  error_message?: string;
}

export function useKnowledgeBaseData() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseStats[]>([]);
  const [recentItems, setRecentItems] = useState<ContentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const knowledgeBaseConfig = [
    {
      name: "Cyabra Knowledge Base",
      description: "Company-specific information and resources",
      color: "bg-purple-500",
      tableName: "documents"
    },
    {
      name: "Industry Knowledge Base", 
      description: "Industry trends and insights",
      color: "bg-blue-500",
      tableName: "documents_industry"
    },
    {
      name: "News Knowledge Base",
      description: "Current news and updates", 
      color: "bg-green-500",
      tableName: "documents_news"
    },
    {
      name: "Competitor Knowledge Base",
      description: "Competitive intelligence and analysis",
      color: "bg-orange-500", 
      tableName: "documents_competitor"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch counts and last updated for each knowledge base
        const kbPromises = knowledgeBaseConfig.map(async (kb) => {
          const { count } = await supabase
            .from(kb.tableName)
            .select('*', { count: 'exact', head: true });

          const { data: latestItem } = await supabase
            .from(kb.tableName)
            .select('metadata')
            .order('id', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Extract date from metadata or use a default
          let lastUpdated = 'No data';
          if (latestItem?.metadata && typeof latestItem.metadata === 'object') {
            const metadata = latestItem.metadata as any;
            if (metadata.created_at) {
              lastUpdated = new Date(metadata.created_at).toLocaleDateString();
            } else if (metadata.timestamp) {
              lastUpdated = new Date(metadata.timestamp).toLocaleDateString();
            }
          }

          return {
            ...kb,
            itemCount: count || 0,
            lastUpdated
          };
        });

        const kbStats = await Promise.all(kbPromises);
        setKnowledgeBases(kbStats);

        // Fetch recent content submissions
        const { data: submissions } = await supabase
          .from('content_submissions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        setRecentItems(submissions || []);
      } catch (error) {
        console.error('Error fetching knowledge base data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { knowledgeBases, recentItems, isLoading };
}
