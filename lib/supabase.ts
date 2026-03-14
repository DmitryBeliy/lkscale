import 'react-native-url-polyfill/auto';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Database } from '@/types/database';
import { logger } from '@/lib/logger';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  logger.error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Connection status management
type ConnectionListener = (isConnected: boolean) => void;
const connectionListeners: Set<ConnectionListener> = new Set();
let isConnectedToSupabase = true;
let isNetworkConnected = true;

export const getConnectionStatus = () => ({
  isConnected: isConnectedToSupabase && isNetworkConnected,
  isOnline: isNetworkConnected,
  isSupabaseConnected: isConnectedToSupabase,
});

export const subscribeToConnectionStatus = (listener: ConnectionListener): (() => void) => {
  connectionListeners.add(listener);
  // Immediately notify with current status
  listener(isConnectedToSupabase && isNetworkConnected);
  return () => {
    connectionListeners.delete(listener);
  };
};

const notifyConnectionListeners = () => {
  const isConnected = isConnectedToSupabase && isNetworkConnected;
  connectionListeners.forEach((listener) => listener(isConnected));
};

// Handle app state changes for token refresh
const handleAppStateChange = (state: AppStateStatus) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
    // Re-check connection when app becomes active
    checkSupabaseConnection();
  } else {
    supabase.auth.stopAutoRefresh();
  }
};

// Check if Supabase is reachable
const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('users').select('id').limit(1).maybeSingle();
    // RLS may block the query, but if we get a response (even empty), we're connected
    isConnectedToSupabase = !error || error.code === 'PGRST116'; // PGRST116 = no rows returned
    notifyConnectionListeners();
    return isConnectedToSupabase;
  } catch (err) {
    isConnectedToSupabase = false;
    notifyConnectionListeners();
    return false;
  }
};

// Handle network state changes
const handleNetworkChange = (state: NetInfoState) => {
  const wasConnected = isNetworkConnected;
  isNetworkConnected = state.isConnected ?? false;

  if (isNetworkConnected && !wasConnected) {
    // Network restored, check Supabase connection
    checkSupabaseConnection();
  } else if (!isNetworkConnected) {
    isConnectedToSupabase = false;
    notifyConnectionListeners();
  }
};

// Initialize connection monitoring
export const initConnectionMonitor = () => {
  // App state listener
  const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

  // Network listener
  const netInfoUnsubscribe = NetInfo.addEventListener(handleNetworkChange);

  // Initial connection check
  NetInfo.fetch().then(handleNetworkChange);
  checkSupabaseConnection();

  return () => {
    appStateSubscription.remove();
    netInfoUnsubscribe();
  };
};

// Realtime subscription helpers
export const createRealtimeChannel = (
  channelName: string,
  table: string,
  filter?: string
): RealtimeChannel => {
  const channel = supabase.channel(channelName);
  return channel;
};

// Storage helpers
export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const uploadFile = async (
  bucket: string,
  path: string,
  file: Blob | ArrayBuffer,
  contentType: string
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType,
      upsert: true,
    });

    if (error) {
      return { url: null, error: new Error(error.message) };
    }

    const url = getPublicUrl(bucket, path);
    return { url, error: null };
  } catch (error) {
    return { url: null, error: error as Error };
  }
};

export const deleteFile = async (
  bucket: string,
  paths: string[]
): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) {
      return { error: new Error(error.message) };
    }
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

// Base64 to ArrayBuffer conversion
const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Upload file from base64 string
export const uploadBase64File = async (
  bucket: string,
  path: string,
  base64Data: string,
  contentType: string = 'image/jpeg'
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const arrayBuffer = base64ToArrayBuffer(base64Data);
    const { error } = await supabase.storage.from(bucket).upload(path, arrayBuffer, {
      contentType,
      upsert: true,
    });

    if (error) {
      return { url: null, error: new Error(error.message) };
    }

    const url = getPublicUrl(bucket, path);
    return { url, error: null };
  } catch (error) {
    return { url: null, error: error as Error };
  }
};

// Export types
export type { Database };
export type Tables = Database['public']['Tables'];
export type DbUser = Tables['users']['Row'];
export type DbProduct = Tables['products']['Row'];
export type DbCustomer = Tables['customers']['Row'];
export type DbOrder = Tables['orders']['Row'];
