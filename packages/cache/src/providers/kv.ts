/**
 * Cloudflare KV Cache Provider
 */

import type { CacheOptions, CacheProvider } from '../types';

export class KVCacheProvider implements CacheProvider {
  constructor(private kv: KVNamespace) {}

  async get<T = any>(key: string): Promise<T | null> {
    const data = await this.kv.get(key, 'json');
    return data as T | null;
  }

  async set<T = any>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const { ttl = 3600, tags = [], metadata = {} } = options;

    await this.kv.put(
      key,
      JSON.stringify(value),
      {
        expirationTtl: ttl,
        metadata: {
          ...metadata,
          tags,
          cachedAt: new Date().toISOString(),
        },
      }
    );

    // Store tags for invalidation
    if (tags.length > 0) {
      await this.addToTags(key, tags);
    }
  }

  async delete(key: string): Promise<void> {
    // Get metadata to find tags
    const { metadata } = await this.kv.getWithMetadata(key) || {};
    
    if (metadata?.tags) {
      await this.removeFromTags(key, metadata.tags as string[]);
    }

    await this.kv.delete(key);
  }

  async has(key: string): Promise<boolean> {
    const value = await this.kv.get(key);
    return value !== null;
  }

  async clear(prefix?: string): Promise<void> {
    const keys = await this.kv.list({ prefix });
    
    await Promise.all(
      keys.keys.map(({ name }) => this.kv.delete(name))
    );
  }

  async getMany<T = any>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();
    
    await Promise.all(
      keys.map(async key => {
        const value = await this.get<T>(key);
        results.set(key, value);
      })
    );

    return results;
  }

  async setMany<T = any>(
    entries: Array<[string, T, CacheOptions?]>
  ): Promise<void> {
    await Promise.all(
      entries.map(([key, value, options]) =>
        this.set(key, value, options)
      )
    );
  }

  async deleteMany(keys: string[]): Promise<void> {
    await Promise.all(keys.map(key => this.delete(key)));
  }

  async invalidateByTag(tag: string): Promise<void> {
    const keys = await this.getKeysByTag(tag);
    await this.deleteMany(keys);
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

  // Private helpers for tag management
  private async addToTags(key: string, tags: string[]): Promise<void> {
    await Promise.all(
      tags.map(async tag => {
        const tagKey = `__tag:${tag}`;
        const keys = await this.kv.get(tagKey, 'json') as string[] || [];
        
        if (!keys.includes(key)) {
          keys.push(key);
          await this.kv.put(
            tagKey,
            JSON.stringify(keys),
            { expirationTtl: 86400 } // 24 hours
          );
        }
      })
    );
  }

  private async removeFromTags(key: string, tags: string[]): Promise<void> {
    await Promise.all(
      tags.map(async tag => {
        const tagKey = `__tag:${tag}`;
        const keys = await this.kv.get(tagKey, 'json') as string[] || [];
        
        const filtered = keys.filter(k => k !== key);
        
        if (filtered.length > 0) {
          await this.kv.put(
            tagKey,
            JSON.stringify(filtered),
            { expirationTtl: 86400 }
          );
        } else {
          await this.kv.delete(tagKey);
        }
      })
    );
  }

  private async getKeysByTag(tag: string): Promise<string[]> {
    const tagKey = `__tag:${tag}`;
    const keys = await this.kv.get(tagKey, 'json') as string[] || [];
    return keys;
  }
}