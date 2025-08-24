# Package Cleanup Analysis for Convex Migration

## Current Package Status

### ✅ Keep These Packages

#### 1. **@repo/auth** - KEEP & UPDATE
- **Why Keep**: Still needed for Clerk client-side utilities and components
- **Current Role**: Wraps Clerk for authentication
- **Updates Needed**: Simplify for Convex+Clerk integration (see below)

#### 2. **@repo/design** - KEEP
- **Why Keep**: UI components and design system
- **Current Role**: Shared React components
- **No Changes**: Works independently of backend

#### 3. **@repo/ai** - KEEP  
- **Why Keep**: AI utilities and hooks
- **Current Role**: Client-side AI integration
- **No Changes**: Works with Convex backend

#### 4. **@repo/analytics** - KEEP
- **Why Keep**: PostHog and Vercel analytics
- **Current Role**: Analytics tracking
- **No Changes**: Works independently

#### 5. **@repo/typescript-config** - KEEP
- **Why Keep**: Shared TypeScript configurations
- **No Changes**: Build tooling

### ⚠️ Evaluate These Packages

#### 1. **@repo/logger** - POSSIBLY REMOVE
- **Current Usage**: Only used in `packages/auth/webhooks/clerk.ts`
- **Convex Alternative**: Convex has built-in logging via `console.log` in functions
- **Recommendation**: Remove and use Convex's logging

#### 2. **@repo/storage** - POSSIBLY REMOVE  
- **Current Usage**: Not actively used (only in its own files)
- **Convex Alternative**: Convex has built-in file storage
- **Recommendation**: Remove and use Convex file storage
- **Migration**: Use `ctx.storage.store()` and `ctx.storage.get()`

#### 3. **@repo/email** - KEEP (for now)
- **Current Usage**: Email templates
- **Note**: Still useful for React Email templates
- **Future**: Could integrate with Convex HTTP actions

#### 4. **@repo/notifications** - POSSIBLY REMOVE
- **Current Usage**: Unknown
- **Convex Alternative**: Real-time subscriptions handle notifications
- **Recommendation**: Remove if not actively used

#### 5. **@repo/testing** - POSSIBLY REMOVE
- **Current Usage**: Unknown
- **Note**: Convex has its own testing patterns
- **Recommendation**: Remove if not actively used

## Auth Package Updates for Convex+Clerk

### Current Auth Package Structure
```
packages/auth/
├── client.ts        # Client-side hooks
├── server.ts        # Server-side utilities
├── middleware.ts    # Next.js middleware
├── provider.tsx     # Clerk provider wrapper
└── webhooks/        # Clerk webhooks
```

### Recommended Updates for Convex+Clerk

#### 1. **Simplify Provider (provider.tsx)**
```tsx
// NEW: Simplified for Convex+Clerk
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

#### 2. **Update Client Hooks (client.ts)**
```tsx
// Keep existing Clerk hooks but add Convex-aware ones
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@repo/backend";

export function useCurrentUser() {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(
    api.users.current,
    isAuthenticated ? {} : "skip"
  );
  return user;
}
```

#### 3. **Remove Server-Side Auth (server.ts)**
- **Why**: Convex handles server-side auth via `ctx.auth`
- **Replace With**: Direct Convex function calls

#### 4. **Update Webhooks (webhooks/clerk.ts)**
```tsx
// Convert to Convex HTTP action
import { httpAction } from "@repo/backend";
import { internal } from "@repo/backend";

export const clerkWebhook = httpAction(async (ctx, request) => {
  // Validate webhook
  const event = await validateClerkWebhook(request);
  
  // Handle events via Convex mutations
  switch (event.type) {
    case "user.created":
    case "user.updated":
      await ctx.runMutation(internal.users.upsertFromClerk, {
        data: event.data,
      });
      break;
  }
  
  return new Response(null, { status: 200 });
});
```

## Migration Steps

### Phase 1: Remove Unused Packages
```bash
# Remove clearly unused packages
rm -rf packages/logger packages/storage packages/testing packages/notifications

# Update package.json files to remove references
bun install
```

### Phase 2: Update Auth Package
1. Simplify provider to use ConvexProviderWithClerk
2. Add Convex-aware hooks
3. Convert webhooks to Convex HTTP actions
4. Remove server-side utilities (replaced by Convex)

### Phase 3: Update Imports
```bash
# Find and update any remaining imports
grep -r "@repo/logger" --include="*.ts" --include="*.tsx"
grep -r "@repo/storage" --include="*.ts" --include="*.tsx"
```

## Benefits of This Cleanup

1. **Simpler Architecture**: Remove 4-5 packages
2. **Native Integration**: Use Convex's built-in features
3. **Better DX**: Less code to maintain
4. **Type Safety**: Convex provides end-to-end types
5. **Real-time by Default**: No need for separate notification system

## File Storage Migration

If you were using @repo/storage, migrate to Convex:

```typescript
// OLD: Using @repo/storage
import { uploadFile } from "@repo/storage";
await uploadFile(file, "s3");

// NEW: Using Convex
const storageId = await ctx.storage.store(file);
const url = await ctx.storage.getUrl(storageId);
```

## Logging Migration

```typescript
// OLD: Using @repo/logger
import { apiLogger } from "@repo/logger";
apiLogger.info("User created", { userId });

// NEW: Using Convex
console.log("User created", { userId });
// Logs appear in Convex dashboard
```

## Next Steps

1. **Immediate**: Remove unused packages (logger, storage, testing)
2. **Next**: Update auth package for Convex+Clerk
3. **Later**: Consider removing email/notifications if not needed
4. **Future**: All packages should integrate with Convex where possible