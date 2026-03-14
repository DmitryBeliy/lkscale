# AGENTS.md - Lkscale ERP

## Project Overview

**Lkscale ERP** is a React Native (Expo) mobile application for retail business management with Supabase backend.

- **Framework**: React Native 0.81.5 + Expo SDK 54
- **Routing**: Expo Router 6 (File-based)
- **State**: Custom Pub/Sub Store pattern
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Language**: TypeScript 5.9

---

## Quick Reference

### Project Structure
```
app/                    # Expo Router screens
├── (tabs)/             # Bottom tab navigation
├── warehouse/          # Warehouse operations
├── customers/          # CRM
├── orders/             # Order management
├── settings/           # App settings
├── team/               # Team management
└── ...

components/             # React components
├── ui/                 # Base UI components
├── charts/             # Charts & visualizations
└── warehouse/          # Warehouse components

store/                  # State management
├── authStore.ts        # Authentication
├── dataStore.ts        # Business data
├── customers/          # Customer feature module
├── orders/             # Order feature module
├── products/           # Product feature module
└── core/               # Core utilities

services/               # Business logic
├── aiInsights.ts       # AI analytics
├── analyticsService.ts # Analytics
├── warehouseService.ts # Warehouse operations
├── offlineService.ts   # Offline mode
└── ...

lib/                    # Infrastructure
├── supabase.ts         # Supabase client
└── supabaseDataService.ts # Data operations

types/                  # TypeScript types
├── index.ts            # Core types
├── database.ts         # Supabase types
└── enterprise.ts       # Enterprise types

contexts/               # React Contexts
├── AuthContext.tsx
├── ThemeContext.tsx
└── OnboardingContext.tsx
```

---

## Critical Patterns

### State Management (Custom Pub/Sub)
```typescript
// store uses Set<Listener> pattern with notifyListeners()
// State updates via setAuthState() / setDataState() merge partial updates

import { getAuthState, subscribeAuth, setAuthState } from '@/store/authStore';

// Subscribe to changes
const unsubscribe = subscribeAuth((state) => {
  console.log('Auth changed:', state);
});

// Update state (merges partial updates)
setAuthState({ isLoading: true });
```

### Supabase Integration
```typescript
// Auth uses AsyncStorage (not SecureStore) for session persistence
// Realtime limited to 10 events/second
// Environment variables use EXPO_PUBLIC_ prefix

import { supabase } from '@/lib/supabase';

// Check demo mode before DB operations
import { isDemoUser } from '@/store/authStore';
if (isDemoUser()) { /* use mock data */ }
```

### Data Layer
```typescript
// Dual data source: Supabase (online) + local mock data (offline/demo)
// Cache keys use @lkscale_ prefix for AsyncStorage
// Race condition protection: isProcessingQueue lock in offlineService.ts

import { fetchProducts, createProduct } from '@/store/dataStore';
```

### Navigation (Expo Router)
```typescript
// File-based routing in app/ directory
// Route groups: (tabs) for bottom navigation
// Modal routes use + prefix

import { useRouter } from 'expo-router';
const router = useRouter();

router.push('/order/create');
router.push('/product/123');
```

---

## Common Tasks

### Add New Screen
1. Create file: `app/screen-name/index.tsx`
2. Follow existing screen patterns from `app/(tabs)/index.tsx`
3. Add to navigation if needed

### Add Component
1. Create file: `components/ComponentName.tsx`
2. For UI components: `components/ui/ComponentName.tsx`
3. Export from `components/ui/index.ts` if reusable

### Add Type
1. Core types: `types/index.ts`
2. Enterprise types: `types/enterprise.ts`
3. Database types: `types/database.ts` (auto-generated)

### Add API Method
1. Add to `lib/supabaseDataService.ts` for data operations
2. Add to `services/*.ts` for business logic

### Add Store Module
1. Create folder: `store/featureName/`
2. Files: `featureStore.ts`, `featureActions.ts`, `featureTypes.ts`, `index.ts`
3. Follow pattern from `store/customers/`

---

## Environment Variables

Required in `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://onnncepenxxxfprqaodu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_DEMO_PASSWORD=Demo123456!
```

---

## Build Commands

```bash
# Development
npm start              # Start Expo development server
npm run android        # Start for Android
npm run ios            # Start for iOS
npm run web            # Start for Web

# Building
npm run build:web      # Export for web (Vercel)
npm run build:dev      # EAS development build
npm run build:preview  # EAS preview build
npm run build:production # EAS production build

# Deploy
npm run deploy:vercel  # Deploy to Vercel
```

---

## Testing

No test suite configured currently. Manual testing via:
- Expo Go app
- Development builds

---

## Critical Gotchas

1. **UUID Generation**: Use `gen_random_uuid()` in SQL, NOT `uuid_generate_v4()`
2. **Image Handling**: Use `expo-image` (not React Native Image)
3. **Haptics**: Always wrap in try/catch (fails on some Android)
4. **Offline Queue**: Protected by `isProcessingQueue` flag
5. **TypeScript**: Uses `type` imports - enable `verbatimModuleSyntax`

---

## MCP Servers

Configured in `.kilocode/mcp.json`:
- **Supabase MCP**: Database operations, migrations, edge functions

---

## Links

- **Production**: https://lkscale-f4bvftv4k-234s-projects-4b7ca098.vercel.app
- **Supabase**: https://app.supabase.com/project/onnncepenxxxfprqaodu
- **Full Index**: `docs/CODEBASE_INDEX.md`

---

*Last Updated: March 2026*
