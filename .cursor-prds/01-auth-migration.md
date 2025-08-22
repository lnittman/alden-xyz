# PRD: Authentication Migration - Supabase to Clerk

## Executive Summary
Migrate Alden messaging platform from Supabase authentication to Clerk authentication. This migration involves updating the Next.js webapp (apps/app), API service (apps/api), and shared auth package (packages/auth).

## Project Context
- **Codebase**: Alden-xyz turborepo monorepo
- **Current Auth**: Supabase (partially implemented)
- **Target Auth**: Clerk
- **Affected Services**: webapp, API, AI service
- **Tech Stack**: Next.js 15, React 19, TypeScript 5.7, Hono, Cloudflare Workers

## Implementation Requirements

### 1. Package Installation
```bash
# Root level
bun add @clerk/nextjs@latest @clerk/clerk-sdk-node@latest @clerk/types@latest

# In packages/auth
bun add @clerk/nextjs@latest @clerk/clerk-sdk-node@latest @clerk/types@latest
```

### 2. Environment Variables
Add to `.env.local` and `.env.example`:
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat
```

### 3. File Structure to Create/Modify

#### A. Create packages/auth structure
```
packages/auth/
├── src/
│   ├── index.ts           # Main exports
│   ├── clerk-provider.tsx # ClerkProvider wrapper
│   ├── middleware.ts      # Auth middleware
│   ├── hooks.ts          # Custom auth hooks
│   ├── helpers.ts        # Auth helper functions
│   └── types.ts          # Auth types
├── package.json
└── tsconfig.json
```

#### B. Webapp Authentication Files (apps/app)
```
apps/app/
├── src/
│   ├── middleware.ts      # Clerk middleware
│   ├── app/
│   │   ├── layout.tsx     # Add ClerkProvider
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   └── (protected)/
│   │       └── layout.tsx # Protected route layout
```

#### C. API Authentication (apps/api)
```
apps/api/
├── src/
│   ├── middleware/
│   │   └── auth.ts       # Clerk JWT verification
│   └── utils/
│       └── clerk.ts      # Clerk utilities
```

## Detailed Implementation Steps

### Step 1: Create packages/auth

#### packages/auth/package.json
```json
{
  "name": "@repo/auth",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@clerk/nextjs": "^6.18.4",
    "@clerk/clerk-sdk-node": "^5.0.68",
    "@clerk/types": "^4.39.2"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.7.3"
  }
}
```

#### packages/auth/src/index.ts
```typescript
export * from '@clerk/nextjs';
export * from '@clerk/nextjs/server';
export { ClerkProvider } from './clerk-provider';
export * from './hooks';
export * from './helpers';
export type * from './types';
```

#### packages/auth/src/clerk-provider.tsx
```typescript
'use client';

import { ClerkProvider as BaseClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  
  return (
    <BaseClerkProvider
      appearance={{
        baseTheme: theme === 'dark' ? dark : undefined,
        variables: {
          colorPrimary: 'hsl(var(--primary))',
          colorBackground: 'hsl(var(--background))',
          colorText: 'hsl(var(--foreground))',
        },
        elements: {
          formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
          card: 'border border-border',
        },
      }}
    >
      {children}
    </BaseClerkProvider>
  );
}
```

#### packages/auth/src/hooks.ts
```typescript
'use client';

import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/nextjs';

export function useAuth() {
  const { isLoaded, isSignedIn, userId, sessionId, signOut } = useClerkAuth();
  
  return {
    isLoaded,
    isSignedIn,
    userId,
    sessionId,
    signOut,
  };
}

export function useUser() {
  const { user, isLoaded, isSignedIn } = useClerkUser();
  
  return {
    user: user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
    } : null,
    isLoaded,
    isSignedIn,
  };
}
```

#### packages/auth/src/helpers.ts
```typescript
import { auth, currentUser } from '@clerk/nextjs/server';

export async function getAuthUser() {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }
  
  return {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress || '',
    name: user.fullName || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    imageUrl: user.imageUrl,
    createdAt: user.createdAt,
  };
}

