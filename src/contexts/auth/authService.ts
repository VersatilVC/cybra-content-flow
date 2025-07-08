
import { supabase } from '@/integrations/supabase/client';

export const authService = {
  async signInWithGoogle() {
    try {
      console.log('AuthService: Signing in with Google');
      // Always redirect to production URL to avoid domain switching
      const redirectUrl = 'https://35651ca2-7c29-458b-823b-087384019799.lovableproject.com/';
      console.log('AuthService: Google OAuth redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
      
      if (error) {
        console.error('AuthService: Google sign in error:', error);
        throw error;
      }
      
      console.log('AuthService: Google sign in initiated');
    } catch (error) {
      console.error('AuthService: Google sign in failed:', error);
      throw error;
    }
  },

  async signOut() {
    try {
      console.log('AuthService: Signing out user');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('AuthService: Error signing out:', error);
        // Even if signOut fails, clear local state and redirect
        // This handles cases where the session is already invalid
      }
      
      console.log('AuthService: Successfully signed out');
      
    } catch (error) {
      console.error('AuthService: Sign out failed:', error);
      throw error;
    }
  }
};
