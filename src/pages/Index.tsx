
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOptimizedAuthContext } from "@/contexts/OptimizedAuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, session, loading, recoverSession } = useOptimizedAuthContext();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    console.log('Index: Component mounted');
    console.log('Index: Auth state - loading:', loading, 'user:', user ? 'exists' : 'null', 'session:', session ? 'exists' : 'null');
    
    // Don't proceed while auth is still loading
    if (loading) {
      console.log('Index: Auth still loading, waiting...');
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

    // Check if this is an OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
    const error = urlParams.get('error') || hashParams.get('error');
    
    if (accessToken) {
      console.log('Index: OAuth callback detected with access_token, waiting for auth state update...');
      // Give more time for OAuth callback to complete
      setTimeout(() => {
        if (!user) {
          console.log('Index: OAuth callback processing timeout, redirecting to auth page');
          navigate("/auth", { replace: true });
        }
      }, 3000);
      return;
    }
    
    if (error) {
      console.error('Index: OAuth error detected:', error);
      navigate("/auth", { replace: true });
      return;
    }

    // If we haven't checked for session recovery yet, try it
    if (!sessionChecked && !user && !session) {
      console.log('Index: No user/session found, attempting session recovery...');
      setSessionChecked(true);
      
      recoverSession().then((recovered) => {
        if (!recovered) {
          console.log('Index: Session recovery failed, redirecting to auth page');
          navigate("/auth", { replace: true });
        } else {
          console.log('Index: Session recovered successfully');
        }
      }).catch((error) => {
        console.error('Index: Session recovery error:', error);
        navigate("/auth", { replace: true });
      });
      
      return;
    }

    // If no user after all checks, redirect to auth
    if (sessionChecked && !user && !session) {
      console.log('Index: No user authenticated, redirecting to auth page');
      navigate("/auth", { replace: true });
    }
  }, [navigate, user, session, loading, sessionChecked, recoverSession]);

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
