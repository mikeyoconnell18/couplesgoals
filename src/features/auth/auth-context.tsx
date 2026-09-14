import { Session } from '@supabase/supabase-js';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getSupabaseClient } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  sendCode(email: string): Promise<void>;
  verifyCode(email: string, token: string): Promise<void>;
  signOut(): Promise<void>;
};
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const client = getSupabaseClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(Boolean(client));
  useEffect(() => {
    if (!client) return;
    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = client.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, [client]);
  const value = useMemo<AuthState>(
    () => ({
      session,
      loading,
      isDemo: !client,
      async sendCode(email) {
        if (!client) return;
        const { error } = await client.auth.signInWithOtp({
          email: email.trim(),
          options: { shouldCreateUser: true },
        });
        if (error) throw error;
      },
      async verifyCode(email, token) {
        if (!client) return;
        const { error } = await client.auth.verifyOtp({
          email: email.trim(),
          token: token.trim(),
          type: 'email',
        });
        if (error) throw error;
      },
      async signOut() {
        if (client) {
          const { error } = await client.auth.signOut();
          if (error) throw error;
        }
      },
    }),
    [client, loading, session],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used in AuthProvider');
  return value;
}
