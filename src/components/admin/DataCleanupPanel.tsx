import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CleanupCandidate {
  entity_type: string;
  entity_id: string;
  title: string;
  status: string;
  updated_at: string;
  retry_count: number;
  last_error_message: string;
}

interface CleanupResult {
  cleaned_ideas: number;
  cleaned_briefs: number;
  cleaned_items: number;
  cleaned_derivatives: number;
  cleaned_suggestions: number;
  total_cleaned: number;
  cleanup_summary: any;
}

export function DataCleanupPanel() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [olderThanDays, setOlderThanDays] = useState(30);
  const [batchSize, setBatchSize] = useState(100);
  const [dryRun, setDryRun] = useState(true);
  const [candidates, setCandidates] = useState<CleanupCandidate[]>([]);
  const [lastResult, setLastResult] = useState<CleanupResult | null>(null);

  const fetchCleanupCandidates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_cleanup_candidates', {
        older_than_days: olderThanDays
      });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching cleanup candidates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cleanup candidates",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runCleanup = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-historical-data', {
        body: {
          olderThanDays,
          batchSize,
          dryRun
        }
      });

      if (error) throw error;
      
      setLastResult(data.result);
      
      toast({
        title: dryRun ? "Dry Run Complete" : "Cleanup Complete",
        description: data.message,
        variant: "default",
      });

      // Refresh candidates after actual cleanup
      if (!dryRun) {
        await fetchCleanupCandidates();
      }
    } catch (error) {
      console.error('Error running cleanup:', error);
      toast({
        title: "Error",
        description: "Failed to run cleanup operation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getEntityTypeColor = (type: string) => {
    switch (type) {
      case 'content_idea': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'content_brief': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'content_item': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'content_derivative': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'content_suggestion': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Historical Data Cleanup
          </CardTitle>
          <CardDescription>
            Clean up old failed records that have exceeded retry limits. 
            Use dry run first to preview what will be cleaned.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="olderThanDays">Older than (days)</Label>
              <Input
                id="olderThanDays"
                type="number"
                value={olderThanDays}
                onChange={(e) => setOlderThanDays(Number(e.target.value))}
                min={1}
                max={365}
              />
            </div>
            <div>
              <Label htmlFor="batchSize">Batch size</Label>
              <Input
                id="batchSize"
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                min={1}
                max={1000}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="dryRun"
                checked={dryRun}
                onCheckedChange={setDryRun}
              />
              <Label htmlFor="dryRun">Dry run (preview only)</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={fetchCleanupCandidates}
              disabled={isLoading}
              variant="outline"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Candidates
            </Button>
            <Button
              onClick={runCleanup}
              disabled={isLoading}
              variant={dryRun ? "default" : "destructive"}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {dryRun ? "Run Dry Run" : "Execute Cleanup"}
            </Button>
          </div>

          {!dryRun && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This will permanently delete records. Make sure to run a dry run first!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Last Cleanup Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Ideas</div>
                <div className="text-2xl font-bold">{lastResult.cleaned_ideas}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Briefs</div>
                <div className="text-2xl font-bold">{lastResult.cleaned_briefs}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Items</div>
                <div className="text-2xl font-bold">{lastResult.cleaned_items}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Derivatives</div>
                <div className="text-2xl font-bold">{lastResult.cleaned_derivatives}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Suggestions</div>
                <div className="text-2xl font-bold">{lastResult.cleaned_suggestions}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Total</div>
                <div className="text-2xl font-bold text-primary">{lastResult.total_cleaned}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {candidates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cleanup Candidates ({candidates.length})</CardTitle>
            <CardDescription>
              Records that would be cleaned up based on current criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {candidates.map((candidate) => (
                <div
                  key={`${candidate.entity_type}-${candidate.entity_id}`}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="secondary" 
                        className={getEntityTypeColor(candidate.entity_type)}
                      >
                        {candidate.entity_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Retry: {candidate.retry_count}/3
                      </span>
                    </div>
                    <div className="font-medium truncate">{candidate.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Updated: {new Date(candidate.updated_at).toLocaleDateString()}
                    </div>
                    {candidate.last_error_message && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1 truncate">
                        {candidate.last_error_message}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}