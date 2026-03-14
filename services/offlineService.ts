import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { logger } from '@/lib/logger';

// ============================================
// TYPES
// ============================================

export type OfflineOperationType =
  | 'create_order'
  | 'update_order'
  | 'update_stock'
  | 'create_product'
  | 'update_product';

export type OfflineOperationStatus =
  | 'pending'
  | 'syncing'
  | 'completed'
  | 'failed';

export interface OfflineOperation {
  id: string;
  type: OfflineOperationType;
  entityId: string;
  data: Record<string, unknown>;
  timestamp: string;
  retryCount: number;
  status: OfflineOperationStatus;
}

export type ConflictResolutionStrategy = 'keep_local' | 'keep_server' | 'merge';

export interface ConflictResolution {
  operationId: string;
  resolution: ConflictResolutionStrategy;
  resolvedAt: string;
  resolvedBy: string;
}

export interface OfflineDataSummary {
  pendingOrders: number;
  pendingStock: number;
  pendingProducts: number;
  totalPending: number;
  oldestPending: string | null;
}

export interface ProcessQueueResult {
  success: number;
  failed: number;
  conflicts: number;
}

// ============================================
// CONSTANTS
// ============================================

const OFFLINE_QUEUE_KEY = '@lkscale_offline_queue';
const CONFLICT_RESOLUTIONS_KEY = '@lkscale_conflict_resolutions';
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

// Queue processing lock to prevent race conditions
let isProcessingQueue = false;

// ============================================
// INTERNAL HELPERS
// ============================================

/**
 * Generate a unique identifier for operations.
 */
const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `offline_${timestamp}_${randomPart}`;
};

/**
 * Read the full queue from AsyncStorage.
 */
const readQueue = async (): Promise<OfflineOperation[]> => {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as OfflineOperation[];
  } catch (error) {
    logger.error('[OfflineService] Error reading queue:', error);
    return [];
  }
};

/**
 * Persist the full queue to AsyncStorage.
 */
const writeQueue = async (queue: OfflineOperation[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    logger.error('[OfflineService] Error writing queue:', error);
    throw new Error('Failed to persist offline queue');
  }
};

/**
 * Calculate exponential backoff delay for a given retry count.
 */
const getBackoffDelay = (retryCount: number): number => {
  // Exponential backoff: 1s, 2s, 4s (capped by MAX_RETRIES)
  const delay = BASE_BACKOFF_MS * Math.pow(2, retryCount);
  // Add jitter (±25%) to avoid thundering herd
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
};

/**
 * Wait for a specified number of milliseconds.
 */
const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Simulate a sync request to the server.
 * Returns true for success, false for failure, or throws for conflict.
 */
const simulateSyncRequest = async (
  operation: OfflineOperation
): Promise<'success' | 'conflict' | 'error'> => {
  // Simulate realistic network delay (200-800ms)
  const delay = 200 + Math.random() * 600;
  await wait(delay);

  // Simulate outcomes based on operation type and retry count
  // Higher retry counts have a better success rate (server issues may resolve)
  const successRate = Math.min(0.85 + operation.retryCount * 0.05, 0.95);
  const roll = Math.random();

  if (roll < successRate) {
    return 'success';
  }

  // 5% chance of conflict for update operations
  if (
    roll < successRate + 0.05 &&
    (operation.type === 'update_order' ||
      operation.type === 'update_stock' ||
      operation.type === 'update_product')
  ) {
    return 'conflict';
  }

  return 'error';
};

// ============================================
// PUBLIC API
// ============================================

/**
 * Check whether the device currently has network connectivity.
 */
export const isOnline = async (): Promise<boolean> => {
  try {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected === true;
  } catch (error) {
    logger.error('[OfflineService] Error checking network status:', error);
    return false;
  }
};

/**
 * Queue a new operation for later synchronization.
 */
