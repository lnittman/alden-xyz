'use client';

import React, { type ReactNode } from 'react';
import { PresenceProvider } from './src/presence/provider';
import { usePresence } from './src/presence/provider';
import { RealtimeProvider } from './src/realtime/provider';

type RoomProps = {
  id: string;
  userId: string;
  userInfo: {
    name?: string;
    email?: string;
    avatar?: string;
    color?: string;
    [key: string]: any;
  };
  children: ReactNode;
  authEndpoint: string;
  fallback: ReactNode;
  pusherKey: string;
  pusherCluster: string;
};

export const Room = ({
  id,
  userId,
  userInfo,
  children,
  authEndpoint,
  fallback,
  pusherKey,
  pusherCluster,
}: RoomProps) => {
  // For presence, we'll use WebSocket (keeping existing implementation)
  // For realtime events, we'll use Pusher
  return (
    <PresenceProvider>
      <RealtimeProvider
        roomId={id}
        userId={userId}
        pusherKey={pusherKey}
        pusherCluster={pusherCluster}
        authEndpoint={authEndpoint}
      >
        <RoomContent roomId={id} userId={userId} userInfo={userInfo}>
          {children}
        </RoomContent>
      </RealtimeProvider>
    </PresenceProvider>
  );
};

// Inner component that uses the presence hooks
function RoomContent({
  roomId,
  userId,
  userInfo,
  children,
}: {
  roomId: string;
  userId: string;
  userInfo: RoomProps['userInfo'];
  children: ReactNode;
}) {
  const { connect, disconnect } = usePresence();

  React.useEffect(() => {
    connect(roomId, {
      id: userId,
      name: userInfo.name,
      avatar: userInfo.avatar,
      color: userInfo.color,
    });

    return () => {
      disconnect();
    };
  }, [roomId, userId]);

  return <>{children}</>;
}
