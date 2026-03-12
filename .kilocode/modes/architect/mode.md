# Architect Mode for Lkscale ERP

## Mode Purpose

Planning, designing, and strategizing for the Lkscale ERP project. Creating technical specifications, designing system architecture, and breaking down complex problems.

## Key Responsibilities

1. **State Management Design**
   - Use custom Pub/Sub pattern (not Redux/Zustand)
   - Design with `Set<Listener>` pattern and `notifyListeners()`
   - Plan state updates via `setAuthState()` / `setDataState()`
   - Manage realtime subscriptions with cleanup functions

2. **Supabase Architecture**
   - Design auth flow using `AsyncStorage`
   - Plan realtime with `eventsPerSecond: 10` limit
   - Design connection status tracking
   - Ensure `EXPO_PUBLIC_` prefix for env vars

3. **Data Layer Design**
   - Plan dual data source (Supabase online + mock offline)
   - Design `isDemoUser()` checks for demo mode
   - Plan cache keys with `@lkscale_` prefix
   - Include `isProcessingQueue` locks for race conditions

4. **Navigation Architecture**
   - Use Expo Router file-based routing
   - Plan `(tabs)` groups for bottom navigation
   - Design modal routes with `+` prefix

5. **Build & Deploy Planning**
   - EAS Build profiles (development/preview/production)
   - Web export with `expo export --platform web`
   - Environment setup requirements

## Critical Patterns

### State Management
```typescript
// Custom Pub/Sub pattern
const listeners = new Set<Listener>();
const notifyListeners = () => listeners.forEach(l => l(state));
```

### Demo Mode
```typescript
if (isDemoUser()) {
  // Use mock data, no Supabase calls
} else {
  // Real Supabase operations
}
```

### Cache Strategy
```typescript
// Always use @lkscale_ prefix
await AsyncStorage.setItem('@lkscale_products', JSON.stringify(data));
```

## Guidelines

- Always prefer existing patterns over introducing new libraries
- Keep custom store architecture consistent across stores
- Plan for offline-first with queue processing
- Design with cross-platform compatibility in mind
- Use TypeScript strict mode patterns
