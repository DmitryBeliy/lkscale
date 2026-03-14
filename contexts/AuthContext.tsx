import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { logger } from '@/lib/logger';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, metadata?: { data?: { name?: string } }) => Promise<{ error?: string; emailConfirmationRequired?: boolean }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
  error: Error | null;
  pendingEmailVerification: boolean;
  pendingPasswordReset: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Convert Supabase user to app User format
const convertSupabaseUser = async (supabaseUser: { id: string; email?: string | null }): Promise<User | null> => {
  if (!supabaseUser) return null;

  try {
    // Fetch user profile from database
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (error || !profile) {
      // Return basic user if profile not found
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.email?.split('@')[0] || 'Пользователь',
        balance: 0,
        createdAt: new Date().toISOString(),
      };
    }

    return {
      id: profile.id,
      email: profile.email || '',
      name: profile.name || 'Пользователь',
      phone: profile.phone || undefined,
      avatar: profile.avatar_url || undefined,
      balance: profile.balance || 0,
      createdAt: profile.created_at || new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.email?.split('@')[0] || 'Пользователь',
      balance: 0,
      createdAt: new Date().toISOString(),
    };
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pendingEmailVerification, setPendingEmailVerification] = useState(false);
  const [pendingPasswordReset, setPendingPasswordReset] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Get current session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          logger.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          const userData = await convertSupabaseUser(session.user);
          setUser(userData);
        }
      } catch (err) {
        logger.error('Error initializing auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = await convertSupabaseUser(session.user);
        setUser(userData);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(new Error(error.message));
        return { error: error.message };
      }

      if (data.user) {
        const userData = await convertSupabaseUser(data.user);
        setUser(userData);
      }

      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка входа';
      setError(new Error(message));
      return { error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string, metadata?: { data?: { name?: string } }) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: metadata,
      });

      if (error) {
        setError(new Error(error.message));
        return { error: error.message };
      }

      if (data.user && data.user.identities && data.user.identities.length === 0) {
        // Email confirmation required
        setPendingEmailVerification(true);
        return { emailConfirmationRequired: true };
      }

      if (data.user) {
        const userData = await convertSupabaseUser(data.user);
        setUser(userData);
      }

      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка регистрации';
      setError(new Error(message));
      return { error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        setError(new Error(error.message));
        return { error: error.message };
      }

      setPendingPasswordReset(true);
      return {};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка сброса пароля';
      setError(new Error(message));
      return { error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      logger.error('Error signing out:', err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signOut,
    clearError,
    error,
    pendingEmailVerification,
    pendingPasswordReset,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
