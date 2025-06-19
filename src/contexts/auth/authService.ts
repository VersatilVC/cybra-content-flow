
import { supabase } from '@/integrations/supabase/client';

export const authService = {
  async signIn(email: string, password: string) {
    try {
      console.log('AuthService: Signing in user with email:', email);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('AuthService: Sign in error:', error);
        throw error;
      }
      
      console.log('AuthService: Successfully signed in');
    } catch (error) {
      console.error('AuthService: Sign in failed:', error);
      throw error;
    }
  },

  async signInWithGoogle() {
    try {
      console.log('AuthService: Signing in with Google');
      const redirectUrl = `${window.location.origin}/`;
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

  async signUp(email: string, password: string, firstName: string, lastName: string) {
    try {
      console.log('AuthService: Signing up user with email:', email);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      
      if (error) {
        console.error('AuthService: Sign up error:', error);
        throw error;
      }
      
      console.log('AuthService: Successfully signed up');
    } catch (error) {
      console.error('AuthService: Sign up failed:', error);
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
