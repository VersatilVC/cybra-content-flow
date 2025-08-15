import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface KnowledgeBaseStats {
  name: string;
  description: string;
  itemCount: number;
  lastUpdated: string;
  color: string;
  tableName: string;
  dbValue: string;
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

const knowledgeBaseConfig: Record<string, Omit<KnowledgeBaseStats, "itemCount" | "lastUpdated">> = {
  cyabra: {
    name: "Cyabra Knowledge Base",
    description: "Company-specific resources",
    color: "bg-primary",
    tableName: "documents",
    dbValue: "cyabra",
  },
  industry: {
    name: "Industry Knowledge Base", 
    description: "Industry trends and insights",
    color: "bg-blue-500",
    tableName: "documents_industry",
    dbValue: "industry",
  },
  competitor: {
    name: "Competitor Knowledge Base",
    description: "Competitive intelligence", 
    color: "bg-orange-500",
    tableName: "documents_competitor",
    dbValue: "competitor",
  },
  news: {
    name: "News Knowledge Base",
    description: "Current news and updates",
    color: "bg-green-500", 
    tableName: "documents_news",
    dbValue: "news",
  },
};

export function useKnowledgeBaseData() {
  const kbQuery = useQuery<{ knowledgeBases: KnowledgeBaseStats[] }>({
    queryKey: ["knowledge-bases", "stats"],
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      // First, get actual knowledge bases with data from content_submissions
      const { data: actualKbs } = await supabase
        .from("content_submissions")
        .select("knowledge_base")
        .eq("processing_status", "completed")
        .neq("knowledge_base", "content_creation")
        .neq("knowledge_base", "derivative_generation") 
        .neq("knowledge_base", "general_content");

      // Get unique knowledge bases that actually have data
      const uniqueKbs = [...new Set(actualKbs?.map(kb => kb.knowledge_base) || [])];
      
      const kbStats = await Promise.all(
        uniqueKbs.map(async (kbValue) => {
          const kbConfig = knowledgeBaseConfig[kbValue];
          if (!kbConfig) return null;

          // Run count and latest submission queries in parallel per KB
          const [countRes, latestRes] = await Promise.all([
            supabase
              .from(kbConfig.tableName as any)
              .select("*", { count: "planned", head: true }),
            supabase
              .from("content_submissions")
              .select("created_at")
              .eq("knowledge_base", kbConfig.dbValue)
              .eq("processing_status", "completed")
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle(),
          ]);

          const count = countRes.count || 0;
          const latest = latestRes?.data as { created_at?: string } | null;

          // Only return knowledge bases that have data
          if (count === 0) return null;

          let lastUpdated = "No data";
          if (latest?.created_at) {
            lastUpdated = new Date(latest.created_at).toLocaleDateString();
          }

          return {
            ...kbConfig,
            itemCount: count,
            lastUpdated,
          } as KnowledgeBaseStats;
        })
      );

      // Filter out null values (empty knowledge bases)
      const filteredKbStats = kbStats.filter(Boolean) as KnowledgeBaseStats[];

      return { knowledgeBases: filteredKbStats };
    },
  });

  const recentQuery = useQuery<{ recentItems: ContentSubmission[] }>({
    queryKey: ["knowledge-bases", "recent"],
    staleTime: 15_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data: submissions } = await supabase
        .from("content_submissions")
        .select(
          "id,original_filename,file_url,knowledge_base,content_type,processing_status,file_size,created_at,error_message"
        )
        .in("knowledge_base", Object.keys(knowledgeBaseConfig))
        .neq("processing_status", "failed")
        .order("created_at", { ascending: false })
        .limit(10);

      return { recentItems: submissions || [] };
    },
  });

  return {
    knowledgeBases: kbQuery.data?.knowledgeBases || [],
    recentItems: recentQuery.data?.recentItems || [],
    isLoading: kbQuery.isLoading || recentQuery.isLoading,
  };
}