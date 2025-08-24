import { useQuery, useMutation } from "convex/react";
import { api } from "@repo/backend";
import { useEffect, useCallback } from "react";

export function usePresence(location: string, locationId: string) {
  const presence = useQuery(
    api.presence.subscribe,
    { location, locationId }
  );
  
  const updatePresence = useMutation(api.presence.update);
  const removePresence = useMutation(api.presence.remove);
  const heartbeat = useMutation(api.presence.heartbeat);

  // Update presence on mount and cleanup on unmount
  useEffect(() => {
    updatePresence({ location, locationId });

    // Send heartbeat every 20 seconds
    const interval = setInterval(() => {
      heartbeat();
    }, 20000);

    return () => {
      clearInterval(interval);
      removePresence();
    };
  }, [location, locationId]);

  const updateCursor = useCallback(
    (cursor: { x: number; y: number }) => {
      updatePresence({ location, locationId, cursor });
    },
    [location, locationId, updatePresence]
  );

  return {
    presence: presence || [],
    updateCursor,
    activeUsers: presence?.length || 0,
  };
}

export function useActiveUsersCount() {
  const count = useQuery(api.presence.getActiveUsersCount);

  return {
    count: count || 0,
    isLoading: count === undefined,
  };
}