export const queueOperation = async (
  type: OfflineOperationType,
  entityId: string,
  data: Record<string, unknown>
): Promise<OfflineOperation> => {
  const operation: OfflineOperation = {
    id: generateId(),
    type,
    entityId,
    data,
    timestamp: new Date().toISOString(),
    retryCount: 0,
    status: 'pending',
  };

  const queue = await readQueue();
  queue.push(operation);
  await writeQueue(queue);

  return operation;
};

/**
 * Get all operations that are currently pending or failed.
 */
export const getQueuedOperations = async (): Promise<OfflineOperation[]> => {
  const queue = await readQueue();
  return queue.filter(
    (op) => op.status === 'pending' || op.status === 'failed'
  );
};

/**
 * Get the count of pending operations (pending or failed).
 */
export const getQueueLength = async (): Promise<number> => {
  const queued = await getQueuedOperations();
  return queued.length;
};

/**
 * Process the entire offline queue, attempting to sync each pending operation.
 * Uses exponential backoff for retries and detects conflicts.
 */
export const processQueue = async (): Promise<ProcessQueueResult> => {
  // Prevent concurrent queue processing
  if (isProcessingQueue) {
    return { success: 0, failed: 0, conflicts: 0 };
  }

  const online = await isOnline();
  if (!online) {
    return { success: 0, failed: 0, conflicts: 0 };
  }

  isProcessingQueue = true;

  try {
    const queue = await readQueue();
  const result: ProcessQueueResult = {
    success: 0,
    failed: 0,
    conflicts: 0,
  };

  // Only process pending and failed (retryable) operations
  const toProcess = queue.filter(
    (op) =>
      op.status === 'pending' ||
      (op.status === 'failed' && op.retryCount < MAX_RETRIES)
  );

  if (toProcess.length === 0) {
    return result;
  }

  // Process operations sequentially to preserve ordering
  for (const operation of toProcess) {
    const index = queue.findIndex((op) => op.id === operation.id);
    if (index === -1) continue;

    // Apply backoff delay if this is a retry
    if (operation.retryCount > 0) {
      const backoffMs = getBackoffDelay(operation.retryCount);
      await wait(backoffMs);

      // Re-check connectivity after waiting
      const stillOnline = await isOnline();
      if (!stillOnline) {
        // Stop processing if we lost connectivity
        break;
      }
    }

    // Mark as syncing
    queue[index] = { ...queue[index], status: 'syncing' };
    await writeQueue(queue);

    try {
      const outcome = await simulateSyncRequest(operation);

      switch (outcome) {
        case 'success':
          queue[index] = { ...queue[index], status: 'completed' };
          result.success++;
          break;

        case 'conflict':
          queue[index] = { ...queue[index], status: 'failed', retryCount: MAX_RETRIES };
          result.conflicts++;
          break;

        case 'error':
          queue[index] = {
            ...queue[index],
            status: 'failed',
            retryCount: queue[index].retryCount + 1,
          };
          // Only count as failed if we've exhausted retries
          if (queue[index].retryCount >= MAX_RETRIES) {
            result.failed++;
          }
          break;
      }
    } catch (error) {
      logger.error(
        `[OfflineService] Unexpected error processing operation ${operation.id}:`,
        error
      );
      queue[index] = {
        ...queue[index],
        status: 'failed',
        retryCount: queue[index].retryCount + 1,
      };
      if (queue[index].retryCount >= MAX_RETRIES) {
        result.failed++;
      }
    }

    // Persist after each operation so progress is not lost
    await writeQueue(queue);
  }

  // Clean up completed operations from the queue
  const cleaned = queue.filter((op) => op.status !== 'completed');
  await writeQueue(cleaned);

    return result;
  } finally {
    isProcessingQueue = false;
  }
};

/**
 * Remove a single operation by ID from the queue.
 */
export const removeOperation = async (id: string): Promise<void> => {
  const queue = await readQueue();
  const filtered = queue.filter((op) => op.id !== id);

  if (filtered.length === queue.length) {
    logger.warn(`[OfflineService] Operation ${id} not found in queue`);
  }

  await writeQueue(filtered);
};

