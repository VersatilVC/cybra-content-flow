
import { useState } from 'react';
import { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export function useAuthState() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  const setUser = (user: User | null) => {
    setState(prev => ({ ...prev, user }));
  };

  const setSession = (session: Session | null) => {
    setState(prev => ({ ...prev, session, user: session?.user ?? null }));
  };

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  return {
    ...state,
    setUser,
    setSession,
    setLoading,
  };
}
