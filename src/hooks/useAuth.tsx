import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session, AuthResponse } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfirmationPending: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  deleteAccount: (reason: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfirmationPending, setConfirmationPending] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => { 
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, authChangeEventSession) => { 
      // When a SIGNED_OUT event is received (from this or another device),
      // we must clear local storage to prevent invalid "zombie" sessions.
      if (event === 'SIGNED_OUT') {
        Object.keys(localStorage)
          .filter(key => key.startsWith('sb-') || key.startsWith('supabase.auth.'))
          .forEach(key => localStorage.removeItem(key));
      }
      setSession(authChangeEventSession);
      setUser(authChangeEventSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const sendPasswordResetEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    setConfirmationPending(false);
    const redirectUrl = `${window.location.origin}/`;
    const { data: authData, error }: AuthResponse = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error("Supabase signUp error:", error);
      throw error;
    }

    if (authData.user && (!authData.user.identities || authData.user.identities.length === 0)) {
      console.warn("SignUp: User object returned but identities array is empty or null. Treating as an issue.", authData.user);
      setConfirmationPending(true);
      return;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // A hard reload is the most reliable way to clear all app state
    // and ensure the user is redirected to the login page.
    window.location.href = '/';
  };

  const deleteAccount = async (reason: string) => {
    const { error } = await supabase.functions.invoke('delete-account', {
      body: { reason },
    });

    if (error) {
      console.error('Error invoking delete-account function:', error);
      throw error;
    }

    // After successful deletion on the backend, sign out on the client
    // which will trigger the onAuthStateChange listener to update state.
    await signOut();
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    isConfirmationPending,
    signIn,
    signUp,
    signOut,
    sendPasswordResetEmail,
    updatePassword,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
