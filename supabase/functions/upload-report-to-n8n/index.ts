import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const payload: N8NReportUploadPayload = await req.json()
    console.log('Received report upload payload:', payload)

    // Send to N8N webhook
    const webhookUrl = 'https://cyabramarketing.app.n8n.cloud/webhook/report-upload-dedicated'
    console.log('Sending to N8N webhook:', webhookUrl)

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('N8N webhook error:', response.status, errorText)
      throw new Error(`N8N webhook failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.text()
    console.log('N8N webhook response:', result)

    return new Response(
      JSON.stringify({ success: true, message: 'Report uploaded to N8N successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in upload-report-to-n8n function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to upload report to N8N',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})