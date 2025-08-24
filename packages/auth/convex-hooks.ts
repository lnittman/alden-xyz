/**
 * Convex-aware authentication hooks
 * These hooks integrate Clerk authentication with Convex data fetching
 */

import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend";
import { useUser as useClerkUser } from "@clerk/nextjs";

/**
 * Get the current user from Convex database
 * This syncs with Clerk but provides additional app-specific data
 */
export function useCurrentUser() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  
  // Skip query if not authenticated
  const user = useQuery(
    api.users.current,
    isAuthenticated ? {} : "skip"
  );
  
  return {
    user,
    isLoading,
    isAuthenticated,
  };
}

/**
 * Check if user has a specific permission
 * Useful for role-based access control
 */
export function usePermission(permission: string) {
  const { user } = useCurrentUser();
  
  // Add your permission logic here
  // For now, just check if user exists
  return !!user;
}

/**
 * Get user by ID from Convex
 */
export function useUserById(userId: string | undefined) {
  return useQuery(
    api.users.getById,
    userId ? { userId } : "skip"
  );
}

/**
 * Update current user's profile
 */
export function useUpdateProfile() {
  return useMutation(api.users.updateProfile);
}

/**
 * Combined hook that provides both Clerk and Convex user data
 */
export function useAuthState() {
  const clerkUser = useClerkUser();
  const { user: convexUser, isLoading } = useCurrentUser();
  const { isAuthenticated } = useConvexAuth();
  
  return {
    // Clerk data (immediate, client-side)
    clerkUser: clerkUser.user,
    clerkLoaded: clerkUser.isLoaded,
    clerkSignedIn: clerkUser.isSignedIn,
    
    // Convex data (from database)
    convexUser,
    
    // Combined state
    isAuthenticated,
    isLoading: isLoading || !clerkUser.isLoaded,
    
    // Computed properties
    displayName: convexUser?.name || clerkUser.user?.fullName || 'Anonymous',
    email: convexUser?.email || clerkUser.user?.primaryEmailAddress?.emailAddress,
    imageUrl: convexUser?.imageUrl || clerkUser.user?.imageUrl,
  };
}

/**
 * Hook for real-time presence
 * Shows who's currently online
 */
export function usePresence() {
  const { user } = useCurrentUser();
  const updatePresence = useMutation(api.presence.update);
  
  // Update presence on mount and periodically
  // This could be enhanced with actual implementation
  
  return {
    updatePresence,
    userId: user?._id,
  };
}