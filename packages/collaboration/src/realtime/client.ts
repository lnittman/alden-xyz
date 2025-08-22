import Pusher from 'pusher-js';
import type { RealtimeEvent } from './types';

export class RealtimeClient {
  private pusher: Pusher | null = null;
  private channel: any = null;
  private roomId: string | null = null;

  constructor(
    private config: { key: string; cluster: string; authEndpoint: string }
  ) {}

  async connect(roomId: string, userId: string) {
    if (this.pusher) {
      await this.disconnect();
    }

    this.roomId = roomId;

    this.pusher = new Pusher(this.config.key, {
      cluster: this.config.cluster,
      authEndpoint: this.config.authEndpoint,
      auth: {
        params: { userId },
      },
    });

    // Subscribe to private channel for the room
    this.channel = this.pusher.subscribe(`private-${roomId}`);

    return new Promise<void>((resolve, reject) => {
      this.channel.bind('pusher:subscription_succeeded', () => {
        resolve();
      });

      this.channel.bind('pusher:subscription_error', (error: any) => {
        reject(error);
      });
    });
  }

  async disconnect() {
    if (this.channel) {
      this.pusher?.unsubscribe(this.channel.name);
      this.channel = null;
    }

    if (this.pusher) {
      this.pusher.disconnect();
      this.pusher = null;
    }

    this.roomId = null;
  }

  broadcast(event: Omit<RealtimeEvent, 'timestamp'>) {
    if (!this.channel) {
      throw new Error('Not connected to a room');
    }

    this.channel.trigger(`client-${event.type}`, {
      ...event,
      timestamp: Date.now(),
    });
  }

  onEvent(eventType: string, callback: (event: RealtimeEvent) => void) {
    if (!this.channel) {
      throw new Error('Not connected to a room');
    }

    this.channel.bind(`client-${eventType}`, callback);

    return () => {
      this.channel?.unbind(`client-${eventType}`, callback);
    };
  }
}
