import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { SyncStatus, SyncState, SyncConflict } from '@/types';

const SYNC_STATE_KEY = '@lkscale_sync_state';
const PENDING_CHANGES_KEY = '@lkscale_pending_changes';
const CONFLICTS_KEY = '@lkscale_conflicts';

// Simple state management
type Listener = () => void;
const listeners: Set<Listener> = new Set();

let syncState: SyncState = {
  status: 'synced',
  lastSyncTime: null,
  pendingChanges: 0,
  conflicts: [],
};

export const getSyncState = () => syncState;

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

export const subscribeSync = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const setSyncState = (updates: Partial<SyncState>) => {
  syncState = { ...syncState, ...updates };
  notifyListeners();
  cacheSyncState();
};

// Cache sync state
const cacheSyncState = async () => {
  try {
    await AsyncStorage.setItem(SYNC_STATE_KEY, JSON.stringify(syncState));
  } catch (error) {
    console.error('Error caching sync state:', error);
  }
};

// Load sync state
export const loadSyncState = async () => {
  try {
    const cached = await AsyncStorage.getItem(SYNC_STATE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as SyncState;
      syncState = parsed;
      notifyListeners();
    }

    // Check network status
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      setSyncState({ status: 'offline' });
    }
  } catch (error) {
    console.error('Error loading sync state:', error);
  }
};

// Initialize network listener
export const initSyncMonitor = () => {
  return NetInfo.addEventListener((state) => {
    if (!state.isConnected) {
      setSyncState({ status: 'offline' });
    } else if (syncState.status === 'offline') {
      // Network restored, check for pending changes
      if (syncState.pendingChanges > 0) {
        setSyncState({ status: 'pending' });
      } else {
        setSyncState({ status: 'synced' });
      }
    }
  });
};

// Add pending change
export const addPendingChange = async (
  entityType: 'order' | 'product' | 'customer',
  entityId: string,
  changeData: Record<string, unknown>
) => {
  try {
    const pendingChanges = await getPendingChanges();
    pendingChanges.push({
      id: `change-${Date.now()}`,
      entityType,
      entityId,
      data: changeData,
      timestamp: new Date().toISOString(),
    });

    await AsyncStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(pendingChanges));
    setSyncState({
      pendingChanges: pendingChanges.length,
      status: syncState.status === 'synced' ? 'pending' : syncState.status,
    });
  } catch (error) {
    console.error('Error adding pending change:', error);
  }
};

// Get pending changes
const getPendingChanges = async (): Promise<Array<{
  id: string;
  entityType: string;
  entityId: string;
  data: Record<string, unknown>;
  timestamp: string;
}>> => {
  try {
    const cached = await AsyncStorage.getItem(PENDING_CHANGES_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error('Error getting pending changes:', error);
    return [];
  }
};

// Simulate sync process
export const performSync = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) {
    setSyncState({ status: 'offline' });
    return false;
  }

  setSyncState({ status: 'syncing' });

  try {
    // Simulate network sync
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const pendingChanges = await getPendingChanges();

    // Simulate potential conflicts (for demo, randomly create a conflict)
    if (pendingChanges.length > 0 && Math.random() < 0.1) {
      const conflictChange = pendingChanges[0];
      const newConflict: SyncConflict = {
        id: `conflict-${Date.now()}`,
        entityType: conflictChange.entityType as 'order' | 'product' | 'customer',
        entityId: conflictChange.entityId,
        localData: conflictChange.data,
        serverData: {
          ...conflictChange.data,
          updatedAt: new Date().toISOString(),
          version: 'server',
        },
        timestamp: new Date().toISOString(),
      };

      setSyncState({
        status: 'conflict',
        conflicts: [...syncState.conflicts, newConflict],
      });
      return false;
    }

    // Clear pending changes after successful sync
    await AsyncStorage.removeItem(PENDING_CHANGES_KEY);

    setSyncState({
      status: 'synced',
      lastSyncTime: new Date().toISOString(),
      pendingChanges: 0,
    });

    return true;
  } catch (error) {
    console.error('Sync error:', error);
    setSyncState({ status: 'pending' });
    return false;
  }
};

// Resolve conflict
export const resolveConflict = async (
  conflictId: string,
  resolution: 'local' | 'server'
): Promise<void> => {
  const conflict = syncState.conflicts.find((c) => c.id === conflictId);
  if (!conflict) return;

  try {
    // Apply the chosen resolution
    if (resolution === 'local') {
      // Keep local changes - already in pending changes
      console.log('Keeping local changes:', conflict.localData);
    } else {
      // Accept server changes
      console.log('Accepting server changes:', conflict.serverData);
      // In a real app, you would update the local data with server data
    }

    // Remove the resolved conflict
    const updatedConflicts = syncState.conflicts.filter((c) => c.id !== conflictId);

    setSyncState({
      conflicts: updatedConflicts,
      status: updatedConflicts.length > 0 ? 'conflict' : 'pending',
    });

    // Trigger another sync
    if (updatedConflicts.length === 0) {
      await performSync();
    }
  } catch (error) {
    console.error('Error resolving conflict:', error);
  }
};

// Get sync status icon name
export const getSyncStatusIcon = (): string => {
  switch (syncState.status) {
    case 'synced':
      return 'cloud-done';
    case 'pending':
      return 'cloud-upload';
    case 'syncing':
      return 'sync';
    case 'offline':
      return 'cloud-offline';
    case 'conflict':
      return 'warning';
    default:
      return 'cloud';
  }
};

// Get sync status color
export const getSyncStatusColor = (colors: { success: string; warning: string; error: string; textLight: string }): string => {
  switch (syncState.status) {
    case 'synced':
      return colors.success;
    case 'pending':
    case 'syncing':
      return colors.warning;
    case 'offline':
      return colors.textLight;
    case 'conflict':
      return colors.error;
    default:
      return colors.textLight;
  }
};

// Force offline mode (for testing)
export const setOfflineMode = (offline: boolean) => {
  setSyncState({ status: offline ? 'offline' : 'synced' });
};