export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  return userId;
}

export async function getUserId() {
  const { userId } = await auth();
  return userId;
}
```

### Step 2: Update Webapp (apps/app)

#### apps/app/src/middleware.ts
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/chat(.*)',
  '/api/chat(.*)',
  '/api/messages(.*)',
  '/api/boards(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

#### apps/app/src/app/layout.tsx
Update to include ClerkProvider:
```typescript
import { ClerkProvider } from '@repo/auth';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          {/* existing providers */}
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
```

#### apps/app/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx
```typescript
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

#### apps/app/src/app/(auth)/sign-up/[[...sign-up]]/page.tsx
```typescript
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
```

### Step 3: Update API Service (apps/api)

#### apps/api/src/middleware/auth.ts
```typescript
import { verifyToken } from '@clerk/clerk-sdk-node';
import type { Context, Next } from 'hono';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const token = authHeader.substring(7);
  
  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    
    c.set('userId', payload.sub);
    c.set('sessionId', payload.sid);
    
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
}
```

#### apps/api/src/index.ts
Update to use auth middleware:
```typescript
import { authMiddleware } from './middleware/auth';

// Apply to protected routes
app.use('/api/chat/*', authMiddleware);
app.use('/api/messages/*', authMiddleware);
app.use('/api/boards/*', authMiddleware);
```

### Step 4: Update Chat Components

Update all components that use Supabase auth to use Clerk:

#### Example Component Update Pattern
```typescript
// Before (Supabase)
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

// After (Clerk)
import { useAuth, useUser } from '@repo/auth';

function ChatComponent() {
  const { userId, isSignedIn } = useAuth();
  const { user } = useUser();
  
  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }
  
  // Rest of component
}
```

### Step 5: Database Schema Updates

Update the database schema to use Clerk user IDs:

#### packages/database/src/schema.ts
```typescript
// Update user references to use Clerk ID format
export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(), // Clerk user ID
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Update foreign keys in other tables
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  chatId: integer('chat_id').references(() => chats.id),
  senderId: varchar('sender_id', { length: 255 }).references(() => users.id),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

## Migration Execution Order

1. **Install packages**: Add Clerk dependencies
2. **Create auth package**: Set up shared auth utilities
3. **Update middleware**: Add Clerk middleware to webapp
4. **Create auth pages**: Sign-in and sign-up pages
5. **Update layouts**: Add ClerkProvider
6. **Update API**: Add JWT verification
7. **Update components**: Replace Supabase hooks with Clerk
8. **Update database**: Migrate user IDs to Clerk format
9. **Test all flows**: Sign up, sign in, sign out, protected routes

## Testing Requirements

1. **Auth Flow Tests**:
   - User can sign up with email
   - User can sign in with email
   - User can sign out
   - Protected routes redirect to sign-in

2. **API Tests**:
   - API rejects unauthenticated requests
   - API accepts valid Clerk JWT tokens
   - User context available in API handlers

3. **Component Tests**:
   - Auth hooks return correct state
   - Components handle loading states
   - Components handle signed-out state

## Success Criteria

- [ ] All Supabase auth code removed
- [ ] Clerk authentication working end-to-end
- [ ] Protected routes properly secured
- [ ] API authentication via JWT working
- [ ] User sessions persisted correctly
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Build successful
- [ ] No console errors in browser

## Migration Rollback Plan

If issues occur:
1. Revert git commits
2. Restore database backup
3. Revert environment variables
4. Clear browser cache/cookies
5. Test with original Supabase auth

## Notes for Cursor Agent

- Follow existing code patterns in the codebase
- Use workspace:* for internal package dependencies
- Maintain consistent naming conventions
- Add proper TypeScript types
- Include error handling
- Keep components modular and reusable
- Test each step before proceeding
- Commit changes incrementally

## Reference Documentation

- Clerk Next.js: https://clerk.com/docs/quickstarts/nextjs
- Clerk JWT Verification: https://clerk.com/docs/backend-requests/handling/manual-jwt
- Clerk Middleware: https://clerk.com/docs/references/nextjs/clerk-middleware