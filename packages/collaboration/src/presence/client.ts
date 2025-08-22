import { EventEmitter } from 'node:events';
import type {
  Presence,
  PresenceConfig,
  PresenceEvents,
  PresenceState,
  User,
} from './types';

export class PresenceClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: Required<PresenceConfig>;
  private presenceState: PresenceState = {};
  private currentUser: User | null = null;
  private currentRoomId: string | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: PresenceConfig = {}) {
    super();
    this.config = {
      wsUrl: config.wsUrl || '/api/presence',
      heartbeatInterval: config.heartbeatInterval || 30000, // 30s
      cleanupInterval: config.cleanupInterval || 60000, // 60s
      presenceTimeout: config.presenceTimeout || 120000, // 2min
    };
  }

  /**
   * Connect to a room with user info
   */
  async connect(roomId: string, user: User): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      await this.disconnect();
    }

    this.currentUser = user;
    this.currentRoomId = roomId;
    this.reconnectAttempts = 0;

    return this.establishConnection();
  }

  /**
   * Disconnect from current room
   */
  async disconnect(): Promise<void> {
    this.stopHeartbeat();
    this.stopCleanup();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.presenceState = {};
    this.currentRoomId = null;
    this.emit('connection:close');
  }

  /**
   * Update current user's presence
   */
  updatePresence(
    data: Partial<Omit<Presence, 'user' | 'roomId' | 'lastSeen'>>
  ): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const message = {
      type: 'presence:update',
      data,
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Get all active presences
   */
  getPresences(): Presence[] {
    return Object.values(this.presenceState);
  }

  /**
   * Get presence for specific user
   */
  getPresence(userId: string): Presence | null {
    return this.presenceState[userId] || null;
  }

  /**
   * Get other users (excluding current user)
   */
  getOthers(): Presence[] {
    return this.getPresences().filter(
      (p) => p.user.id !== this.currentUser?.id
    );
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  private async establishConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = new URL(this.config.wsUrl, window.location.origin);
        url.searchParams.set('roomId', this.currentRoomId!);
        if (this.currentUser?.id) {
          url.searchParams.set('userId', this.currentUser.id);
        }

        // Convert to WebSocket URL
        url.protocol = url.protocol.replace('http', 'ws');

        this.ws = new WebSocket(url.toString());

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.sendJoin();
          this.startHeartbeat();
          this.startCleanup();
          this.emit('connection:open');
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (_error) => {
          const err = new Error('WebSocket error');
          this.emit('connection:error', err);
          reject(err);
        };

        this.ws.onclose = () => {
          this.stopHeartbeat();
          this.stopCleanup();
          this.emit('connection:close');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private sendJoin(): void {
    if (!this.ws || !this.currentUser || !this.currentRoomId) {
      return;
    }

    const message = {
      type: 'presence:join',
      data: {
        user: this.currentUser,
        roomId: this.currentRoomId,
      },
    };

    this.ws.send(JSON.stringify(message));
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private startCleanup(): void {
    this.stopCleanup();

    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      const timeout = this.config.presenceTimeout;

      Object.entries(this.presenceState).forEach(([userId, presence]) => {
        if (now - presence.lastSeen > timeout) {
          delete this.presenceState[userId];
          this.emit('presence:leave', userId);
        }
      });
    }, this.config.cleanupInterval);
  }

  private stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'presence:sync':
          // Full sync of all presences
          this.presenceState = message.data || {};
          break;

        case 'presence:join': {
          const joinPresence: Presence = {
            ...message.data,
            lastSeen: Date.now(),
          };
          this.presenceState[joinPresence.user.id] = joinPresence;
          this.emit('presence:join', joinPresence);
          break;
        }

        case 'presence:leave': {
          const userId = message.data.userId;
          delete this.presenceState[userId];
          this.emit('presence:leave', userId);
          break;
        }

        case 'presence:update': {
          const updatePresence = this.presenceState[message.data.userId];
          if (updatePresence) {
            Object.assign(updatePresence, message.data.data, {
              lastSeen: Date.now(),
            });
            this.emit('presence:update', updatePresence);
          }
          break;
        }
      }
    } catch (_error) {}
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      if (this.currentRoomId && this.currentUser) {
        this.connect(this.currentRoomId, this.currentUser).catch(console.error);
      }
    }, delay);
  }

  // Type-safe event emitter methods
  on<K extends keyof PresenceEvents>(
    event: K,
    listener: PresenceEvents[K]
  ): this {
    return super.on(event, listener);
  }

  off<K extends keyof PresenceEvents>(
    event: K,
    listener: PresenceEvents[K]
  ): this {
    return super.off(event, listener);
  }

  emit<K extends keyof PresenceEvents>(
    event: K,
    ...args: Parameters<PresenceEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }
}
