/**
 * In-Memory Cache Provider
 * Used for development and testing
 */

import type { CacheOptions, CacheProvider } from '../types';

interface CacheEntry<T = any> {
  value: T;
  expiresAt?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}

export class MemoryCacheProvider implements CacheProvider {
  private cache = new Map<string, CacheEntry>();
  private tags = new Map<string, Set<string>>();
  private timers = new Map<string, NodeJS.Timeout>();

  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check expiration
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      await this.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T = any>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const { ttl, tags = [], metadata = {} } = options;

    // Clear existing timer if any
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.timers.delete(key);
    }

    // Remove from old tags if updating
    const existingEntry = this.cache.get(key);
    if (existingEntry?.tags) {
      this.removeFromTags(key, existingEntry.tags);
    }

    const entry: CacheEntry<T> = {
      value,
      tags: tags.length > 0 ? tags : undefined,
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    };

    // Set expiration
    if (ttl) {
      entry.expiresAt = Date.now() + ttl * 1000;
      
      // Set timer for auto-deletion
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl * 1000);
      
      this.timers.set(key, timer);
    }

    this.cache.set(key, entry);

    // Add to tags
    if (tags.length > 0) {
      this.addToTags(key, tags);
    }
  }

  async delete(key: string): Promise<void> {
    const entry = this.cache.get(key);
    
    if (entry) {
      // Remove from tags
      if (entry.tags) {
        this.removeFromTags(key, entry.tags);
      }

      // Clear timer
      const timer = this.timers.get(key);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(key);
      }

      this.cache.delete(key);
    }
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async clear(prefix?: string): Promise<void> {
    if (!prefix) {
      // Clear all
      for (const timer of this.timers.values()) {
        clearTimeout(timer);
      }
      
      this.cache.clear();
      this.tags.clear();
      this.timers.clear();
    } else {
      // Clear by prefix
      const keysToDelete: string[] = [];
      
      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) {
          keysToDelete.push(key);
        }
      }

      await Promise.all(keysToDelete.map(key => this.delete(key)));
    }
  }

  async getMany<T = any>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();
    
    for (const key of keys) {
      const value = await this.get<T>(key);
      results.set(key, value);
    }

    return results;
  }

  async setMany<T = any>(
    entries: Array<[string, T, CacheOptions?]>
  ): Promise<void> {
    for (const [key, value, options] of entries) {
      await this.set(key, value, options);
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    for (const key of keys) {
      await this.delete(key);
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    const keys = this.tags.get(tag);
    
    if (keys) {
      await this.deleteMany(Array.from(keys));
      this.tags.delete(tag);
    }
  }

  async getOrSet<T = any>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  // Private helpers
  private addToTags(key: string, tags: string[]): void {
    for (const tag of tags) {
      let keys = this.tags.get(tag);
      if (!keys) {
        keys = new Set();
        this.tags.set(tag, keys);
      }
      keys.add(key);
    }
  }

  private removeFromTags(key: string, tags: string[]): void {
    for (const tag of tags) {
      const keys = this.tags.get(tag);
      if (keys) {
        keys.delete(key);
        if (keys.size === 0) {
          this.tags.delete(tag);
        }
      }
    }
  }

  // Cleanup method for tests
  destroy(): void {
    this.clear();
  }
}