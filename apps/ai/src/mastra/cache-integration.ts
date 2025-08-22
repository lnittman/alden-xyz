import { aiCache, cacheUtils, CacheAside } from './lib/cache';
import { aiServiceClient } from './lib/orpc-client';

/**
 * Cache integration for Mastra tools
 * Optimizes performance by caching frequently accessed data
 */

/**
 * Cached ORPC client wrapper
 */
export class CachedAIServiceClient {
  private boardCache: CacheAside<any>;
  private assetCache: CacheAside<any>;
  private userCache: CacheAside<any>;
  
  constructor(private client: typeof aiServiceClient) {
    // Initialize cache-aside patterns for different entities
    this.boardCache = new CacheAside(
      aiCache,
      (boardId: string) => this.client.getBoard(boardId),
      { ttl: 600000, keyPrefix: 'board' } // 10 minutes
    );
    
    this.assetCache = new CacheAside(
      aiCache,
      (assetId: string) => this.client.getAsset(assetId),
      { ttl: 600000, keyPrefix: 'asset' }
    );
    
    this.userCache = new CacheAside(
      aiCache,
      (userId: string) => this.client.getUser(userId),
      { ttl: 1800000, keyPrefix: 'user' } // 30 minutes
    );
  }
  
  /**
   * Cached board operations
   */
  async getBoard(boardId: string, userId?: string): Promise<any> {
    return this.boardCache.get(boardId);
  }
  
  async getBoardAssets(boardId: string): Promise<any[]> {
    const cacheKey = `board-assets:${boardId}`;
    
    // Check cache
    const cached = await aiCache.get(cacheKey);
    if (cached) return cached;
    
    // Fetch from API
    const assets = await this.client.getBoardAssets(boardId);
    
    // Cache for 5 minutes
    await aiCache.set(cacheKey, assets, 300000);
    
    return assets;
  }
  
  /**
   * Cached search with smart invalidation
   */
  async searchBoards(query: string, filters?: any): Promise<any> {
    // Check if we have cached embeddings for this query
    const cachedEmbeddings = await aiCache.getCachedEmbeddings(query);
    
    // Check search cache
    const cachedResults = await aiCache.getCachedSearchResults(
      query,
      'board',
      filters
    );
    
    if (cachedResults && Date.now() - cachedResults.timestamp < 300000) {
      return cachedResults.results;
    }
    
    // Perform search
    const results = await this.client.searchBoards(query, filters);
    
    // Cache results
    await aiCache.cacheSearchResults(query, 'board', filters, results);
    
    return results;
  }
  
  /**
   * Cached asset operations
   */
  async getAsset(assetId: string): Promise<any> {
    return this.assetCache.get(assetId);
  }
  
  async searchAssets(query: string, boardId?: string): Promise<any> {
    const filters = { boardId };
    
    // Check search cache
    const cachedResults = await aiCache.getCachedSearchResults(
      query,
      'asset',
      filters
    );
    
    if (cachedResults) return cachedResults.results;
    
    // Perform search
    const results = await this.client.searchAssets(query, boardId);
    
    // Cache results
    await aiCache.cacheSearchResults(query, 'asset', filters, results);
    
    return results;
  }
  
  /**
   * Cached user operations
   */
  async getUser(userId?: string): Promise<any> {
    if (!userId) return this.client.getUser(userId);
    return this.userCache.get(userId);
  }
  
  async getUserStats(userId?: string): Promise<any> {
    const cacheKey = `user-stats:${userId || 'current'}`;
    
    // Check cache
    const cached = await aiCache.get(cacheKey);
    if (cached) return cached;
    
    // Fetch from API
    const stats = await this.client.getUserStats(userId);
    
    // Cache for 10 minutes
    await aiCache.set(cacheKey, stats, 600000);
    
    return stats;
  }
  
  /**
   * Batch operations with caching
   */
  async batchGetBoards(boardIds: string[]): Promise<Map<string, any>> {
    return cacheUtils.batchGet(
      boardIds,
      async (ids) => {
        const boards = await Promise.all(
          ids.map(id => this.client.getBoard(id))
        );
        const map = new Map<string, any>();
        boards.forEach((board, i) => map.set(ids[i], board));
        return map;
      }
    );
  }
  
  async batchGetAssets(assetIds: string[]): Promise<Map<string, any>> {
    return cacheUtils.batchGet(
      assetIds,
      async (ids) => {
        const assets = await Promise.all(
          ids.map(id => this.client.getAsset(id))
        );
        const map = new Map<string, any>();
        assets.forEach((asset, i) => map.set(ids[i], asset));
        return map;
      }
    );
  }
  
  /**
   * Cache invalidation methods
   */
  async invalidateBoard(boardId: string): Promise<void> {
    await this.boardCache.invalidate(boardId);
    await aiCache.delete(`board-assets:${boardId}`);
    await aiCache.invalidate(`search:board:`);
  }
  
