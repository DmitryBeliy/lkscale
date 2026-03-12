# Review Mode for Lkscale ERP

## Mode Purpose

Code review for the Lkscale ERP project. Reviewing uncommitted work, comparing branches, analyzing changes before merging.

## Review Checklist

### 1. State Management Pattern

**Must Verify**:
- ✅ Uses custom Pub/Sub store (not Redux/Zustand)
- ✅ `Set<Listener>` pattern implemented
- ✅ `notifyListeners()` called after state updates
- ✅ Cleanup functions return from subscribe()

**Red Flags**:
- ❌ Import from 'zustand' or 'redux'
- ❌ Missing notifyListeners() after setDataState()
- ❌ No cleanup function for subscriptions

### 2. Supabase Integration

**Must Verify**:
- ✅ `isDemoUser()` check before Supabase calls
- ✅ `AsyncStorage` used for auth (not SecureStore)
- ✅ Realtime uses `eventsPerSecond: 10`
- ✅ Connection status tracking implemented
- ✅ Proper error handling for Supabase calls

**Red Flags**:
- ❌ Direct Supabase calls without demo check
- ❌ Missing error handling
- ❌ No subscription cleanup

### 3. Environment Variables

**Must Verify**:
- ✅ All env vars use `EXPO_PUBLIC_` prefix
- ✅ No hardcoded secrets in code
- ✅ Demo password from `EXPO_PUBLIC_DEMO_PASSWORD`

**Red Flags**:
- ❌ Hardcoded API keys or passwords
- ❌ Missing EXPO_PUBLIC_ prefix
- ❌ .env file committed to repo

### 4. Cross-Platform Compatibility

**Must Verify**:
- ✅ `ReturnType<typeof setInterval>` instead of `NodeJS.Timeout`
- ✅ `expo-image` used instead of React Native Image
- ✅ Haptics wrapped in try/catch
- ✅ No platform-specific code without checks

### 5. AsyncStorage Keys

**Must Verify**:
- ✅ All keys use `@lkscale_` prefix
- ✅ Consistent naming convention

**Examples**:
```typescript
// ✅ CORRECT
@lkscale_products
@lkscale_user
@lkscale_offline_queue

// ❌ WRONG
products
userData
```

### 6. Offline-First Pattern

**Must Verify**:
- ✅ `isProcessingQueue` flag used
- ✅ Queue processing has try/finally
- ✅ Mock data available for demo mode

```typescript
// ✅ CORRECT Pattern
let isProcessingQueue = false;
const processQueue = async () => {
  if (isProcessingQueue) return;
  isProcessingQueue = true;
  try {
    // Process items
  } finally {
    isProcessingQueue = false;
  }
};
```

### 7. TypeScript Quality

**Must Verify**:
- ✅ `type` imports used: `import type { Product }`
- ✅ No `any` types without justification
- ✅ Proper return types on functions

### 8. Security

**Must Verify**:
- ✅ No SQL injection vulnerabilities
- ✅ Input validation on user data
- ✅ Proper auth checks on protected routes
- ✅ No sensitive data in logs

## Review Priorities

1. **Critical**: Security issues, hardcoded secrets
2. **High**: Demo mode checks missing, state management bugs
3. **Medium**: TypeScript errors, missing error handling
4. **Low**: Code style, naming conventions

## Common Review Comments

- "Add `isDemoUser()` check before Supabase call"
- "Use `@lkscale_` prefix for AsyncStorage key"
- "Add cleanup function for subscription"
- "Replace `NodeJS.Timeout` with `ReturnType<typeof setInterval>`"
- "Add try/catch around Haptics call"
- "Use `import type` for type-only imports"

## Special Files to Review Carefully

- `store/*.ts` - State management patterns
- `lib/supabase.ts` - Supabase configuration
- `services/*.ts` - Business logic and API calls
- `app/**/*.tsx` - Page components with data fetching
