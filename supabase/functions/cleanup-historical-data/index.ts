import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  // Security headers
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
}

interface CleanupRequest {
  olderThanDays?: number;
  batchSize?: number;
  dryRun?: boolean;
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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const { olderThanDays = 30, batchSize = 100, dryRun = true }: CleanupRequest = 
      req.method === 'POST' ? await req.json() : {};

    console.log(`Starting cleanup process - Dry run: ${dryRun}, Older than: ${olderThanDays} days, Batch size: ${batchSize}`);

    // Call the cleanup function
    const { data, error } = await supabase.rpc('cleanup_historical_data', {
      cleanup_older_than_days: olderThanDays,
      batch_size: batchSize,
      dry_run: dryRun
    });

    if (error) {
      console.error('Cleanup function error:', error);
      return new Response(
        JSON.stringify({ error: 'Cleanup function failed', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const result = data[0] as CleanupResult;
    
    console.log('Cleanup completed:', {
      mode: dryRun ? 'dry_run' : 'actual',
      totalCleaned: result.total_cleaned,
      breakdown: {
        ideas: result.cleaned_ideas,
        briefs: result.cleaned_briefs,
        items: result.cleaned_items,
        derivatives: result.cleaned_derivatives,
        suggestions: result.cleaned_suggestions
      }
    });

    // Log significant cleanup activity
    if (result.total_cleaned > 0) {
      console.log(`${dryRun ? 'Would clean' : 'Cleaned'} ${result.total_cleaned} historical records`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        result,
        message: dryRun 
          ? `Dry run complete. Would clean ${result.total_cleaned} records.`
          : `Cleanup complete. Cleaned ${result.total_cleaned} records.`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Cleanup error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});