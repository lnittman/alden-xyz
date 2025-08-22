'use client';

import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { RealtimeClient } from './client';

interface RealtimeContextValue {
  client: RealtimeClient | null;
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  client: null,
  isConnected: false,
});

export function useRealtimeContext() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtimeContext must be used within RealtimeProvider');
  }
  return context;
}

interface RealtimeProviderProps {
  children: ReactNode;
  roomId: string;
  userId: string;
  pusherKey: string;
  pusherCluster: string;
  authEndpoint: string;
}

export function RealtimeProvider({
  children,
  roomId,
  userId,
  pusherKey,
  pusherCluster,
  authEndpoint,
}: RealtimeProviderProps) {
  const [client] = useState(
    () =>
      new RealtimeClient({
        key: pusherKey,
        cluster: pusherCluster,
        authEndpoint,
      })
  );
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    client
      .connect(roomId, userId)
      .then(() => setIsConnected(true))
      .catch((_error) => {
        setIsConnected(false);
      });

    return () => {
      client.disconnect();
      setIsConnected(false);
    };
  }, [client, roomId, userId]);

  const Provider = RealtimeContext.Provider as any;

  return <Provider value={{ client, isConnected }}>{children}</Provider>;
}
