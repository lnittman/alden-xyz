/**
 * @repo/cache
 * Caching abstraction with multiple provider support
 */

import { logger } from '@repo/logger';
import type { CacheProvider, CacheOptions, SessionProvider, SessionData } from './types';
import { KVCacheProvider } from './providers/kv';
import { MemoryCacheProvider } from './providers/memory';

export * from './types';
export { KVCacheProvider } from './providers/kv';
export { MemoryCacheProvider } from './providers/memory';

/**
 * Cache Manager
 * Provides a unified interface for caching with automatic provider detection
 */
export class CacheManager {
  private provider: CacheProvider;

  constructor(provider?: CacheProvider) {
    if (provider) {
      this.provider = provider;
    } else {
      // Auto-detect based on environment
      this.provider = this.detectProvider();
    }
  }

  private detectProvider(): CacheProvider {
    // In production with Cloudflare Workers, KV will be available
    if (typeof KVNamespace !== 'undefined' && (globalThis as any).CACHE_KV) {
      logger.info('Using KV cache provider');
      return new KVCacheProvider((globalThis as any).CACHE_KV);
    }

    // Fallback to memory cache for development
    logger.info('Using memory cache provider');
    return new MemoryCacheProvider();
  }

  // Delegate all methods to provider
  get = this.provider.get.bind(this.provider);
  set = this.provider.set.bind(this.provider);
  delete = this.provider.delete.bind(this.provider);
  has = this.provider.has.bind(this.provider);
  clear = this.provider.clear.bind(this.provider);
  getMany = this.provider.getMany.bind(this.provider);
  setMany = this.provider.setMany.bind(this.provider);
  deleteMany = this.provider.deleteMany.bind(this.provider);
  getOrSet = this.provider.getOrSet.bind(this.provider);
  
  // Optional tag-based invalidation
  async invalidateByTag(tag: string): Promise<void> {
    if ('invalidateByTag' in this.provider) {
      return this.provider.invalidateByTag(tag);
    }
    logger.warn('Tag-based invalidation not supported by current provider');
  }
}

/**
 * Session Manager
 * Provides session storage using cache provider
 */
export class SessionManager implements SessionProvider {
  constructor(private cache: CacheProvider) {}

  async get(sessionId: string): Promise<SessionData | null> {
    const data = await this.cache.get<SessionData>(`session:${sessionId}`);
    
    if (!data) return null;

    // Check if session is expired
    if (new Date(data.expiresAt) < new Date()) {
      await this.delete(sessionId);
      return null;
    }

    return data;
  }

  async set(
    sessionId: string,
    data: Omit<SessionData, 'createdAt' | 'expiresAt'>,
    ttl: number = 86400 // 24 hours default
  ): Promise<void> {
    const session: SessionData = {
      ...data,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
    };

    await this.cache.set(
      `session:${sessionId}`,
      session,
      {
        ttl,
        tags: ['session', `user:${data.userId}`],
        metadata: {
          userId: data.userId,
          type: 'session',
        },
      }
    );

    // Add to user's session list
    await this.linkToUser(sessionId, data.userId);
  }

  async delete(sessionId: string): Promise<void> {
    const session = await this.get(sessionId);
    if (session) {
      await this.unlinkFromUser(sessionId, session.userId);
    }
    await this.cache.delete(`session:${sessionId}`);
  }

  async touch(sessionId: string, ttl: number = 86400): Promise<boolean> {
    const session = await this.get(sessionId);
    if (!session) return false;

    session.expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
    
    await this.cache.set(
      `session:${sessionId}`,
      session,
      {
        ttl,
        tags: ['session', `user:${session.userId}`],
      }
    );

    return true;
  }

  async getUserSessions(userId: string): Promise<SessionData[]> {
    const sessionIds = await this.cache.get<string[]>(`user:${userId}:sessions`) || [];
    
    const sessions = await Promise.all(
      sessionIds.map(id => this.get(id))
    );

    return sessions.filter(Boolean) as SessionData[];
  }

  private async linkToUser(sessionId: string, userId: string): Promise<void> {
    const sessionIds = await this.cache.get<string[]>(`user:${userId}:sessions`) || [];
    
    if (!sessionIds.includes(sessionId)) {
      sessionIds.push(sessionId);
      await this.cache.set(
        `user:${userId}:sessions`,
        sessionIds,
        {
          ttl: 2592000, // 30 days
          tags: [`user:${userId}`],
        }
      );
    }
  }

  private async unlinkFromUser(sessionId: string, userId: string): Promise<void> {
    const sessionIds = await this.cache.get<string[]>(`user:${userId}:sessions`) || [];
    
    const filtered = sessionIds.filter(id => id !== sessionId);
    
    if (filtered.length > 0) {
      await this.cache.set(
        `user:${userId}:sessions`,
        filtered,
        {
          ttl: 2592000, // 30 days
          tags: [`user:${userId}`],
        }
      );
    } else {
      await this.cache.delete(`user:${userId}:sessions`);
    }
  }
}

// Export singleton instances for convenience
let defaultCache: CacheManager | null = null;
let defaultSessions: SessionManager | null = null;

export function getCache(provider?: CacheProvider): CacheManager {
  if (!defaultCache || provider) {
    defaultCache = new CacheManager(provider);
  }
  return defaultCache;
}

export function getSessions(provider?: CacheProvider): SessionManager {
  if (!defaultSessions || provider) {
    const cache = provider || getCache().provider;
    defaultSessions = new SessionManager(cache as any);
  }
  return defaultSessions;
}