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
      hostname.includes('lovableproject.com') ||
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
  console.log('Environment Detection:', {
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
    environment,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server'
  });
  
  // ALWAYS use production configuration for this project
  // The production database (agbcslwigqthrlxnqbmc) is our primary database
  console.log('Using PRODUCTION config:', productionConfig.supabase.url);
  return productionConfig;
}

export const config = getConfig();

// Helper functions for common URL patterns
export const getEdgeFunctionUrl = (functionName: string, params?: string): string => {
  const baseUrl = `${config.supabase.functions.baseUrl}/${functionName}`;
  return params ? `${baseUrl}?${params}` : baseUrl;
};

export const getStorageUrl = (bucket: string, path?: string): string => {
  const isPublicBucket = bucket === 'content-derivatives' || bucket === 'knowledge-base-files';
  const base = `${config.supabase.url}/storage/v1/object/${isPublicBucket ? 'public/' : ''}${bucket}`;
  return path ? `${base}/${path}` : base;
};

export const getCallbackUrl = (functionName: string): string => {
  return `${config.supabase.functions.baseUrl}/${functionName}`;
};