/**
 * Clear all operations from the queue.
 */
export const clearQueue = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (error) {
    logger.error('[OfflineService] Error clearing queue:', error);
    throw new Error('Failed to clear offline queue');
  }
};

/**
 * Get operations that have failed due to conflicts (exhausted retries).
 * Conflicts are update operations that reached max retries.
 */
export const getConflicts = async (): Promise<OfflineOperation[]> => {
  const queue = await readQueue();
  return queue.filter(
    (op) =>
      op.status === 'failed' &&
      op.retryCount >= MAX_RETRIES &&
      (op.type === 'update_order' ||
        op.type === 'update_stock' ||
        op.type === 'update_product')
  );
};

/**
 * Resolve a conflict by applying the chosen resolution strategy.
 */
export const resolveConflict = async (
  operationId: string,
  resolution: ConflictResolutionStrategy
): Promise<void> => {
  const queue = await readQueue();
  const index = queue.findIndex((op) => op.id === operationId);

  if (index === -1) {
    throw new Error(`Operation ${operationId} not found in queue`);
  }

  const operation = queue[index];

  if (operation.status !== 'failed' || operation.retryCount < MAX_RETRIES) {
    throw new Error(`Operation ${operationId} is not in a conflicted state`);
  }

  // Record the resolution
  const conflictResolution: ConflictResolution = {
    operationId,
    resolution,
    resolvedAt: new Date().toISOString(),
    resolvedBy: 'user',
  };

  try {
    // Persist resolution for audit purposes
    const existingRaw = await AsyncStorage.getItem(CONFLICT_RESOLUTIONS_KEY);
    const resolutions: ConflictResolution[] = existingRaw
      ? JSON.parse(existingRaw)
      : [];
    resolutions.push(conflictResolution);
    await AsyncStorage.setItem(
      CONFLICT_RESOLUTIONS_KEY,
      JSON.stringify(resolutions)
    );
  } catch (error) {
    console.error('[OfflineService] Error persisting conflict resolution:', error);
  }

  switch (resolution) {
    case 'keep_local':
      // Reset the operation so it can be retried with force-push semantics
      queue[index] = {
        ...operation,
        status: 'pending',
        retryCount: 0,
        data: {
          ...operation.data,
          _forceOverwrite: true,
          _resolvedConflict: true,
        },
      };
      break;

    case 'keep_server':
      // Discard the local change entirely
      queue.splice(index, 1);
      break;

    case 'merge':
      // Mark for merge — reset with merge flag so the sync layer
      // can attempt a field-level merge on the next attempt
      queue[index] = {
        ...operation,
        status: 'pending',
        retryCount: 0,
        data: {
          ...operation.data,
          _mergeStrategy: true,
          _resolvedConflict: true,
        },
      };
      break;
  }

  await writeQueue(queue);
};

/**
 * Get a summary of all offline pending data grouped by category.
 */
export const getOfflineDataSummary = async (): Promise<OfflineDataSummary> => {
  const queue = await readQueue();
  const pending = queue.filter(
    (op) => op.status === 'pending' || op.status === 'failed'
  );

  const pendingOrders = pending.filter(
    (op) => op.type === 'create_order' || op.type === 'update_order'
  ).length;

  const pendingStock = pending.filter(
    (op) => op.type === 'update_stock'
  ).length;

  const pendingProducts = pending.filter(
    (op) => op.type === 'create_product' || op.type === 'update_product'
  ).length;

  // Find the oldest pending operation
  let oldestPending: string | null = null;
  if (pending.length > 0) {
    const sorted = [...pending].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    oldestPending = sorted[0].timestamp;
  }

  return {
    pendingOrders,
    pendingStock,
    pendingProducts,
    totalPending: pending.length,
    oldestPending,
  };
};
