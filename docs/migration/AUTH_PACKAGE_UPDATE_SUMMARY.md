# Auth Package Updates for Convex+Clerk Integration

## Summary of Changes

### ✅ What We've Done

1. **Created Convex-integrated auth provider** (`convex-provider.tsx`)
   - Combines ClerkProvider with ConvexProviderWithClerk
   - Single provider for both auth and data
   - Maintains existing theming

2. **Added Convex-aware hooks** (`convex-hooks.ts`)
   - `useCurrentUser()` - Gets user from Convex database
   - `useAuthState()` - Combined Clerk + Convex state
   - `usePermission()` - Role-based access control
   - `usePresence()` - Real-time presence tracking

3. **Updated Convex backend** (`packages/backend/convex/users.ts`)
   - Added `current` and `getById` queries
   - User profile management functions
   - Clerk ID indexing for fast lookups

4. **Updated exports** (`index.ts`)
   - Re-exports Convex auth components
   - Re-exports Clerk UI components
   - Maintains backward compatibility

## How to Use

### In Your App Layout

```tsx
// app/layout.tsx
import { ConvexAuthProvider } from '@repo/auth';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ConvexAuthProvider>
          {children}
        </ConvexAuthProvider>
      </body>
    </html>
  );
}
```

### In Your Components

```tsx
// Using Convex auth state
import { useCurrentUser, Authenticated, Unauthenticated } from '@repo/auth';

function MyComponent() {
  const { user, isLoading } = useCurrentUser();
  
  return (
    <>
      <Authenticated>
        <p>Welcome, {user?.name}!</p>
      </Authenticated>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
    </>
  );
}
```

### Real-time Features

```tsx
// Real-time user presence
import { usePresence } from '@repo/auth';

function OnlineUsers() {
  const presence = usePresence();
  // Shows who's currently online
}
```

## Package Cleanup Recommendations

### 🗑️ Remove These Packages

1. **@repo/logger** - Use Convex's built-in logging
2. **@repo/storage** - Use Convex file storage
3. **@repo/testing** - Not actively used

### ✅ Keep These Packages

1. **@repo/auth** - Essential for Clerk integration
2. **@repo/design** - UI components
3. **@repo/ai** - AI utilities
4. **@repo/analytics** - Analytics tracking
5. **@repo/email** - Email templates (for now)

## Migration Benefits

### Before (Traditional Stack)
- Separate auth provider
- Separate data provider  
- Manual user sync
- Complex state management
- No real-time by default

### After (Convex+Clerk)
- Single integrated provider
- Automatic user sync
- Real-time subscriptions
- Type-safe end-to-end
- Built-in presence

## Next Steps

1. **Update app to use ConvexAuthProvider**
   ```bash
   # Replace AuthProvider with ConvexAuthProvider
   ```

2. **Remove unused packages**
   ```bash
   rm -rf packages/logger packages/storage packages/testing
   bun install
   ```

3. **Update imports**
   ```tsx
   // OLD
   import { useAuth } from '@clerk/nextjs';
   
   // NEW
   import { useCurrentUser } from '@repo/auth';
   ```

## Environment Variables

Make sure these are set:

```env
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud

# Convex Dashboard
CLERK_ISSUER_URL=https://...clerk.accounts.dev
```

## Testing Checklist

- [ ] User sign up creates Convex user
- [ ] User sign in fetches Convex data
- [ ] Real-time subscriptions work
- [ ] Profile updates persist
- [ ] Presence tracking works

## Architecture Diagram

```
┌─────────────┐     ┌─────────────┐
│   Clerk     │────▶│   Convex    │
│    Auth     │     │   Backend   │
└─────────────┘     └─────────────┘
       │                   │
       └────────┬──────────┘
                │
       ┌────────▼────────┐
       │  ConvexAuth     │
       │    Provider     │
       └────────┬────────┘
                │
       ┌────────▼────────┐
       │   Your App      │
       └─────────────────┘
```

## Support

- [Convex + Clerk Docs](https://docs.convex.dev/auth/clerk)
- [Clerk Dashboard](https://dashboard.clerk.com)
- [Convex Dashboard](https://dashboard.convex.dev)