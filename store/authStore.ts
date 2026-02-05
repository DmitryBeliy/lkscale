import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '@/types';

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

// Mock user data based on Maggaz12
const mockUser: User = {
  id: '1',
  email: 'dmitry.plotnikov@example.com',
  name: 'Дмитрий Плотников',
  phone: '+7 (999) 123-45-67',
  balance: 125840.50,
  createdAt: '2024-01-15T10:00:00Z',
};

export const initializeAuth = async () => {
  try {
    const [savedAuth, rememberMe] = await Promise.all([
      AsyncStorage.getItem(AUTH_STORAGE_KEY),
      AsyncStorage.getItem(REMEMBER_ME_KEY),
    ]);

    if (savedAuth && rememberMe === 'true') {
      const user = JSON.parse(savedAuth) as User;
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        rememberMe: true,
      });
    } else {
      setAuthState({ isLoading: false });
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
    setAuthState({ isLoading: false });
  }
};

export const login = async (
  email: string,
  password: string,
  rememberMe: boolean
): Promise<{ success: boolean; error?: string }> => {
  try {
    setAuthState({ isLoading: true });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock validation
    if (!email || !password) {
      setAuthState({ isLoading: false });
      return { success: false, error: 'Введите email и пароль' };
    }

    // Accept any credentials for demo
    const user = { ...mockUser, email };

    if (rememberMe) {
      await Promise.all([
        AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user)),
        AsyncStorage.setItem(REMEMBER_ME_KEY, 'true'),
      ]);
    }

    setAuthState({
      isAuthenticated: true,
      isLoading: false,
      user,
      rememberMe,
    });

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    setAuthState({ isLoading: false });
    return { success: false, error: 'Ошибка входа. Попробуйте снова.' };
  }
};

export const logout = async () => {
  try {
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
    console.error('Logout error:', error);
  }
};

export const updateUser = async (updates: Partial<User>) => {
  const currentState = getAuthState();
  if (!currentState.user) return;

  const updatedUser = { ...currentState.user, ...updates };

  if (currentState.rememberMe) {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
  }

  setAuthState({ user: updatedUser });
};
