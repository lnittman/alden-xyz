/**
 * Durable Objects Realtime Provider
 * Implements realtime functionality using Cloudflare Durable Objects
 */

import type { 
  RealtimeProvider, 
  RealtimeMessage, 
  RealtimePresence,
  ChatMessage,
  ChatRoom as ChatRoomType,
  RealtimeUser 
} from '../types';

/**
 * ChatRoom Durable Object
 * Manages WebSocket connections and state for a single chat room
 */
export class ChatRoom implements DurableObject {
  private state: DurableObjectState;
  private env: any;
  private sessions: Map<WebSocket, { userId: string; user: RealtimeUser }>;
  private room: ChatRoomType & { messageHistory: ChatMessage[] };

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
    
    // Initialize room state
    this.room = {
      id: state.id.toString(),
      name: '',
      type: 'group',
      users: [],
      messageHistory: [],
      created: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };

    // Restore state from storage
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<any>('room');
      if (stored) {
        this.room = stored;
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }

    // Handle HTTP endpoints
    switch (url.pathname) {
      case '/messages':
        return this.getMessages();
      case '/users':
        return this.getUsers();
      case '/broadcast':
        return this.handleBroadcast(request);
      case '/presence':
        return this.getPresence();
      default:
        return new Response('Not found', { status: 404 });
    }
  }

  private async handleWebSocket(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const userName = url.searchParams.get('userName') || 'Anonymous';

    if (!userId) {
      return new Response('Missing userId', { status: 400 });
    }

    // Create WebSocket pair
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept the WebSocket connection
    this.state.acceptWebSocket(server);

    // Store session info
    const user: RealtimeUser = {
      id: userId,
      name: userName,
      status: 'online',
    };

    this.sessions.set(server, { userId, user });
    
    // Add user to room
    const existingUserIndex = this.room.users.findIndex(u => u.id === userId);
    if (existingUserIndex >= 0) {
      this.room.users[existingUserIndex] = user;
    } else {
      this.room.users.push(user);
    }

    // Notify others of new user
    this.broadcast({
      type: 'presence',
      userId,
      userName,
      content: 'joined',
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID(),
    }, server);

    // Send initial state to new user
    server.send(JSON.stringify({
      type: 'init',
      room: {
        ...this.room,
        messageHistory: this.room.messageHistory.slice(-50), // Last 50 messages
      },
    }));

    await this.saveState();

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    try {
      const session = this.sessions.get(ws);
      if (!session) return;

      const data = JSON.parse(message as string);
      
      switch (data.type) {
        case 'message':
          await this.handleMessage(ws, session, data);
          break;
        case 'typing':
          await this.handleTyping(ws, session, data);
          break;
        case 'presence':
          await this.handlePresence(ws, session, data);
          break;
        case 'reaction':
          await this.handleReaction(ws, session, data);
          break;
        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    const session = this.sessions.get(ws);
    if (session) {
      // Update user status
      const userIndex = this.room.users.findIndex(u => u.id === session.userId);
      if (userIndex >= 0) {
        this.room.users[userIndex].status = 'offline';
      }

      // Notify others
      this.broadcast({
        type: 'presence',
        userId: session.userId,
        userName: session.user.name,
        content: 'left',
        timestamp: new Date().toISOString(),
        id: crypto.randomUUID(),
      }, ws);

      // Clean up
      this.sessions.delete(ws);
      
      // Remove user if no other sessions
      const hasOtherSessions = Array.from(this.sessions.values())
        .some(s => s.userId === session.userId);
      
      if (!hasOtherSessions) {
        this.room.users = this.room.users.filter(u => u.id !== session.userId);
      }

      await this.saveState();
    }
  }

  private async handleMessage(ws: WebSocket, session: any, data: any) {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      userId: session.userId,
      userName: session.user.name,
      content: data.content,
      timestamp: new Date().toISOString(),
      type: 'message',
      metadata: data.metadata,
      attachments: data.attachments,
      replyTo: data.replyTo,
    };

    // Store message
    this.room.messageHistory.push(message);
    
    // Keep only last 1000 messages
    if (this.room.messageHistory.length > 1000) {
      this.room.messageHistory = this.room.messageHistory.slice(-1000);
    }

    // Update room activity
    this.room.lastActivity = message.timestamp;

    // Broadcast to all clients
    this.broadcast(message);

    // Save state periodically
    if (this.room.messageHistory.length % 10 === 0) {
      await this.saveState();
    }
  }

  private async handleTyping(ws: WebSocket, session: any, data: any) {
    this.broadcast({
      type: 'typing',
      userId: session.userId,
      userName: session.user.name,
      isTyping: data.isTyping,
      timestamp: new Date().toISOString(),
    }, ws);
  }

  private async handlePresence(ws: WebSocket, session: any, data: any) {
    const userIndex = this.room.users.findIndex(u => u.id === session.userId);
    if (userIndex >= 0) {
      this.room.users[userIndex].status = data.status || 'online';
      
      this.broadcast({
        type: 'presence',
        userId: session.userId,
        userName: session.user.name,
        status: data.status,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private async handleReaction(ws: WebSocket, session: any, data: any) {
    const messageIndex = this.room.messageHistory.findIndex(m => m.id === data.messageId);
    if (messageIndex >= 0) {
      const message = this.room.messageHistory[messageIndex];
      
      if (!message.reactions) {
        message.reactions = {};
      }
      
      if (!message.reactions[data.emoji]) {
        message.reactions[data.emoji] = [];
      }
      
      const userIndex = message.reactions[data.emoji].indexOf(session.userId);
      
      if (data.add && userIndex === -1) {
        message.reactions[data.emoji].push(session.userId);
      } else if (!data.add && userIndex >= 0) {
        message.reactions[data.emoji].splice(userIndex, 1);
        
        if (message.reactions[data.emoji].length === 0) {
          delete message.reactions[data.emoji];
        }
      }
      
      this.broadcast({
        type: 'reaction',
        messageId: data.messageId,
        userId: session.userId,
        emoji: data.emoji,
        add: data.add,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private broadcast(message: any, exclude?: WebSocket) {
    const data = JSON.stringify(message);
    
    for (const [ws] of this.sessions) {
      if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(data);
        } catch (error) {
          console.error('Error broadcasting to client:', error);
        }
      }
    }
  }

  private async getMessages(): Promise<Response> {
    return new Response(JSON.stringify({
      messages: this.room.messageHistory,
      roomId: this.room.id,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async getUsers(): Promise<Response> {
    return new Response(JSON.stringify({
      users: this.room.users,
      roomId: this.room.id,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async getPresence(): Promise<Response> {
    const presence = this.room.users.map(user => ({
      userId: user.id,
      status: user.status,
      lastSeen: new Date().toISOString(),
    }));
    
    return new Response(JSON.stringify(presence), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async handleBroadcast(request: Request): Promise<Response> {
    try {
      const message = await request.json();
      this.broadcast(message);
      return new Response('OK');
    } catch (error) {
      return new Response('Invalid request', { status: 400 });
    }
  }

  private async saveState() {
    await this.state.storage.put('room', this.room);
  }

  // WebSocket hibernation support
  async webSocketError(ws: WebSocket, error: any) {
    console.error('WebSocket error:', error);
    ws.close(1011, 'Internal server error');
  }
}

/**
 * Durable Objects Provider Client
 * Connects to Durable Objects via WebSocket
 */
export class DurableObjectsProvider implements RealtimeProvider {
  private ws: WebSocket | null = null;
  private roomStub: any = null;
  private userId: string = '';
  private connected = false;
  private channels = new Set<string>();
  
  // Event handlers
  private messageHandlers: Array<(message: RealtimeMessage) => void> = [];
  private presenceHandlers: Array<(presence: RealtimePresence) => void> = [];
  private connectHandlers: Array<() => void> = [];
  private disconnectHandlers: Array<() => void> = [];
  private errorHandlers: Array<(error: Error) => void> = [];

  constructor(
    private durableObjectNamespace: any,
    private baseUrl: string
  ) {}

  async connect(userId: string, metadata?: Record<string, any>): Promise<void> {
    this.userId = userId;
    
    // For each channel, create a WebSocket connection to the Durable Object
    // This is simplified - in production, you'd manage multiple connections
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.disconnectHandlers.forEach(handler => handler());
  }

  isConnected(): boolean {
    return this.connected;
  }

  async subscribe(channel: string): Promise<void> {
    // Get or create Durable Object for this channel
    const id = this.durableObjectNamespace.idFromName(channel);
    this.roomStub = this.durableObjectNamespace.get(id);
    
    // Connect via WebSocket
    const wsUrl = `${this.baseUrl}/ws?userId=${this.userId}&channel=${channel}`;
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      this.connected = true;
      this.channels.add(channel);
      this.connectHandlers.forEach(handler => handler());
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    
    this.ws.onerror = (error) => {
      this.errorHandlers.forEach(handler => handler(new Error('WebSocket error')));
    };
    
    this.ws.onclose = () => {
      this.connected = false;
      this.disconnectHandlers.forEach(handler => handler());
    };
  }

  async unsubscribe(channel: string): Promise<void> {
    this.channels.delete(channel);
    if (this.channels.size === 0) {
      await this.disconnect();
    }
  }

  async send(channel: string, event: string, data: any): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected');
    }
    
    this.ws.send(JSON.stringify({
      type: event,
      channel,
      ...data,
    }));
  }

  async broadcast(channel: string, event: string, data: any, excludeUserId?: string): Promise<void> {
    // Durable Objects handle broadcasting internally
    await this.send(channel, event, { ...data, excludeUserId });
  }

  async updatePresence(channel: string, status: 'online' | 'away' | 'offline'): Promise<void> {
    await this.send(channel, 'presence', { status });
  }

  async getPresence(channel: string): Promise<RealtimePresence[]> {
    if (!this.roomStub) {
      return [];
    }
    
    const response = await this.roomStub.fetch(`${this.baseUrl}/presence`);
    return response.json();
  }

  onMessage(handler: (message: RealtimeMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  onPresence(handler: (presence: RealtimePresence) => void): void {
    this.presenceHandlers.push(handler);
  }

  onConnect(handler: () => void): void {
    this.connectHandlers.push(handler);
  }

  onDisconnect(handler: () => void): void {
    this.disconnectHandlers.push(handler);
  }

  onError(handler: (error: Error) => void): void {
    this.errorHandlers.push(handler);
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'message':
        this.messageHandlers.forEach(handler => handler({
          id: data.id,
          channel: data.channel || '',
          event: 'message',
          data: data,
          userId: data.userId,
          timestamp: data.timestamp,
        }));
        break;
      
      case 'presence':
        this.presenceHandlers.forEach(handler => handler({
          userId: data.userId,
          status: data.status,
          lastSeen: data.timestamp,
        }));
        break;
    }
  }
}