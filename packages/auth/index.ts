// Legacy provider (Clerk only)
export { AuthProvider } from './provider';

// New Convex+Clerk integrated provider
export { ConvexAuthProvider } from './convex-provider';

// Convex-aware hooks
export {
  useCurrentUser,
  usePermission,
  useUserById,
  useUpdateProfile,
  useAuthState,
  usePresence,
} from './convex-hooks';

// Re-export Convex auth components for convenience
export { 
  Authenticated, 
  Unauthenticated, 
  AuthLoading,
  useConvexAuth,
} from 'convex/react';

// Re-export Clerk components
export {
  SignInButton,
  SignUpButton,
  SignOutButton,
  UserButton,
} from '@clerk/nextjs';

export type { AuthUser } from './types';
