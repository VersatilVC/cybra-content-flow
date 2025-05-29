
export interface AuthState {
  user: any | null;
  session: any | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

export interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SESSION'; payload: { user: any | null; session: any | null } }
  | { type: 'SET_PROFILE'; payload: Profile | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };
