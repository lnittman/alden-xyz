/**
 * Caching layer for AI service
 * Provides efficient caching for embeddings, search results, and AI responses
 */

import { LRUCache } from 'lru-cache';

/**
 * Cache configuration
 */
interface CacheConfig {
  maxSize?: number;
  ttl?: number;
  updateAgeOnGet?: boolean;
  updateAgeOnHas?: boolean;
}

/**
 * Multi-tier cache system
 */
export class AICache {
  // In-memory cache for hot data
  private memoryCache: LRUCache<string, any>;
  
  // Embeddings cache (larger, longer TTL)
  private embeddingsCache: LRUCache<string, number[]>;
  
  // Search results cache (medium TTL)
  private searchCache: LRUCache<string, any>;
  
  // User preferences cache
  private preferencesCache: LRUCache<string, any>;
  
  constructor() {
    // Initialize memory cache (10MB, 5 min TTL)
    this.memoryCache = new LRUCache({
      max: 1000,
      ttl: 5 * 60 * 1000,
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    });
    
    // Initialize embeddings cache (100MB, 1 hour TTL)
    this.embeddingsCache = new LRUCache({
      max: 10000,
      ttl: 60 * 60 * 1000,
      updateAgeOnGet: false,
      sizeCalculation: (value) => value.length * 4, // 4 bytes per float
    });
    
    // Initialize search cache (50MB, 10 min TTL)
    this.searchCache = new LRUCache({
      max: 5000,
      ttl: 10 * 60 * 1000,
      updateAgeOnGet: true,
    });
    
    // Initialize preferences cache (5MB, 30 min TTL)
    this.preferencesCache = new LRUCache({
      max: 500,
      ttl: 30 * 60 * 1000,
      updateAgeOnGet: true,
    });
  }
  
  /**
   * Cache embeddings for text
   */
  async cacheEmbeddings(text: string, embeddings: number[]): Promise<void> {
    const key = this.getEmbeddingKey(text);
    this.embeddingsCache.set(key, embeddings);
  }
  
  /**
   * Get cached embeddings
   */
  async getCachedEmbeddings(text: string): Promise<number[] | null> {
    const key = this.getEmbeddingKey(text);
    return this.embeddingsCache.get(key) || null;
  }
  
  /**
   * Cache search results
   */
  async cacheSearchResults(
    query: string,
    type: string,
    filters: any,
    results: any[]
  ): Promise<void> {
    const key = this.getSearchKey(query, type, filters);
    this.searchCache.set(key, {
      results,
      timestamp: Date.now(),
      query,
      type,
      filters,
    });
  }
  
  /**
   * Get cached search results
   */
  async getCachedSearchResults(
    query: string,
    type: string,
    filters: any
  ): Promise<any | null> {
    const key = this.getSearchKey(query, type, filters);
    return this.searchCache.get(key) || null;
  }
  
  /**
   * Cache user preferences and context
   */
  async cacheUserContext(userId: string, context: any): Promise<void> {
    this.preferencesCache.set(userId, context);
  }
  
  /**
   * Get cached user context
   */
  async getCachedUserContext(userId: string): Promise<any | null> {
    return this.preferencesCache.get(userId) || null;
  }
  
  /**
   * Generic cache operations
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    this.memoryCache.set(key, value, { ttl });
  }
  
  async get(key: string): Promise<any | null> {
    return this.memoryCache.get(key) || null;
  }
  
  async has(key: string): Promise<boolean> {
    return this.memoryCache.has(key);
  }
  
  async delete(key: string): Promise<boolean> {
    return this.memoryCache.delete(key);
  }
  
  /**
   * Batch operations for efficiency
   */
  async mget(keys: string[]): Promise<(any | null)[]> {
    return keys.map(key => this.memoryCache.get(key) || null);
  }
  
  async mset(entries: Array<[string, any]>): Promise<void> {
    for (const [key, value] of entries) {
      this.memoryCache.set(key, value);
    }
  }
  
  /**
   * Cache warming strategies
   */
  async warmCache(strategy: 'popular' | 'recent' | 'predicted'): Promise<void> {
    switch (strategy) {
      case 'popular':
        await this.warmPopularContent();
        break;
      case 'recent':
        await this.warmRecentContent();
        break;
      case 'predicted':
        await this.warmPredictedContent();
        break;
    }
  }
  
  /**
   * Cache invalidation
   */
  async invalidate(pattern?: string): Promise<number> {
    let count = 0;
    
    if (!pattern) {
      // Clear all caches
      this.memoryCache.clear();
      this.embeddingsCache.clear();
      this.searchCache.clear();
      this.preferencesCache.clear();
      return -1; // Indicate full clear
    }
    
    // Pattern-based invalidation
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
        count++;
      }
    }
    
    return count;
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    return {
      memory: {
        size: this.memoryCache.size,
        calculatedSize: this.memoryCache.calculatedSize,
        hits: (this.memoryCache as any).hits || 0,
        misses: (this.memoryCache as any).misses || 0,
      },
      embeddings: {
        size: this.embeddingsCache.size,
        calculatedSize: this.embeddingsCache.calculatedSize,
      },
      search: {
        size: this.searchCache.size,
      },
      preferences: {
        size: this.preferencesCache.size,
      },
    };
  }
  
  // Private helper methods
  private getEmbeddingKey(text: string): string {
    // Create a stable key for embeddings
    return `emb:${this.hashString(text)}`;
  }
  
  private getSearchKey(query: string, type: string, filters: any): string {
    // Create a stable key for search results
    const filterStr = JSON.stringify(filters || {});
    return `search:${type}:${this.hashString(query)}:${this.hashString(filterStr)}`;
  }
  
  private hashString(str: string): string {
    // Simple hash function for cache keys
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }
  
  private async warmPopularContent(): Promise<void> {
    // Warm cache with popular content
    // This would fetch from your analytics service
  }
  
  private async warmRecentContent(): Promise<void> {
    // Warm cache with recent content
    // This would fetch recent activity
  }
  
  private async warmPredictedContent(): Promise<void> {
    // Warm cache with predicted content based on patterns
    // This would use ML predictions
  }
}

/**
 * Distributed cache interface (for Redis/Memcached)
 */
export class DistributedCache {
  private client: any; // Redis or Memcached client
  
  constructor(client: any) {
    this.client = client;
  }
  
  async get(key: string): Promise<any | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.client.setex(key, ttl, JSON.stringify(value));
  }
  
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
  
  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }
  
  async expire(key: string, ttl: number): Promise<void> {
    await this.client.expire(key, ttl);
  }
}

/**
 * Cache-aside pattern implementation
 */
export class CacheAside<T> {
  constructor(
    private cache: AICache | DistributedCache,
    private fetcher: (key: string) => Promise<T>,
    private options: {
      ttl?: number;
      keyPrefix?: string;
      serialize?: (value: T) => any;
      deserialize?: (value: any) => T;
    } = {}
  ) {}
  
  async get(key: string): Promise<T> {
    const cacheKey = this.getCacheKey(key);
    
    // Try cache first
    const cached = await this.cache.get(cacheKey);
    if (cached !== null) {
      return this.options.deserialize ? this.options.deserialize(cached) : cached;
    }
    
    // Fetch from source
    const value = await this.fetcher(key);
    
    // Store in cache
    const toCache = this.options.serialize ? this.options.serialize(value) : value;
    await this.cache.set(cacheKey, toCache, this.options.ttl);
    
    return value;
  }
  
  async invalidate(key: string): Promise<void> {
    const cacheKey = this.getCacheKey(key);
    if (this.cache instanceof AICache) {
      await this.cache.delete(cacheKey);
    } else {
      await this.cache.del(cacheKey);
    }
  }
  
  private getCacheKey(key: string): string {
    return this.options.keyPrefix ? `${this.options.keyPrefix}:${key}` : key;
  }
}

/**
 * Decorator for automatic caching
 */
export function Cacheable(options: {
  ttl?: number;
  key?: (args: any[]) => string;
} = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const cache = new AICache();
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = options.key ? options.key(args) : `${propertyName}:${JSON.stringify(args)}`;
      
      // Check cache
      const cached = await cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
      
      // Execute original method
      const result = await originalMethod.apply(this, args);
      
      // Cache result
      await cache.set(cacheKey, result, options.ttl);
      
      return result;
    };
    
    return descriptor;
  };
}

// Export singleton cache instance
export const aiCache = new AICache();

// Export cache utilities
export const cacheUtils = {
  /**
   * Create a cached version of an async function
   */
  memoize<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options: {
      ttl?: number;
      keyGenerator?: (...args: Parameters<T>) => string;
    } = {}
  ): T {
    return (async (...args: Parameters<T>) => {
      const key = options.keyGenerator 
        ? options.keyGenerator(...args)
        : `memoize:${fn.name}:${JSON.stringify(args)}`;
      
      const cached = await aiCache.get(key);
      if (cached !== null) {
        return cached;
      }
      
      const result = await fn(...args);
      await aiCache.set(key, result, options.ttl);
      
      return result;
    }) as T;
  },
  
  /**
   * Batch cache operations
   */
  async batchGet<T>(
    keys: string[],
    fetcher: (keys: string[]) => Promise<Map<string, T>>
  ): Promise<Map<string, T>> {
    const results = new Map<string, T>();
    const missingKeys: string[] = [];
    
    // Check cache for each key
    for (const key of keys) {
      const cached = await aiCache.get(key);
      if (cached !== null) {
        results.set(key, cached);
      } else {
        missingKeys.push(key);
      }
    }
    
    // Fetch missing keys
    if (missingKeys.length > 0) {
      const fetched = await fetcher(missingKeys);
      
      // Cache fetched results
      for (const [key, value] of fetched) {
        await aiCache.set(key, value);
        results.set(key, value);
      }
    }
    
    return results;
  },
};