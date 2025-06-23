
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, session, loading, recoverSession } = useAuth();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    console.log('Index: Component mounted');
    console.log('Index: Auth state - loading:', loading, 'user:', user ? 'exists' : 'null', 'session:', session ? 'exists' : 'null');
    
    // Don't proceed while auth is still loading
    if (loading) {
      console.log('Index: Auth still loading, waiting...');
      return;
    }

    // If we haven't checked for session recovery yet, try it
    if (!sessionChecked && !user && !session) {
      console.log('Index: No user/session found, attempting session recovery...');
      setSessionChecked(true);
      
      recoverSession().then((recovered) => {
        if (!recovered) {
          console.log('Index: Session recovery failed, checking for OAuth callback...');
          handleAuthRedirect();
        } else {
          console.log('Index: Session recovered successfully, waiting for auth state update...');
        }
      }).catch((error) => {
        console.error('Index: Session recovery error:', error);
        handleAuthRedirect();
      });
      
      return;
    }

    // If user is authenticated, redirect to dashboard
    if (user && session) {
      console.log('Index: User authenticated, redirecting to dashboard');
      console.log('Index: User details:', {
        id: user.id,
        email: user.email,
        sessionExpiry: session.expires_at
      });
      navigate("/dashboard", { replace: true });
      return;
    }

    // If no user after all checks, handle redirect logic
    if (sessionChecked && !user && !session) {
      handleAuthRedirect();
    }
  }, [navigate, user, session, loading, sessionChecked, recoverSession]);

  const handleAuthRedirect = () => {
    // Check if this might be an OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
    const error = urlParams.get('error') || hashParams.get('error');
    
    if (accessToken) {
      console.log('Index: OAuth callback detected with access_token, waiting for auth state update...');
      // Give time for the auth state to update
      setTimeout(() => {
        if (!user) {
          console.log('Index: OAuth callback timeout, redirecting to auth page');
          navigate("/auth", { replace: true });
        }
      }, 5000); // Increased timeout for better reliability
      return;
    }
    
    if (error) {
      console.error('Index: OAuth error detected:', error);
      navigate("/auth", { replace: true });
      return;
    }

    // No user and no OAuth callback, redirect to auth
    console.log('Index: No user authenticated and no OAuth callback, redirecting to auth page');
    navigate("/auth", { replace: true });
  };

  // Show loading while determining where to redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-white">
          {!sessionChecked && !loading ? 'Checking session...' : 'Loading...'}
        </p>
      </div>
    </div>
  );
};

export default Index;
