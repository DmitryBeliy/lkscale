# Ask Mode for Lkscale ERP

## Mode Purpose

Answering questions, providing explanations, and documentation about the Lkscale ERP project without making code changes.

## Project Architecture Overview

### Tech Stack
- **Framework**: React Native with Expo SDK 54
- **Backend**: Supabase (PostgreSQL + Realtime)
- **State**: Custom Pub/Sub implementation
- **Storage**: AsyncStorage
- **Routing**: Expo Router (file-based)
- **Images**: expo-image
- **Auth**: Supabase Auth with AsyncStorage

### State Management (Custom Pub/Sub)

**Why Custom?**
- Lightweight alternative to Redux/Zustand
- No additional dependencies
- Full control over subscription lifecycle
- Optimized for mobile performance

**How It Works**:
```typescript
// 1. Create listeners set
const listeners = new Set<(state: State) => void>();

// 2. Subscribe function
export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener); // Cleanup
};

// 3. Notify on state change
const notifyListeners = () => listeners.forEach(l => l(state));

// 4. Update state
export const setState = (update) => {
  state = { ...state, ...update };
  notifyListeners();
};
```

### Dual Data Architecture

**Online Mode** (Production):
- Supabase for data persistence
- Realtime subscriptions for live updates
- Full CRUD operations

**Demo/Offline Mode**:
- Mock data from `store/mocks/mockData.ts`
- No network requests
- Local mutations only
- Useful for testing and demos

**Switching**:
```typescript
const isDemoUser = () => {
  const user = getCurrentUser();
  return user?.email === `demo@${process.env.EXPO_PUBLIC_DEMO_PASSWORD}`;
};
```

### Supabase Realtime

**Configuration**:
```typescript
.supabase
  .channel('table')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'products' 
  }, callback)
  .subscribe();
```

**Limitations**:
- 10 events/second limit
- Requires `eventsPerSecond: 10` in config
- Connection status tracked manually

### File Structure

```
app/              # Expo Router pages
├── (tabs)/       # Bottom tab navigation
├── auth/         # Auth-related screens
├── product/      # Product detail/edit
├── warehouse/    # Warehouse operations
└── ...

store/            # State management
├── authStore.ts  # Auth state
├── dataStore.ts  # Main data (products, orders)
├── */            # Feature-specific stores
│   ├── actions.ts
│   ├── store.ts
│   └── types.ts

services/         # Business logic
├── offlineService.ts
├── warehouseService.ts
└── ...

lib/              # Utilities
├── supabase.ts   # Supabase client
└── logger.ts     # Logging
```

### Key Patterns

**1. Offline Queue**:
```typescript
// Queue changes when offline
const queueChange = (operation) => {
  queue.push(operation);
  AsyncStorage.setItem('@lkscale_offline_queue', JSON.stringify(queue));
};

// Process when back online
const processQueue = async () => {
  if (isProcessingQueue) return;
  isProcessingQueue = true;
  try {
    for (const op of queue) {
      await supabase.from(op.table).[op.type](op.data);
    }
  } finally {
    isProcessingQueue = false;
  }
};
```

**2. Cache Strategy**:
```typescript
const CACHE_KEY = '@lkscale_products';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCached = async () => {
  const cached = await AsyncStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  }
  return null;
};
```

### Common Questions

**Q: Why not use Redux or Zustand?**
A: Custom implementation is lighter, has no dependencies, and gives full control over subscription management critical for mobile performance.

**Q: How does offline mode work?**
A: Changes are queued in AsyncStorage and processed when connection restored. Demo mode uses mock data with no network calls.

**Q: What's the difference between AsyncStorage and SecureStore?**
A: AsyncStorage is used here (not encrypted) for compatibility. Supabase auth tokens are stored here. For highly sensitive data, consider SecureStore.

**Q: How do I add a new page?**
A: Create a file in `app/` directory. Use `(tabs)/` for bottom navigation, `+` prefix for modals.

**Q: How do I add a new store?**
A: Create directory in `store/` with `store.ts`, `actions.ts`, `types.ts`, and `index.ts`. Follow existing Pub/Sub pattern.

### Environment Setup

Required variables in `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_DEMO_PASSWORD=demo123 (optional)
```

### Build Commands

```bash
# Development
npx expo start

# Web (for Vercel)
expo export --platform web

# Native builds
eas build --platform ios --profile development
eas build --platform android --profile development
```
