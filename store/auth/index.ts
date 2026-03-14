/**
 * Auth Store Module
 * Re-exports from existing authStore for consistency
 */

export {
  getAuthState,
  subscribeAuth,
  setAuthState,
  initializeAuth,
  login,
  logout,
  updateUser,
  getCurrentUserId,
  refreshUserProfile,
} from '@/store/authStore';

// Note: authStore.ts already exists and contains all auth logic.
// This module provides a unified interface for the new store structure.
