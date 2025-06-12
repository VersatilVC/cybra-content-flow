
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthLoadingScreen } from '@/components/auth/AuthLoadingScreen';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';

const Auth = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleLogin = async (email: string, password: string) => {
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      toast({
        title: 'Success',
        description: 'Successfully signed in!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign in',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsSubmitting(true);
    try {
      await signUp(email, password, firstName, lastName);
      toast({
        title: 'Success',
        description: 'Account created successfully! Please check your email for verification.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <LoginForm onSubmit={handleLogin} isSubmitting={isSubmitting} />
        </TabsContent>
        
        <TabsContent value="signup">
          <SignupForm onSubmit={handleSignup} isSubmitting={isSubmitting} />
        </TabsContent>
      </Tabs>
    </AuthLayout>
  );
};

export default Auth;
