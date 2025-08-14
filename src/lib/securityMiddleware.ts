import { securityHeaders } from '@/lib/security';

// Security middleware for API responses
export const addSecurityHeaders = (response: Response): Response => {
  const headers = new Headers(response.headers);
  
  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  // Add Content Security Policy
  headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://agbcslwigqthrlxnqbmc.supabase.co; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://agbcslwigqthrlxnqbmc.supabase.co wss://agbcslwigqthrlxnqbmc.supabase.co; " +
    "frame-ancestors 'none';"
  );
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
};

// Enhanced CORS headers with security
export const securecorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  ...securityHeaders,
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://agbcslwigqthrlxnqbmc.supabase.co; " +
    "frame-ancestors 'none';"
};