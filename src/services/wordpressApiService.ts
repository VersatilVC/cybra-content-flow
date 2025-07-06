import { supabase } from '@/integrations/supabase/client';

interface WordPressUser {
  id: number;
  username: string;
  email: string;
  name: string;
}

interface WordPressPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  status: string;
  link: string;
  featured_media: number;
}

interface WordPressMedia {
  id: number;
  source_url: string;
  link: string;
}

export class WordPressApiService {
  // Frontend service - for security, WordPress API calls should go through edge functions
  // This service provides client-side utilities only
  
  async testConnection(): Promise<boolean> {
    try {
      // Test connection through edge function instead of direct API call
      const { data, error } = await supabase.functions.invoke('wordpress-publish', {
        body: { test: true }
      });
      
      return !error && data?.success;
    } catch (error) {
      console.error('WordPress connection test failed:', error);
      return false;
    }
  }
}

export const wordpressApi = new WordPressApiService();