// Centralized configuration for environment-specific settings
// This file manages all URLs and environment-dependent values securely

import { productionConfig } from './production';

interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
    functions: {
      baseUrl: string;
      processContent: string;
      processIdeaCallback: string;
      wordpressPublish: string;
      healthCheck?: string;
    };
    storage: {
      baseUrl: string;
      contentDerivatives: string;
      knowledgeBaseFiles?: string;
      contentFiles?: string;
    };
  };
  environment: 'development' | 'production';
  projectId: string;
}

// Detect environment based on current domain
function getEnvironment(): 'development' | 'production' {
  if (typeof window === 'undefined') return 'development';
  
  const hostname = window.location.hostname;
  
  // Production conditions
  if (hostname.includes('lovable.app') || 
      hostname.includes('vercel.app') || 
      hostname.includes('netlify.app') ||
      !hostname.includes('localhost')) {
    return 'production';
  }
  
  return 'development';
}

// Get configuration based on current environment
function getConfig(): AppConfig {
  const environment = getEnvironment();
  
  if (environment === 'production') {
    return productionConfig;
  }
  
  // Development configuration
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
        healthCheck: `${supabaseUrl}/functions/v1/health-check`,
      },
      storage: {
        baseUrl: `${supabaseUrl}/storage/v1/object`,
        contentDerivatives: `${supabaseUrl}/storage/v1/object/public/content-derivatives`,
        knowledgeBaseFiles: `${supabaseUrl}/storage/v1/object/public/knowledge-base-files`,
        contentFiles: `${supabaseUrl}/storage/v1/object/content-files`,
      },
    },
    environment: 'development',
    projectId: 'uejgjytmqpcilwfrlpai',
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