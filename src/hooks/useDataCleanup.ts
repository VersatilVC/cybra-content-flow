import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface CleanupCandidate {
  entity_type: string;
  entity_id: string;
  title: string;
  status: string;
  updated_at: string;
  retry_count: number;
  last_error_message: string;
}

export interface CleanupResult {
  cleaned_ideas: number;
  cleaned_briefs: number;
  cleaned_items: number;
  cleaned_derivatives: number;
  cleaned_suggestions: number;
  total_cleaned: number;
  cleanup_summary: any;
}

export function useDataCleanup() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [candidates, setCandidates] = useState<CleanupCandidate[]>([]);
  const [lastResult, setLastResult] = useState<CleanupResult | null>(null);

  const fetchCleanupCandidates = async (olderThanDays: number = 30) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_cleanup_candidates', {
        older_than_days: olderThanDays
      });

      if (error) throw error;
      setCandidates(data || []);
      
      return data || [];
    } catch (error) {
      console.error('Error fetching cleanup candidates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cleanup candidates",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const runCleanup = async (options: {
    olderThanDays: number;
    batchSize: number;
    dryRun: boolean;
  }) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-historical-data', {
        body: options
      });

      if (error) throw error;
      
      setLastResult(data.result);
      
      toast({
        title: options.dryRun ? "Dry Run Complete" : "Cleanup Complete",
        description: data.message,
        variant: "default",
      });

      // Refresh candidates after actual cleanup
      if (!options.dryRun) {
        await fetchCleanupCandidates(options.olderThanDays);
      }

      return data.result;
    } catch (error) {
      console.error('Error running cleanup:', error);
      toast({
        title: "Error",
        description: "Failed to run cleanup operation",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    candidates,
    lastResult,
    fetchCleanupCandidates,
    runCleanup,
  };
}