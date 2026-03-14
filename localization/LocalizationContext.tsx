import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language, translations, Translations } from './translations';
import { logger } from '@/lib/logger';

const LANGUAGE_STORAGE_KEY = '@lkscale_language';

interface LocalizationContextType {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => Promise<void>;
  formatCurrency: (amount: number, compact?: boolean) => string;
  formatDate: (date: string | Date, format?: 'short' | 'long' | 'relative') => string;
  formatNumber: (num: number) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

interface LocalizationProviderProps {
  children: ReactNode;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ru');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved && (saved === 'ru' || saved === 'en')) {
        setLanguageState(saved);
      }
    } catch (error) {
      logger.error('Error loading language:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setLanguage = useCallback(async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      logger.error('Error saving language:', error);
    }
  }, []);

  const t = translations[language];

  const formatCurrency = useCallback((amount: number, compact?: boolean): string => {
    const { symbol, thousand, million } = t.currency;

    if (compact) {
      if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)} ${million} ${symbol}`;
      }
      if (amount >= 1000) {
        return `${(amount / 1000).toFixed(0)} ${thousand} ${symbol}`;
      }
    }

    const locale = language === 'ru' ? 'ru-RU' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, [language, t.currency]);

  const formatDate = useCallback((date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const locale = language === 'ru' ? 'ru-RU' : 'en-US';
    const now = new Date();

    if (format === 'relative') {
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return t.dateTime.justNow;
      if (diffMins < 60) return `${diffMins} ${t.dateTime.minutesAgo}`;
      if (diffHours < 24) return `${diffHours} ${t.dateTime.hoursAgo}`;
      if (diffDays < 7) return `${diffDays} ${t.dateTime.daysAgo}`;
    }

    // Check if same day
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) {
      return `${t.dateTime.today}, ${d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
    }

    if (isYesterday) {
      return `${t.dateTime.yesterday}, ${d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
    }

    if (format === 'long') {
      return d.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [language, t.dateTime]);

  const formatNumber = useCallback((num: number): string => {
    const locale = language === 'ru' ? 'ru-RU' : 'en-US';
    return new Intl.NumberFormat(locale).format(num);
  }, [language]);

  if (!isLoaded) {
    return null;
  }

  return (
    <LocalizationContext.Provider
      value={{
        language,
        t,
        setLanguage,
        formatCurrency,
        formatDate,
        formatNumber,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

export { Language, translations };
