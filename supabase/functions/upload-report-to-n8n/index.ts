import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface N8NReportUploadPayload {
  request_type: 'report_upload';
  file_url: string;
  file_path: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  user_id: string;
  timestamp: string;
  category?: string;
  derivative_type?: string;
  status?: string;
  content_item_id?: string;
  pr_campaign_id?: string;
  general_content_id?: string;
}

serve(async (req) => {
  console.log('Function started, method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing request');
    
    if (req.method !== 'POST') {
      console.log('Invalid method:', req.method);
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Parsing request body');
    const payload: N8NReportUploadPayload = await req.json();
    console.log('Received report upload payload:', JSON.stringify(payload, null, 2));

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch active webhook configuration for PR pitch generation reports
    console.log('Fetching webhook configuration...');
    const { data: webhookConfig, error: webhookError } = await supabase
      .from('webhook_configurations')
      .select('webhook_url')
      .eq('webhook_type', 'pr_pitch_generation_reports')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (webhookError) {
      console.error('Error fetching webhook configuration:', webhookError);
      throw new Error(`Failed to fetch webhook configuration: ${webhookError.message}`);
    }

    if (!webhookConfig) {
      console.error('No active webhook configuration found for pr_pitch_generation_reports');
      throw new Error('No active webhook configuration found for report uploads');
    }

    const webhookUrl = webhookConfig.webhook_url;
    console.log('Sending to N8N webhook:', webhookUrl);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('N8N response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('N8N webhook error:', response.status, errorText);
      throw new Error(`N8N webhook failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.text();
    console.log('N8N webhook response:', result);

    return new Response(
      JSON.stringify({ success: true, message: 'Report uploaded to N8N successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in upload-report-to-n8n function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to upload report to N8N',
        details: error.message,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});