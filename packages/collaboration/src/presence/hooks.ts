import { useCallback, useEffect, useState } from 'react';
import { usePresence } from './provider';
import type { Presence, User } from './types';

/**
 * Hook to manage room presence
 */
export function useRoomPresence(roomId: string, user: User) {
  const { connect, disconnect, isConnected } = usePresence();

  useEffect(() => {
    if (roomId && user) {
      connect(roomId, user);
    }

    return () => {
      disconnect();
    };
  }, [roomId, user.id]); // Only reconnect if room or user ID changes

  return { isConnected };
}

/**
 * Hook to get other users in the room
 */
export function useOthers() {
  const { others } = usePresence();
  return others;
}

/**
 * Hook to track cursor position
 */
export function useCursor() {
  const { updatePresence } = usePresence();
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const updateCursor = useCallback(
    (x: number, y: number) => {
      setCursor({ x, y });
      updatePresence({ cursor: { x, y } });
    },
    [updatePresence]
  );

  const clearCursor = useCallback(() => {
    setCursor(null);
    updatePresence({ cursor: undefined });
  }, [updatePresence]);

  return { cursor, updateCursor, clearCursor };
}

/**
 * Hook to track selection
 */
export function useSelection() {
  const { updatePresence } = usePresence();
  const [selection, setSelection] = useState<string | null>(null);

  const updateSelection = useCallback(
    (newSelection: string | null) => {
      setSelection(newSelection);
      updatePresence({ selection: newSelection || undefined });
    },
    [updatePresence]
  );

  return { selection, updateSelection };
}

/**
 * Hook to get presence of a specific user
 */
export function useUserPresence(userId: string): Presence | null {
  const { presences } = usePresence();
  return presences.find((p) => p.user.id === userId) || null;
}

/**
 * Hook for simple online/offline status
 */
export function useOnlineUsers() {
  const { presences } = usePresence();
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);

  useEffect(() => {
    const users = presences.map((p) => p.user);
    setOnlineUsers(users);
  }, [presences]);

  return onlineUsers;
}

/**
 * Hook to track presence count
 */
export function usePresenceCount() {
  const { presences } = usePresence();
  return presences.length;
}
