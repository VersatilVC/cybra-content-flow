// Centralized configuration for environment-specific settings
// This file manages all URLs and environment-dependent values securely

interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
    functions: {
      baseUrl: string;
      processContent: string;
      processIdeaCallback: string;
      wordpressPublish: string;
    };
    storage: {
      baseUrl: string;
      contentDerivatives: string;
    };
  };
}

// Get configuration based on current environment
function getConfig(): AppConfig {
  // In production, these would come from environment variables
  // For now, we're centralizing the hardcoded values to make them easier to manage
  const supabaseUrl = "https://uejgjytmqpcilwfrlpai.supabase.co";
  const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlamdqeXRtcXBjaWx3ZnJscGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNjY0ODAsImV4cCI6MjA1ODY0MjQ4MH0.KGvrDLND84FX-WEtSzLr_A0fFNP7WF5Jl8jnpxajJqU";
  
  return {
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      functions: {
        baseUrl: `${supabaseUrl}/functions/v1`,
        processContent: `${supabaseUrl}/functions/v1/process-content`,
        processIdeaCallback: `${supabaseUrl}/functions/v1/process-idea-callback`,
        wordpressPublish: `${supabaseUrl}/functions/v1/wordpress-publish`,
      },
      storage: {
        baseUrl: `${supabaseUrl}/storage/v1/object`,
        contentDerivatives: `${supabaseUrl}/storage/v1/object/public/content-derivatives`,
      },
    },
  };
}

export const config = getConfig();

// Helper functions for common URL patterns
export const getEdgeFunctionUrl = (functionName: string, params?: string): string => {
  const baseUrl = `${config.supabase.functions.baseUrl}/${functionName}`;
  return params ? `${baseUrl}?${params}` : baseUrl;
};

export const getStorageUrl = (bucket: string, path?: string): string => {
  if (path) {
    return `${config.supabase.url}/storage/v1/object/public/${bucket}/${path}`;
  }
  return `${config.supabase.url}/storage/v1/object/public/${bucket}`;
};

export const getCallbackUrl = (functionName: string): string => {
  return `${config.supabase.functions.baseUrl}/${functionName}`;
};