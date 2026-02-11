import { supabase } from '@/lib/supabase';
import { StoreSettings } from '@/types';
import { getCurrentUserId } from '@/store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORE_SETTINGS_CACHE_KEY = '@lkscale_store_settings';

// Default settings
export const defaultStoreSettings: Omit<StoreSettings, 'id' | 'userId'> = {
  businessName: 'Мой магазин',
  currency: 'RUB',
  currencySymbol: '₽',
  taxRate: 20,
  taxName: 'НДС',
  invoicePrefix: 'INV',
};

// Currency options
export const currencyOptions = [
  { code: 'RUB', symbol: '₽', name: 'Российский рубль' },
  { code: 'USD', symbol: '$', name: 'Доллар США' },
  { code: 'EUR', symbol: '€', name: 'Евро' },
  { code: 'KZT', symbol: '₸', name: 'Казахстанский тенге' },
  { code: 'BYN', symbol: 'Br', name: 'Белорусский рубль' },
  { code: 'UAH', symbol: '₴', name: 'Украинская гривна' },
];

// Convert DB row to StoreSettings
const dbToStoreSettings = (row: Record<string, unknown>): StoreSettings => ({
  id: row.id as string,
  userId: row.user_id as string,
  businessName: (row.business_name as string) || defaultStoreSettings.businessName,
  logoUrl: row.logo_url as string | undefined,
  currency: (row.currency as string) || defaultStoreSettings.currency,
  currencySymbol: (row.currency_symbol as string) || defaultStoreSettings.currencySymbol,
  taxRate: (row.tax_rate as number) ?? defaultStoreSettings.taxRate,
  taxName: (row.tax_name as string) || defaultStoreSettings.taxName,
  address: row.address as string | undefined,
  phone: row.phone as string | undefined,
  email: row.email as string | undefined,
  website: row.website as string | undefined,
  invoicePrefix: (row.invoice_prefix as string) || defaultStoreSettings.invoicePrefix,
  invoiceNotes: row.invoice_notes as string | undefined,
  createdAt: row.created_at as string | undefined,
  updatedAt: row.updated_at as string | undefined,
});

// Convert StoreSettings to DB row
const storeSettingsToDb = (settings: Partial<StoreSettings>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  if (settings.businessName !== undefined) result.business_name = settings.businessName;
  if (settings.logoUrl !== undefined) result.logo_url = settings.logoUrl;
  if (settings.currency !== undefined) result.currency = settings.currency;
  if (settings.currencySymbol !== undefined) result.currency_symbol = settings.currencySymbol;
  if (settings.taxRate !== undefined) result.tax_rate = settings.taxRate;
  if (settings.taxName !== undefined) result.tax_name = settings.taxName;
  if (settings.address !== undefined) result.address = settings.address;
  if (settings.phone !== undefined) result.phone = settings.phone;
  if (settings.email !== undefined) result.email = settings.email;
  if (settings.website !== undefined) result.website = settings.website;
  if (settings.invoicePrefix !== undefined) result.invoice_prefix = settings.invoicePrefix;
  if (settings.invoiceNotes !== undefined) result.invoice_notes = settings.invoiceNotes;
  result.updated_at = new Date().toISOString();

  return result;
};

// Fetch store settings
export const fetchStoreSettings = async (): Promise<StoreSettings | null> => {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, create default
        return await createStoreSettings();
      }
      console.error('Error fetching store settings:', error);
      return await getCachedStoreSettings();
    }

    const settings = dbToStoreSettings(data as Record<string, unknown>);
    await cacheStoreSettings(settings);
    return settings;
  } catch (error) {
    console.error('Error fetching store settings:', error);
    return await getCachedStoreSettings();
  }
};

// Create default store settings
export const createStoreSettings = async (): Promise<StoreSettings | null> => {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('store_settings')
      .insert({
        user_id: userId,
        ...storeSettingsToDb(defaultStoreSettings),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating store settings:', error);
      return null;
    }

    const settings = dbToStoreSettings(data as Record<string, unknown>);
    await cacheStoreSettings(settings);
    return settings;
  } catch (error) {
    console.error('Error creating store settings:', error);
    return null;
  }
};

// Update store settings
export const updateStoreSettings = async (
  updates: Partial<StoreSettings>
): Promise<StoreSettings | null> => {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('store_settings')
      .update(storeSettingsToDb(updates))
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating store settings:', error);
      return null;
    }

    const settings = dbToStoreSettings(data as Record<string, unknown>);
    await cacheStoreSettings(settings);
    return settings;
  } catch (error) {
    console.error('Error updating store settings:', error);
    return null;
  }
};

// Upload logo
export const uploadLogo = async (base64Data: string): Promise<string | null> => {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    // Convert base64 to array buffer
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const fileName = `logos/${userId}/logo_${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('store-assets')
      .upload(fileName, bytes.buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('store-assets')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading logo:', error);
    return null;
  }
};

// Cache functions
const cacheStoreSettings = async (settings: StoreSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORE_SETTINGS_CACHE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error caching store settings:', error);
  }
};

const getCachedStoreSettings = async (): Promise<StoreSettings | null> => {
  try {
    const cached = await AsyncStorage.getItem(STORE_SETTINGS_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached) as StoreSettings;
    }
    return null;
  } catch (error) {
    console.error('Error getting cached store settings:', error);
    return null;
  }
};

// Store state management
type Listener = () => void;
const listeners: Set<Listener> = new Set();

interface StoreSettingsState {
  settings: StoreSettings | null;
  isLoading: boolean;
}

let state: StoreSettingsState = {
  settings: null,
  isLoading: true,
};

export const getStoreSettingsState = () => state;

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export const subscribeToStoreSettings = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const loadStoreSettings = async (): Promise<void> => {
  state = { ...state, isLoading: true };
  notifyListeners();

  const settings = await fetchStoreSettings();
  state = { settings, isLoading: false };
  notifyListeners();
};

export const saveStoreSettings = async (
  updates: Partial<StoreSettings>
): Promise<boolean> => {
  const updated = await updateStoreSettings(updates);
  if (updated) {
    state = { ...state, settings: updated };
    notifyListeners();
    return true;
  }
  return false;
};

// Get formatted currency
export const formatWithCurrency = (
  amount: number,
  settings?: StoreSettings | null
): string => {
  const symbol = settings?.currencySymbol || '₽';
  const formattedAmount = amount.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${formattedAmount} ${symbol}`;
};

// Calculate tax
export const calculateTax = (
  amount: number,
  settings?: StoreSettings | null
): { taxAmount: number; totalWithTax: number } => {
  const taxRate = settings?.taxRate || 0;
  const taxAmount = (amount * taxRate) / 100;
  return {
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalWithTax: Math.round((amount + taxAmount) * 100) / 100,
  };
};
