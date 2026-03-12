# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview

Lkscale ERP is a React Native (Expo) mobile application for retail business management with Supabase backend.

## Critical Non-Obvious Patterns

### State Management
- **Custom Pub/Sub Store**: Uses custom implementation in `store/` instead of Redux/Zustand
  - `authStore.ts`, `dataStore.ts` use `Set<Listener>` pattern with `notifyListeners()`
  - State updates via `setAuthState()` / `setDataState()` merge partial updates
  - Realtime subscriptions managed manually with cleanup functions (`unsubProducts`, etc.)

### Supabase Integration
- **Auth Storage**: Uses `AsyncStorage` (not SecureStore) for session persistence
- **Realtime Params**: Limited to 10 events/second (`eventsPerSecond: 10`)
- **Connection Management**: Custom connection status tracking in `lib/supabase.ts`
- **Environment Variables**: Must use `EXPO_PUBLIC_` prefix (Expo SDK 54 requirement)

### Data Layer
- **Dual Data Source**: Supports both Supabase (online) and local mock data (offline/demo mode)
- **Demo Mode**: Check `isDemoUser()` before Supabase operations to prevent real DB writes
- **Cache Keys**: All use `@lkscale_` prefix for AsyncStorage
- **Race Condition Protection**: `isProcessingQueue` lock in `offlineService.ts`

### Navigation
- **Expo Router**: File-based routing in `app/` directory
- **Route Groups**: `(tabs)` for bottom navigation
- **Modal Routes**: Use `+` prefix for modal screens

### Build & Deploy
- **Platform-specific builds**: EAS Build profiles (development/preview/production)
- **Web Export**: `expo export --platform web` for Vercel
- **Environment**: Requires `.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Critical Gotchas
1. **UUID Generation**: Use `gen_random_uuid()` in SQL, not `uuid_generate_v4()` (different Postgres versions)
2. **Image Handling**: Use `expo-image` (not React Native Image) for better performance
3. **Haptics**: Always wrap in try/catch (fails on some Android devices)
4. **Offline Queue**: Processing protected by `isProcessingQueue` flag to prevent race conditions
5. **TypeScript**: Uses `type` imports - enable `verbatimModuleSyntax` in tsconfig

### Testing
- No test suite configured currently
- Manual testing via Expo Go or development builds

### Migration
- SQL files in `docs/base/migration_sql/`
- Split into <400KB chunks for Supabase SQL Editor limits
- Use `part_001.sql` → `part_009.sql` order
