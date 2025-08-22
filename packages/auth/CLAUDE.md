# @repo/auth Package Context

## Development Standards

### Package Context
This package provides authentication utilities and Clerk integration for the Squish ecosystem. It handles user authentication, session management, role-based access control, and authentication flows across all applications.

### Technology Stack
- **Clerk**: 6.18.4 - Authentication provider
- **React**: 19+ compatibility
- **TypeScript**: 5.7+ strict configuration
- **JWT**: JSON Web Token handling

### Key Dependencies
```json
{
  "dependencies": {
    "@clerk/backend": "^1.20.1",
    "@clerk/nextjs": "^6.18.4",
    "@clerk/react": "^5.9.0",
    "jose": "^5.9.6",
    "react": "^19.1.0"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*"
  }
}
```

## Package Structure

### Directory Layout
```
src/
├── index.ts              # Main package exports
├── client/               # Client-side authentication
│   ├── clerk-client.ts   # Clerk client configuration
│   ├── hooks.ts          # React authentication hooks
│   ├── context.ts        # Authentication context
│   └── index.ts          # Client exports
├── server/               # Server-side authentication
│   ├── middleware.ts     # Authentication middleware
│   ├── jwt.ts           # JWT handling utilities
│   ├── session.ts       # Session management
│   └── index.ts         # Server exports
├── types/                # TypeScript type definitions
│   ├── auth.ts          # Authentication types
│   ├── clerk.ts         # Clerk-specific types
│   ├── user.ts          # User and role types
│   └── index.ts         # Type exports
├── utils/                # Utility functions
│   ├── permissions.ts   # Permission checking
│   ├── roles.ts         # Role utilities
│   ├── tokens.ts        # Token utilities
│   └── index.ts         # Utility exports
└── config/               # Configuration constants
    ├── constants.ts     # Auth constants
    ├── defaults.ts      # Default configurations
    └── index.ts         # Config exports
```

## Client-Side Authentication

### Clerk Client Configuration
```typescript
// src/client/clerk-client.ts
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export function createClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#3b82f6',
        },
        elements: {
          card: {
            boxShadow: 'none',
          },
        },
      }}
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/onboarding"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      {children}
    </ClerkProvider>
  );
}
```

### Authentication Hooks
```typescript
// src/client/hooks.ts
export function useAuth() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { userId } = useAuth();
  
  return {
    isLoaded,
    isSignedIn,
    user: user ? {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.imageUrl,
      createdAt: user.createdAt,
    } : null,
    userId,
  };
}

export function useRequireAuth() {
  const { isLoaded, isSignedIn, user } = useAuth();
  
  if (!isLoaded) {
    return { isLoading: true, user: null };
  }
  
  if (!isSignedIn) {
    redirectToSignIn();
    return { isLoading: false, user: null };
  }
  
  return { isLoading: false, user };
}

export function usePermission(permission: string) {
  const { user } = useAuth();
  
  const hasPermission = user?.roles?.some(role => 
    role.permissions.includes(permission)
  ) ?? false;
  
  return hasPermission;
}
```

## Server-Side Authentication

### Authentication Middleware
```typescript
// src/server/middleware.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export function authMiddleware(handler: (req: Request, auth: { userId: string }) => Promise<Response>) {
  return async (req: Request) => {
    try {
      const { userId } = auth();
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      return handler(req, { userId });
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
```

### JWT Handling
```typescript
// src/server/jwt.ts
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.CLERK_JWT_KEY!);

export async function signJWT(payload: any, expiresIn = '1h') {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

## Role-Based Access Control

### Permission System
```typescript
// src/utils/permissions.ts
export const Permissions = {
  // Board permissions
  BOARD_CREATE: 'board:create',
  BOARD_READ: 'board:read',
  BOARD_UPDATE: 'board:update',
  BOARD_DELETE: 'board:delete',
  
  // Asset permissions
  ASSET_UPLOAD: 'asset:upload',
  ASSET_READ: 'asset:read',
  ASSET_UPDATE: 'asset:update',
  ASSET_DELETE: 'asset:delete',
  
  // User permissions
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Admin permissions
  ADMIN_DASHBOARD: 'admin:dashboard',
  ADMIN_USERS: 'admin:users',
  ADMIN_SETTINGS: 'admin:settings',
} as const;

type Permission = typeof Permissions[keyof typeof Permissions];

export function hasPermission(
  userRoles: Role[] | undefined,
  requiredPermission: Permission
): boolean {
  if (!userRoles) return false;
  
  return userRoles.some(role => 
    role.permissions.includes(requiredPermission)
  );
}
```

### Role Definitions
```typescript
// src/utils/roles.ts
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isDefault?: boolean;
}

export const Roles: Record<string, Role> = {
  ADMIN: {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access',
    permissions: Object.values(Permissions),
  },
  
  MEMBER: {
    id: 'member',
    name: 'Member',
    description: 'Standard workspace member',
    permissions: [
      Permissions.BOARD_READ,
      Permissions.ASSET_READ,
      Permissions.ASSET_UPLOAD,
    ],
    isDefault: true,
  },
  
  GUEST: {
    id: 'guest',
    name: 'Guest',
    description: 'Limited access',
    permissions: [
      Permissions.BOARD_READ,
      Permissions.ASSET_READ,
    ],
  },
};
```

## Integration Patterns

### Protected Component
```typescript
// Example protected component
import { useRequireAuth, usePermission } from '@repo/auth';

function AdminDashboard() {
  const { user, isLoading } = useRequireAuth();
  const hasAdminAccess = usePermission('admin:dashboard');
  
  if (isLoading) return <Spinner />;
  if (!user || !hasAdminAccess) return <Navigate to="/dashboard" />;
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin content */}
    </div>
  );
}
```

### Protected API Route
```typescript
// Example protected API route
import { authMiddleware } from '@repo/auth/server';

export const GET = authMiddleware(async (req, { userId }) => {
  const boards = await getBoardsForUser(userId);
  
  return NextResponse.json({ success: true, data: boards });
});
```

## Common Tasks

### Adding a New Permission
1. Add permission to Permissions enum
2. Update roles that should have this permission
3. Update documentation
4. Update tests

### Creating a New Role
1. Define role in Roles object
2. Assign appropriate permissions
3. Add database migration if storing roles
4. Update user management UI

### Adding Auth to a New Route
1. Add authMiddleware wrapper
2. Extract userId from auth context
3. Implement route logic
4. Add appropriate error handling

## Files to Know
- `src/client/clerk-client.ts` - Clerk provider setup
- `src/client/hooks.ts` - Authentication hooks
- `src/server/middleware.ts` - Authentication middleware
- `src/utils/permissions.ts` - Permission definitions
- `src/utils/roles.ts` - Role definitions

## Quality Checklist

Before committing changes to this package:
- [ ] All authentication flows tested
- [ ] Permission checking logic correct
- [ ] TypeScript types complete and accurate
- [ ] Error handling comprehensive
- [ ] JWT tokens properly secured
- [ ] Role-based access control working
- [ ] Authentication state properly managed
- [ ] No auth credentials in logs
- [ ] Sessions properly invalidated on sign out
- [ ] Documentation updated

---

*This context ensures Claude Code understands the auth package structure and patterns when working on authentication features.*