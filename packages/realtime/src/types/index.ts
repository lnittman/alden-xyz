/**
 * Realtime Types
 */

export interface RealtimeMessage {
  id: string;
  channel: string;
  event: string;
  data: any;
  userId?: string;
  timestamp: string;
}

export interface RealtimeUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'offline';
  metadata?: Record<string, any>;
}

export interface RealtimeChannel {
  id: string;
  name: string;
  users: Map<string, RealtimeUser>;
  metadata?: Record<string, any>;
}

export interface RealtimePresence {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
  metadata?: Record<string, any>;
}

export interface RealtimeProvider {
  // Connection management
  connect(userId: string, metadata?: Record<string, any>): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Channel management
  subscribe(channel: string): Promise<void>;
  unsubscribe(channel: string): Promise<void>;
  
  // Messaging
  send(channel: string, event: string, data: any): Promise<void>;
  broadcast(channel: string, event: string, data: any, excludeUserId?: string): Promise<void>;
  
  // Presence
  updatePresence(channel: string, status: 'online' | 'away' | 'offline'): Promise<void>;
  getPresence(channel: string): Promise<RealtimePresence[]>;
  
  // Event handlers
  onMessage(handler: (message: RealtimeMessage) => void): void;
  onPresence(handler: (presence: RealtimePresence) => void): void;
  onConnect(handler: () => void): void;
  onDisconnect(handler: () => void): void;
  onError(handler: (error: Error) => void): void;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  type: 'message' | 'system' | 'typing' | 'presence';
  metadata?: Record<string, any>;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  replyTo?: string; // ID of message being replied to
  reactions?: Record<string, string[]>; // emoji -> userIds
  edited?: boolean;
  editedAt?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: 'direct' | 'group' | 'channel';
  users: RealtimeUser[];
  admins?: string[];
  created: string;
  lastActivity: string;
  metadata?: Record<string, any>;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: string;
}

// WebSocket specific types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
}

export interface WebSocketConnection {
  id: string;
  userId: string;
  ws: WebSocket;
  metadata?: Record<string, any>;
}