import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { User, AuthState } from '@/types';
import { logger } from '@/lib/logger';

const AUTH_STORAGE_KEY = '@lkscale_auth';
const REMEMBER_ME_KEY = '@lkscale_remember';

// Simple state management
type Listener = () => void;
const listeners: Set<Listener> = new Set();

let authState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  rememberMe: false,
};

export const getAuthState = () => authState;

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export const subscribeAuth = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const setAuthState = (updates: Partial<AuthState>) => {
  authState = { ...authState, ...updates };
  notifyListeners();
};

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

// Initialize auth state from Supabase session
export const initializeAuth = async () => {
  try {
    setAuthState({ isLoading: true });

    // Get current session from Supabase
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      logger.error('Error getting session:', error);
      setAuthState({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    if (session?.user) {
      const user = await convertSupabaseUser(session.user);
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        rememberMe: true,
      });
    } else {
      setAuthState({ isLoading: false, isAuthenticated: false, user: null });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = await convertSupabaseUser(session.user);
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user,
          rememberMe: true,
        });
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          rememberMe: false,
        });
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Keep existing user data on token refresh
        const currentUser = getAuthState().user;
        if (!currentUser) {
          const user = await convertSupabaseUser(session.user);
          setAuthState({ user });
        }
      }
    });
  } catch (error) {
    logger.error('Error initializing auth:', error);
    setAuthState({ isLoading: false, isAuthenticated: false });
  }
};

// Legacy login function (now uses Supabase)
export const login = async (
  email: string,
  password: string,
  rememberMe: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    setAuthState({ isLoading: true });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthState({ isLoading: false });
      return { success: false, error: error.message };
    }

    if (data.user) {
      const user = await convertSupabaseUser(data.user);
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        rememberMe,
      });
      return { success: true };
    }

    setAuthState({ isLoading: false });
    return { success: false, error: 'Не удалось войти' };
  } catch (error) {
    logger.error('Login error:', error);
    setAuthState({ isLoading: false });
    return { success: false, error: 'Ошибка входа. Попробуйте снова.' };
  }
};

export const logout = async () => {
  try {
    await supabase.auth.signOut();
    await Promise.all([
      AsyncStorage.removeItem(AUTH_STORAGE_KEY),
      AsyncStorage.removeItem(REMEMBER_ME_KEY),
    ]);

    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      rememberMe: false,
    });
  } catch (error) {
    logger.error('Logout error:', error);
  }
};

export const updateUser = async (updates: Partial<User>) => {
  const currentState = getAuthState();
  if (!currentState.user) return;

  try {
    // Update in Supabase
    const { error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        phone: updates.phone,
        avatar_url: updates.avatar,
      })
      .eq('id', currentState.user.id);

    if (error) {
      console.error('Error updating user:', error);
      return;
    }

    // Update local state
    const updatedUser = { ...currentState.user, ...updates };
    setAuthState({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
  }
};

// Get current user ID (helper for data operations)
export const getCurrentUserId = (): string | null => {
  return authState.user?.id || null;
};

// Refresh user profile from database
export const refreshUserProfile = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    const user = await convertSupabaseUser(session.user);
    setAuthState({ user });
  }
};
