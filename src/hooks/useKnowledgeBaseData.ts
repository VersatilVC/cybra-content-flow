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

const knowledgeBaseConfig: Array<Omit<KnowledgeBaseStats, "itemCount" | "lastUpdated">> = [
  {
    name: "Cyabra Knowledge Base",
    description: "Company-specific resources",
    color: "bg-purple-500",
    tableName: "documents",
    dbValue: "cyabra",
  },
  {
    name: "Industry Knowledge Base",
    description: "Industry trends and insights",
    color: "bg-blue-500",
    tableName: "documents_industry",
    dbValue: "industry",
  },
  {
    name: "News Knowledge Base",
    description: "Current news and updates",
    color: "bg-green-500",
    tableName: "documents_news",
    dbValue: "news",
  },
  {
    name: "Competitor Knowledge Base",
    description: "Competitive intelligence",
    color: "bg-orange-500",
    tableName: "documents_competitor",
    dbValue: "competitor",
  },
];

export function useKnowledgeBaseData() {
  const kbQuery = useQuery<{ knowledgeBases: KnowledgeBaseStats[] }>({
    queryKey: ["knowledge-bases", "stats"],
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const kbStats = await Promise.all(
        knowledgeBaseConfig.map(async (kb) => {
          // Run count and latest submission queries in parallel per KB
          const [countRes, latestRes] = await Promise.all([
            supabase
              .from(kb.tableName as any)
              .select("*", { count: "planned", head: true }),
            supabase
              .from("content_submissions")
              .select("created_at")
              .eq("knowledge_base", kb.dbValue)
              .eq("processing_status", "completed")
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle(),
          ]);

          const count = countRes.count || 0;
          const latest = (latestRes as any)?.data as { created_at?: string } | null;

          let lastUpdated = "No data";
          if (latest?.created_at) {
            lastUpdated = new Date(latest.created_at).toLocaleDateString();
          }

          return {
            ...kb,
            itemCount: count,
            lastUpdated,
          } as KnowledgeBaseStats;
        })
      );

      return { knowledgeBases: kbStats };
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
