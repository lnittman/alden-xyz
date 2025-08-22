export interface User {
  id: string;
  name?: string;
  avatar?: string;
  color?: string;
}

export interface Presence {
  user: User;
  cursor?: { x: number; y: number };
  selection?: string;
  lastSeen: number;
  roomId: string;
}

export interface PresenceState {
  [userId: string]: Presence;
}

export interface PresenceConfig {
  wsUrl?: string;
  heartbeatInterval?: number; // ms
  cleanupInterval?: number; // ms
  presenceTimeout?: number; // ms
}

export interface PresenceEvents {
  'presence:join': (presence: Presence) => void;
  'presence:leave': (userId: string) => void;
  'presence:update': (presence: Presence) => void;
  'connection:open': () => void;
  'connection:close': () => void;
  'connection:error': (error: Error) => void;
}
