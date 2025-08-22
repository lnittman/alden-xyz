import type React from 'react';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { PresenceClient } from './client';
import type { Presence, PresenceConfig, User } from './types';

interface PresenceContextValue {
  client: PresenceClient | null;
  presences: Presence[];
  others: Presence[];
  isConnected: boolean;
  connect: (roomId: string, user: User) => Promise<void>;
  disconnect: () => Promise<void>;
  updatePresence: (
    data: Partial<Omit<Presence, 'user' | 'roomId' | 'lastSeen'>>
  ) => void;
}

const PresenceContext = createContext<PresenceContextValue | null>(null);

export interface PresenceProviderProps {
  children: React.ReactNode;
  config?: PresenceConfig;
}

export function PresenceProvider({ children, config }: PresenceProviderProps) {
  const clientRef = useRef<PresenceClient | null>(null);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize client
  useEffect(() => {
    if (!clientRef.current) {
      clientRef.current = new PresenceClient(config);

      // Set up event listeners
      clientRef.current.on('connection:open', () => {
        setIsConnected(true);
      });

      clientRef.current.on('connection:close', () => {
        setIsConnected(false);
        setPresences([]);
      });

      clientRef.current.on('presence:join', () => {
        setPresences(clientRef.current?.getPresences() || []);
      });

      clientRef.current.on('presence:leave', () => {
        setPresences(clientRef.current?.getPresences() || []);
      });

      clientRef.current.on('presence:update', () => {
        setPresences(clientRef.current?.getPresences() || []);
      });
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current.removeAllListeners();
        clientRef.current = null;
      }
    };
  }, [config]);

  const connect = async (roomId: string, user: User) => {
    if (clientRef.current) {
      await clientRef.current.connect(roomId, user);
    }
  };

  const disconnect = async () => {
    if (clientRef.current) {
      await clientRef.current.disconnect();
    }
  };

  const updatePresence = (
    data: Partial<Omit<Presence, 'user' | 'roomId' | 'lastSeen'>>
  ) => {
    if (clientRef.current) {
      clientRef.current.updatePresence(data);
    }
  };

  const others = presences.filter((p) => {
    const client = clientRef.current;
    if (!client) {
      return true;
    }
    const currentUser = client.getCurrentUser();
    return currentUser ? p.user.id !== currentUser.id : true;
  });

  const value: PresenceContextValue = {
    client: clientRef.current,
    presences,
    others,
    isConnected,
    connect,
    disconnect,
    updatePresence,
  };

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error('usePresence must be used within a PresenceProvider');
  }
  return context;
}
