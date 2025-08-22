/**
 * Cache Types
 */

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  metadata?: Record<string, any>;
}

export interface CacheProvider {
  get<T = any>(key: string): Promise<T | null>;
  set<T = any>(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
  clear(prefix?: string): Promise<void>;
  
  // Batch operations
  getMany<T = any>(keys: string[]): Promise<Map<string, T | null>>;
  setMany<T = any>(entries: Array<[string, T, CacheOptions?]>): Promise<void>;
  deleteMany(keys: string[]): Promise<void>;
  
  // Tag-based operations
  invalidateByTag?(tag: string): Promise<void>;
  
  // Utility
  getOrSet<T = any>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T>;
}

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  avatar?: string;
  roles?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  expiresAt: string;
}

export interface SessionProvider {
  get(sessionId: string): Promise<SessionData | null>;
  set(sessionId: string, data: Omit<SessionData, 'createdAt' | 'expiresAt'>, ttl?: number): Promise<void>;
  delete(sessionId: string): Promise<void>;
  touch(sessionId: string, ttl?: number): Promise<boolean>;
  getUserSessions(userId: string): Promise<SessionData[]>;
}