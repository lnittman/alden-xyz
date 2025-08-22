/**
 * @repo/realtime
 * Real-time communication abstraction with multiple provider support
 */

import { logger } from '@repo/logger';
import type { RealtimeProvider } from './types';

export * from './types';
export { ChatRoom, DurableObjectsProvider } from './providers/durable-objects';

/**
 * Realtime Manager
 * Provides a unified interface for real-time communication
 */
export class RealtimeManager {
  private provider: RealtimeProvider;
  
  // Event delegation properties
  onMessage: RealtimeProvider['onMessage'];
  onPresence: RealtimeProvider['onPresence'];
  onConnect: RealtimeProvider['onConnect'];
  onDisconnect: RealtimeProvider['onDisconnect'];
  onError: RealtimeProvider['onError'];

  constructor(provider: RealtimeProvider) {
    this.provider = provider;
    
    // Bind event handlers after provider is initialized
    this.onMessage = this.provider.onMessage.bind(this.provider);
    this.onPresence = this.provider.onPresence.bind(this.provider);
    this.onConnect = this.provider.onConnect.bind(this.provider);
    this.onDisconnect = this.provider.onDisconnect.bind(this.provider);
    this.onError = this.provider.onError.bind(this.provider);
  }

  // Connection management
  async connect(userId: string, metadata?: Record<string, any>): Promise<void> {
    logger.info('Connecting to realtime service', { userId });
    return this.provider.connect(userId, metadata);
  }

  async disconnect(): Promise<void> {
    logger.info('Disconnecting from realtime service');
    return this.provider.disconnect();
  }

  isConnected(): boolean {
    return this.provider.isConnected();
  }

  // Channel management
  async joinChannel(channel: string): Promise<void> {
    logger.info('Joining channel', { channel });
    return this.provider.subscribe(channel);
  }

  async leaveChannel(channel: string): Promise<void> {
    logger.info('Leaving channel', { channel });
    return this.provider.unsubscribe(channel);
  }

  // Messaging
  async sendMessage(channel: string, event: string, data: any): Promise<void> {
    return this.provider.send(channel, event, data);
  }

  async broadcast(channel: string, event: string, data: any, excludeUserId?: string): Promise<void> {
    return this.provider.broadcast(channel, event, data, excludeUserId);
  }

  // Presence
  async updatePresence(channel: string, status: 'online' | 'away' | 'offline'): Promise<void> {
    return this.provider.updatePresence(channel, status);
  }

  async getPresence(channel: string) {
    return this.provider.getPresence(channel);
  }
}

// Helper to create provider based on environment
export function createRealtimeProvider(config: {
  provider: 'durable-objects' | 'pusher' | 'memory';
  options?: any;
}): RealtimeProvider {
  switch (config.provider) {
    case 'durable-objects':
      const { DurableObjectsProvider } = require('./providers/durable-objects');
      return new DurableObjectsProvider(
        config.options.namespace,
        config.options.baseUrl
      );
    
    case 'pusher':
      // Placeholder for Pusher provider
      throw new Error('Pusher provider not yet implemented');
    
    case 'memory':
      // Placeholder for in-memory provider (for testing)
      throw new Error('Memory provider not yet implemented');
    
    default:
      throw new Error(`Unknown realtime provider: ${config.provider}`);
  }
}