# Code Mode for Lkscale ERP

## Mode Purpose

Writing, modifying, and refactoring code for the Lkscale ERP project. Implementing features, fixing bugs, creating new files, and making code improvements.

## Critical Implementation Rules

### 1. State Management Pattern

**MUST** use custom Pub/Sub store, NOT Redux/Zustand:

```typescript
// ✅ CORRECT - Custom Pub/Sub
const listeners = new Set<Listener>();
export const subscribe = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const notifyListeners = () => listeners.forEach(l => l(state));

// ❌ WRONG - Don't use Redux/Zustand
import { create } from 'zustand';
```

### 2. Supabase Realtime Setup

```typescript
// ✅ CORRECT
const sub = supabase
  .channel('products')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, callback)
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      setIsConnected(true);
    }
  });

// Cleanup is REQUIRED
return () => {
  sub.unsubscribe();
};
```

### 3. Demo Mode Check

**ALWAYS** check before Supabase operations:

```typescript
// ✅ CORRECT
if (isDemoUser()) {
  // Return mock data
  return mockProducts;
}
// Proceed with Supabase call
const { data, error } = await supabase.from('products').select('*');

// ❌ WRONG - No demo check
const { data } = await supabase.from('products').select('*');
```

### 4. AsyncStorage Keys

**MUST** use `@lkscale_` prefix:

```typescript
// ✅ CORRECT
await AsyncStorage.setItem('@lkscale_products', JSON.stringify(data));
await AsyncStorage.getItem('@lkscale_user');

// ❌ WRONG - Missing prefix
await AsyncStorage.setItem('products', JSON.stringify(data));
```

### 5. Environment Variables

**MUST** use `EXPO_PUBLIC_` prefix:

```typescript
// ✅ CORRECT
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// ❌ WRONG
const url = process.env.SUPABASE_URL;
```

### 6. Cross-Platform Types

```typescript
// ✅ CORRECT - Works on all platforms
private flushInterval: ReturnType<typeof setInterval> | null = null;

// ❌ WRONG - Node.js only
private flushInterval: NodeJS.Timeout | null = null;
```

### 7. Haptics Safety

```typescript
// ✅ CORRECT - Always wrap in try/catch
import * as Haptics from 'expo-haptics';
try {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
} catch {
  // Fails silently on some Android devices
}
```

### 8. Offline Queue Pattern

```typescript
// ✅ CORRECT - Use isProcessingQueue lock
let isProcessingQueue = false;

export const processQueue = async () => {
  if (isProcessingQueue) return;
  isProcessingQueue = true;
  try {
    // Process items...
  } finally {
    isProcessingQueue = false;
  }
};
```

### 9. Image Components

```typescript
// ✅ CORRECT - Use expo-image
import { Image } from 'expo-image';
<Image source={{ uri }} style={{ width: 100, height: 100 }} />;

// ❌ WRONG - Don't use React Native Image
import { Image } from 'react-native';
```

### 10. Navigation

```typescript
// ✅ CORRECT - Expo Router
import { useRouter } from 'expo-router';
const router = useRouter();
router.push('/product/123');

// Modal routes use + prefix
router.push('/+create-product');
```

## Code Style

- Use `type` imports: `import type { Product } from './types'`
- Enable `verbatimModuleSyntax` in tsconfig
- Use functional components with hooks
- Prefer `const` over `let`
- Use async/await over promises
- Always handle errors explicitly

## Testing During Development

- Test on both iOS and Android
- Test offline behavior (airplane mode)
- Test demo mode without Supabase connection
- Verify cleanup functions prevent memory leaks