  async invalidateAsset(assetId: string): Promise<void> {
    await this.assetCache.invalidate(assetId);
    await aiCache.invalidate(`search:asset:`);
  }
  
  async invalidateUser(userId: string): Promise<void> {
    await this.userCache.invalidate(userId);
    await aiCache.delete(`user-stats:${userId}`);
  }
  
  /**
   * Preload cache with predicted content
   */
  async preloadCache(strategy: 'popular' | 'recent' | 'user-based', userId?: string): Promise<void> {
    switch (strategy) {
      case 'popular':
        // Preload popular boards and assets
        const popularBoards = await this.client.enhancedSearch({
          query: '',
          type: 'board',
          limit: 20,
        });
        
        for (const board of popularBoards.boards || []) {
          await this.boardCache.get(board.id);
        }
        break;
        
      case 'recent':
        // Preload recently accessed content
        if (userId) {
          const recentAssets = await this.client.getUserRecentAssets(userId, 10);
          for (const asset of recentAssets) {
            await this.assetCache.get(asset.id);
          }
        }
        break;
        
      case 'user-based':
        // Preload based on user preferences
        if (userId) {
          const userContext = await aiCache.getCachedUserContext(userId);
          if (userContext?.frequentBoards) {
            await this.batchGetBoards(userContext.frequentBoards);
          }
        }
        break;
    }
  }
}

/**
 * Create cached Mastra tool wrapper
 */
export function createCachedTool(tool: any) {
  const cachedClient = new CachedAIServiceClient(aiServiceClient);
  
  return {
    ...tool,
    execute: cacheUtils.memoize(
      async (context: any) => {
        // Replace client calls with cached versions
        const originalClient = (global as any).aiServiceClient;
        (global as any).aiServiceClient = cachedClient;
        
        try {
          const result = await tool.execute({ context });
          return result;
        } finally {
          // Restore original client
          (global as any).aiServiceClient = originalClient;
        }
      },
      {
        ttl: 300000, // 5 minutes
        keyGenerator: (context) => `tool:${tool.id}:${JSON.stringify(context)}`,
      }
    ),
  };
}

/**
 * Embedding cache service
 */
export class EmbeddingCacheService {
  /**
   * Get embeddings with caching
   */
  async getEmbeddings(text: string): Promise<number[]> {
    // Check cache first
    const cached = await aiCache.getCachedEmbeddings(text);
    if (cached) return cached;
    
    // Generate embeddings (this would call your embedding service)
    const embeddings = await this.generateEmbeddings(text);
    
    // Cache for future use
    await aiCache.cacheEmbeddings(text, embeddings);
    
    return embeddings;
  }
  
  /**
   * Batch get embeddings with caching
   */
  async batchGetEmbeddings(texts: string[]): Promise<Map<string, number[]>> {
    const results = new Map<string, number[]>();
    const uncached: string[] = [];
    
    // Check cache for each text
    for (const text of texts) {
      const cached = await aiCache.getCachedEmbeddings(text);
      if (cached) {
        results.set(text, cached);
      } else {
        uncached.push(text);
      }
    }
    
    // Generate embeddings for uncached texts
    if (uncached.length > 0) {
      const embeddings = await this.batchGenerateEmbeddings(uncached);
      
      // Cache and add to results
      for (let i = 0; i < uncached.length; i++) {
        const text = uncached[i];
        const embedding = embeddings[i];
        await aiCache.cacheEmbeddings(text, embedding);
        results.set(text, embedding);
      }
    }
    
    return results;
  }
  
  private async generateEmbeddings(text: string): Promise<number[]> {
    // This would call your actual embedding service
    return Array(768).fill(0).map(() => Math.random());
  }
  
  private async batchGenerateEmbeddings(texts: string[]): Promise<number[][]> {
    // This would call your actual embedding service
    return texts.map(() => Array(768).fill(0).map(() => Math.random()));
  }
}

/**
 * Cache warming service
 */
export class CacheWarmingService {
  private warmingInterval: NodeJS.Timeout | null = null;
  
  /**
   * Start cache warming
   */
  startWarming(intervalMs: number = 300000) {
    this.warmingInterval = setInterval(async () => {
      await this.warmCache();
    }, intervalMs);
  }
  
  /**
   * Stop cache warming
   */
  stopWarming() {
    if (this.warmingInterval) {
      clearInterval(this.warmingInterval);
      this.warmingInterval = null;
    }
  }
  
  private async warmCache() {
    try {
      // Warm different cache strategies
      await aiCache.warmCache('popular');
      await aiCache.warmCache('recent');
      
      // Log cache stats
      const stats = aiCache.getStats();
      console.log('Cache stats:', stats);
    } catch (error) {
      console.error('Cache warming failed:', error);
    }
  }
}

// Export singleton instances
export const cachedClient = new CachedAIServiceClient(aiServiceClient);
export const embeddingCache = new EmbeddingCacheService();
export const cacheWarmer = new CacheWarmingService();

// Start cache warming in production
if (process.env.NODE_ENV === 'production') {
  cacheWarmer.startWarming();
}