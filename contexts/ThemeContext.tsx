import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode, useMemo } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ThemeMode,
  lightColors,
  darkColors,
  shadows,
  darkShadows,
  spacing,
  borderRadius,
  typography,
  chartPalette,
} from '@/constants/theme';

const THEME_STORAGE_KEY = '@maggaz12_theme_mode';

export type ThemeColors = typeof lightColors;

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  shadows: typeof shadows;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  chartPalette: typeof chartPalette;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (mode === 'system') {
        // Force re-render when system theme changes
        setModeState(prev => prev);
      }
    });
    return () => subscription.remove();
  }, [mode]);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        setModeState(saved as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setMode = useCallback(async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
      setModeState(newMode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const currentIsDark = mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark');
    const newMode: ThemeMode = currentIsDark ? 'light' : 'dark';
    await setMode(newMode);
  }, [mode, systemColorScheme, setMode]);

  const isDark = useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark';
    }
    return mode === 'dark';
  }, [mode, systemColorScheme]);

  const colors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  const currentShadows = useMemo(() => {
    return isDark ? darkShadows : shadows;
  }, [isDark]);

  const value = useMemo(() => ({
    mode,
    isDark,
    colors,
    shadows: currentShadows,
    spacing,
    borderRadius,
    typography,
    chartPalette,
    setMode,
    toggleTheme,
  }), [mode, isDark, colors, currentShadows, setMode, toggleTheme]);

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility hook for getting themed styles
export const useThemedStyles = <T extends Record<string, unknown>>(
  styleFactory: (theme: ThemeContextType) => T
): T => {
  const theme = useTheme();
  return useMemo(() => styleFactory(theme), [theme, styleFactory]);
};

export { ThemeMode };
