
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAccountLinking } from '@/hooks/useAccountLinking';
import { useToast } from '@/hooks/use-toast';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { AccountLinkingInfo } from '@/components/auth/AccountLinkingInfo';

const Auth = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signInWithGoogle, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize account linking detection
  useAccountLinking();

  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect authenticated users
  useEffect(() => {
    if (!loading && user) {
      console.log('User authenticated, navigating to:', from);
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  // Show loading for auth state
  if (loading) {
    return <AuthLoadingScreen />;
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Note: Success handling will be done by the auth state change listener
      // since OAuth redirects the user
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign in with Google',
        variant: 'destructive',
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Welcome to Marko</h2>
          <p className="text-muted-foreground">
            Sign in with your Google account to get started
          </p>
        </div>
        
        <AccountLinkingInfo />
        
        <GoogleSignInButton 
          onClick={handleGoogleSignIn} 
          isLoading={isGoogleLoading}
        />
      </div>
    </AuthLayout>
  );
};

export default Auth;
