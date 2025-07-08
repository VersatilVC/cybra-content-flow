import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: boolean;
    auth: boolean;
    storage: boolean;
    wordpress: boolean;
  };
  metrics: {
    responseTime: number;
    uptime: number;
  };
  environment: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    console.log('Health check requested');

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('PROJECT_URL') ?? '',
      Deno.env.get('PROJECT_SERVICE_ROLE_KEY') ?? ''
    )

    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0-security-hardened',
      services: {
        database: false,
        auth: false,
        storage: false,
        wordpress: false
      },
      metrics: {
        responseTime: 0,
        uptime: Date.now() // Simplified uptime
      },
      environment: Deno.env.get('ENVIRONMENT') || 'production'
    };

    // Test database connectivity
    try {
      const { error: dbError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      healthStatus.services.database = !dbError;
      if (dbError) {
        console.error('Database health check failed:', dbError);
      }
    } catch (error) {
      console.error('Database connection error:', error);
      healthStatus.services.database = false;
    }

    // Test auth service
    try {
      // Simple auth service check - try to get current session info
      const { data, error } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1
      });
      
      healthStatus.services.auth = !error;
      if (error) {
        console.error('Auth service health check failed:', error);
      }
    } catch (error) {
      console.error('Auth service error:', error);
      healthStatus.services.auth = false;
    }

    // Test storage service
    try {
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      healthStatus.services.storage = !storageError;
      
      if (storageError) {
        console.error('Storage health check failed:', storageError);
      }
    } catch (error) {
      console.error('Storage service error:', error);
      healthStatus.services.storage = false;
    }

    // Test WordPress integration
    try {
      // Check if WordPress credentials are configured
      const wpUrl = Deno.env.get('WORDPRESS_BASE_URL');
      const wpUser = Deno.env.get('WORDPRESS_USERNAME');
      const wpPass = Deno.env.get('WORDPRESS_APP_PASSWORD');
      const wpEmail = Deno.env.get('WORDPRESS_AUTHOR_EMAIL');
      
      healthStatus.services.wordpress = !!(wpUrl && wpUser && wpPass && wpEmail);
      
      if (!healthStatus.services.wordpress) {
        console.warn('WordPress credentials not fully configured');
      }
    } catch (error) {
      console.error('WordPress configuration check failed:', error);
      healthStatus.services.wordpress = false;
    }

    // Calculate response time
    healthStatus.metrics.responseTime = Date.now() - startTime;

    // Determine overall status
    const serviceStatuses = Object.values(healthStatus.services);
    const healthyServices = serviceStatuses.filter(Boolean).length;
    const totalServices = serviceStatuses.length;

    if (healthyServices === totalServices) {
      healthStatus.status = 'healthy';
    } else if (healthyServices >= totalServices * 0.75) {
      healthStatus.status = 'degraded';
    } else {
      healthStatus.status = 'unhealthy';
    }

    console.log('Health check completed:', {
      status: healthStatus.status,
      healthyServices: `${healthyServices}/${totalServices}`,
      responseTime: `${healthStatus.metrics.responseTime}ms`
    });

    // Return appropriate HTTP status code
    const httpStatus = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 206 : 503;

    return new Response(
      JSON.stringify(healthStatus, null, 2),
      { 
        status: httpStatus,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )

  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      metrics: {
        responseTime: Date.now() - startTime
      }
    };

    return new Response(
      JSON.stringify(errorResponse, null, 2),
      { 
        status: 503,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    )
  }
})