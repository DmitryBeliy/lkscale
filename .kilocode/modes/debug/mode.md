# Debug Mode for Lkscale ERP

## Mode Purpose

Troubleshooting issues, investigating errors, diagnosing problems in the Lkscale ERP project.

## Debug Checklist

### 1. Supabase Connection Issues

**Symptoms**: Data not loading, realtime not working

**Check**:
```typescript
// Verify connection status in lib/supabase.ts
const connectionStatus = getConnectionStatus();
// Should be 'connected' for realtime to work

// Check subscription status
sub.subscribe((status) => {
  console.log('Subscription status:', status);
  // SUBSCRIBED = good, CHANNEL_ERROR = problem
});
```

**Common Causes**:
- Missing `EXPO_PUBLIC_SUPABASE_URL` or `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Network issues (offline mode triggered)
- Rate limiting (10 events/second limit exceeded)

### 2. State Not Updating

**Symptoms**: UI not reflecting data changes

**Check**:
```typescript
// Verify listener subscription
const unsubscribe = subscribe((state) => {
  console.log('State updated:', state);
});

// Check if notifyListeners() is called after state change
setDataState({ products: newProducts }); // Should trigger notifyListeners()
```

**Common Causes**:
- Missing `notifyListeners()` call after state update
- Component unsubscribed on unmount
- Listener added inside useEffect without cleanup

### 3. Demo Mode Not Working

**Symptoms**: App tries to connect to Supabase in demo mode

**Check**:
```typescript
// Verify isDemoUser() check
console.log('Is demo user:', isDemoUser());

// Check if EXPO_PUBLIC_DEMO_PASSWORD is set
const demoPassword = process.env.EXPO_PUBLIC_DEMO_PASSWORD;
```

**Common Causes**:
- Missing demo password in environment
- `isDemoUser()` check forgotten before Supabase call
- Mock data not properly structured

### 4. Offline Queue Issues

**Symptoms**: Changes not syncing when back online

**Check**:
```typescript
// Verify isProcessingQueue flag
console.log('Processing:', isProcessingQueue);

// Check queue contents
const queue = await AsyncStorage.getItem('@lkscale_offline_queue');
console.log('Queue:', queue);
```

**Common Causes**:
- `isProcessingQueue` stuck at `true` (error not caught)
- Queue items malformed
- Network restored but processQueue() not called

### 5. Cache Issues

**Symptoms**: Stale data displayed

**Check**:
```typescript
// Verify cache keys use @lkscale_ prefix
const keys = await AsyncStorage.getAllKeys();
console.log('Cache keys:', keys.filter(k => k.startsWith('@lkscale_')));

// Check cache content
const cached = await AsyncStorage.getItem('@lkscale_products');
console.log('Cached products:', cached ? JSON.parse(cached).length : 0);
```

### 6. TypeScript Errors

**Common Issues**:

```typescript
// ❌ NodeJS.Timeout (Node.js only)
// ✅ ReturnType<typeof setInterval> (cross-platform)

// ❌ Missing type imports
import { Product } from './types';
// ✅ Correct type import
import type { Product } from './types';
```

### 7. Memory Leaks

**Symptoms**: App slows down over time, crashes

**Check**:
```typescript
// Verify cleanup in useEffect
useEffect(() => {
  const sub = subscribe(callback);
  return () => sub(); // Cleanup required!
}, []);
```

**Common Causes**:
- Subscriptions not unsubscribed
- Event listeners not removed
- setInterval not cleared

## Debug Tools

### Logger
```typescript
import logger from '@/lib/logger';
logger.debug('Debug message', { context: 'data' });
logger.error('Error occurred', error);
```

### Supabase Query Debug
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .limit(10);
  
if (error) {
  console.error('Supabase error:', error.message, error.details);
}
```

## Environment Verification

```bash
# Check .env exists and has required vars
cat .env | grep EXPO_PUBLIC

# Required:
# EXPO_PUBLIC_SUPABASE_URL=
# EXPO_PUBLIC_SUPABASE_ANON_KEY=
# EXPO_PUBLIC_DEMO_PASSWORD= (optional, for demo mode)
```

## Debugging Steps

1. **Enable detailed logging** in logger.ts
2. **Check browser console** (for web) or **Flipper** (for mobile)
3. **Verify environment variables** loaded correctly
4. **Test with demo mode first** (no network dependencies)
5. **Isolate the component** causing issues
6. **Check for race conditions** with isProcessingQueue pattern
