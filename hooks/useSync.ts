import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {
  syncAll,
  subscribeToSync,
  getSyncStatus,
  setOfflineStatus,
  loadCachedData,
  SyncStatus,
  SyncState,
  SyncAllResult,
} from '@/services/syncService';
import { getCurrentUserId } from '@/store/authStore';
import { logger } from '@/lib/logger';

export interface UseSyncOptions {
  autoSyncOnStart?: boolean;
  autoSyncOnReconnect?: boolean;
  syncInterval?: number; // in milliseconds
}

export interface UseSyncReturn {
  sync: () => Promise<void>;
  syncStatus: SyncStatus;
  syncProgress: number;
  currentEntity: string | null;
  lastSyncTime: string | null;
  syncError: string | null;
  isOffline: boolean;
  isLoading: boolean;
  data: Partial<SyncAllResult> | null;
}

export const useSync = (options: UseSyncOptions = {}): UseSyncReturn => {
  const {
    autoSyncOnStart = true,
    autoSyncOnReconnect = true,
    syncInterval,
  } = options;

  const [syncState, setSyncState] = useState<SyncState>(getSyncStatus());
  const [data, setData] = useState<Partial<SyncAllResult> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasOfflineRef = useRef(false);

  // Subscribe to sync state changes
  useEffect(() => {
    const unsubscribe = subscribeToSync((state) => {
      setSyncState(state);
    });
    return unsubscribe;
  }, []);

  // Load cached data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const cached = await loadCachedData();
        if (cached) {
          setData(cached);
        }
      } catch (error) {
        logger.error('Error loading cached data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Perform sync
  const sync = useCallback(async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      logger.warn('Cannot sync: no user logged in');
      return;
    }

    try {
      const result = await syncAll();
      setData(result);
    } catch (error) {
      logger.error('Sync failed:', error);
      // Keep existing data on error
    }
  }, []);

  // Auto-sync on start
  useEffect(() => {
    if (autoSyncOnStart) {
      const userId = getCurrentUserId();
      if (userId) {
        sync();
      }
    }
  }, [autoSyncOnStart, sync]);

  // Handle app state changes (sync when app comes to foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground, check if we need to sync
        const userId = getCurrentUserId();
        if (userId && syncState.lastSyncTime) {
          const lastSync = new Date(syncState.lastSyncTime);
          const now = new Date();
          const minutesSinceLastSync = (now.getTime() - lastSync.getTime()) / (1000 * 60);

          // Sync if more than 5 minutes since last sync
          if (minutesSinceLastSync > 5) {
            sync();
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [sync, syncState.lastSyncTime]);

  // Handle network state changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isConnected = state.isConnected ?? false;

      if (!isConnected) {
        wasOfflineRef.current = true;
        setOfflineStatus(true);
      } else if (wasOfflineRef.current && autoSyncOnReconnect) {
        // We were offline and now we're back online
        wasOfflineRef.current = false;
        setOfflineStatus(false);
        sync();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [autoSyncOnReconnect, sync]);

  // Periodic sync interval
  useEffect(() => {
    if (syncInterval && syncInterval > 0) {
      syncIntervalRef.current = setInterval(() => {
        const userId = getCurrentUserId();
        if (userId) {
          sync();
        }
      }, syncInterval);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [syncInterval, sync]);

  return {
    sync,
    syncStatus: syncState.status,
    syncProgress: syncState.progress,
    currentEntity: syncState.currentEntity,
    lastSyncTime: syncState.lastSyncTime,
    syncError: syncState.error,
    isOffline: syncState.isOffline,
    isLoading,
    data,
  };
};

export default useSync;
