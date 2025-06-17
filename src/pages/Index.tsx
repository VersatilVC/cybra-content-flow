
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, session, loading } = useAuth();

  useEffect(() => {
    console.log('Index: Component mounted');
    console.log('Index: Auth state - loading:', loading, 'user:', user ? 'exists' : 'null', 'session:', session ? 'exists' : 'null');
    
    // Don't redirect while auth is still loading
    if (loading) {
      console.log('Index: Auth still loading, waiting...');
      return;
    }

    // If user is authenticated, redirect to dashboard
    if (user && session) {
      console.log('Index: User authenticated, redirecting to dashboard');
      console.log('Index: User email:', user.email);
      navigate("/dashboard", { replace: true });
      return;
    }

    // If no user, check if this might be an OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
    const error = urlParams.get('error') || hashParams.get('error');
    
    if (accessToken) {
      console.log('Index: OAuth callback detected with access_token, waiting for auth state update...');
      // Give some time for the auth state to update
      setTimeout(() => {
        if (!user) {
          console.log('Index: OAuth callback timeout, redirecting to auth page');
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

    // No user and no OAuth callback, redirect to auth
    console.log('Index: No user authenticated, redirecting to auth page');
    navigate("/auth", { replace: true });
  }, [navigate, user, session, loading]);

  // Show loading while determining where to redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-white">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
