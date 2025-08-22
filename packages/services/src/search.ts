import { and, desc, eq, ilike, or, schema, sql, type DatabaseClient } from '@repo/database';
import { ServiceError, internalError, notFound } from './lib/errors';

export interface SearchResult {
  id: string;
  type: 'board' | 'asset' | 'user';
  title: string;
  description?: string;
  url?: string;
  score: number;
  metadata?: Record<string, any>;
}

export interface SearchOptions {
  query?: string;
  type?: 'board' | 'asset' | 'user' | 'all';
  userId?: string;
  boardId?: string;
  limit?: number;
  offset?: number;
}

export interface EnhancedSearchOptions extends SearchOptions {
  useAI?: boolean;
  includeSimilar?: boolean;
  filters?: {
    assetType?: ('image' | 'video' | 'audio' | 'gif' | 'text' | 'file')[];
    boardVisibility?: ('public' | 'private' | 'shared')[];
  };
}

export class SearchService {
  private aiServiceUrl: string;

  constructor(
    private db: DatabaseClient,
    env: { AI_SERVICE_URL?: string } = {}
  ) {
    // Default to local Mastra dev server, production uses Mastra Cloud
    this.aiServiceUrl = env.AI_SERVICE_URL || 'http://localhost:9998';
  }

  async search(options: SearchOptions): Promise<{
    results: SearchResult[];
    total: number;
    query: string;
    filters: Record<string, any>;
  }> {
    const {
      query = '',
      type = 'all',
      userId,
      limit = 20,
      offset = 0,
    } = options;

    try {
      const results: SearchResult[] = [];

      // Search based on type
      if (type === 'board' || type === 'all') {
        const boardResults = await this.searchBoards({
          query,
          userId,
          limit,
          offset,
        });
        results.push(...boardResults);
      }

      if (type === 'asset' || type === 'all') {
        const assetResults = await this.searchAssets({
          query,
          userId,
          boardId: options.boardId,
          limit,
          offset,
        });
        results.push(...assetResults);
      }

      if (type === 'user' || type === 'all') {
        const userResults = await this.searchUsers({
          query,
          limit,
          offset,
        });
        results.push(...userResults);
      }

      // Sort by score and apply pagination
      const sortedResults = results
        .sort((a, b) => b.score - a.score)
        .slice(offset, offset + limit);

      return {
        results: sortedResults,
        total: results.length,
        query,
        filters: { type, userId },
      };
    } catch (_error) {
      throw internalError('Failed to perform search');
    }
  }

  async enhancedSearch(options: EnhancedSearchOptions): Promise<{
    results: SearchResult[];
    total: number;
    query: string;
    expanded: string[];
    aiInsights?: {
      relevantTopics: string[];
      searchIntent: string;
      suggestedFilters: string[];
    };
  }> {
    let expandedQuery = options.query || '';
    let aiInsights;

    // Use AI to enhance search if enabled
    if (options.useAI && options.query) {
      const enhanced = await this.enhanceQuery(options.query);
      expandedQuery = enhanced.expanded;
      aiInsights = enhanced.insights;
    }

    // Perform the search with expanded query
    const results = await this.search({
      ...options,
      query: expandedQuery,
    });

    // If similarity search is enabled, fetch similar items
    let similarResults: SearchResult[] = [];
    if (options.includeSimilar && aiInsights) {
      similarResults = await this.findSimilarContent(results.results);
    }

    // Combine and deduplicate results
    const combinedResults = [...results.results, ...similarResults]
      .filter(
        (item, index, self) => index === self.findIndex((t) => t.id === item.id)
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, options.limit || 20);

    return {
      results: combinedResults,
      total: combinedResults.length,
      query: options.query || '',
      expanded: aiInsights ? [expandedQuery] : [],
      aiInsights,
    };
  }

  private async searchBoards(options: {
    query: string;
    userId?: string;
    limit: number;
    offset: number;
  }): Promise<SearchResult[]> {
    const { query, userId, limit, offset } = options;

    const conditions = [];

    if (query) {
      conditions.push(
        or(
          ilike(schema.boards.name, `%${query}%`),
          ilike(schema.boards.description, `%${query}%`),
          ilike(schema.boards.instructions, `%${query}%`)
        )
      );
    }

    // Visibility filter for non-user searches
    if (!userId) {
      conditions.push(eq(schema.boards.visibility, 'public'));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await this.db
      .select({
        id: schema.boards.id,
        title: schema.boards.name,
        description: schema.boards.description,
        visibility: schema.boards.visibility,
        creatorId: schema.boards.creatorId,
        createdAt: schema.boards.createdAt,
        score: sql`0.8`,
      })
      .from(schema.boards)
      .where(whereClause)
      .orderBy(desc(schema.boards.updatedAt))
      .limit(limit)
      .offset(offset);

    return results.map((board) => ({
      ...board,
      description: board.description || undefined,
      type: 'board' as const,
      score: this.calculateScore(
        [board.title, board.description || ''].join(' '),
        query
      ),
      url: `/board/${board.id}`,
      metadata: {
        visibility: board.visibility,
        creatorId: board.creatorId,
      },
    }));
  }

  private async searchAssets(options: {
    query: string;
    userId?: string;
    boardId?: string;
    limit: number;
    offset: number;
  }): Promise<SearchResult[]> {
    const { query, userId, boardId, limit, offset } = options;

    const conditions = [];

    if (query) {
      conditions.push(
        or(
          ilike(schema.assets.name, `%${query}%`),
          ilike(schema.assets.metadata, `%${query}%`)
        )
      );
    }

    // Filter by specific board
    if (boardId) {
      conditions.push(eq(schema.boardAssets.boardId, boardId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let queryBuilder = this.db
      .select({
        id: schema.assets.id,
        title: schema.assets.name,
        type: schema.assets.type,
        url: schema.assets.url,
        metadata: schema.assets.metadata,
        creatorId: schema.assets.creatorId,
        createdAt: schema.assets.createdAt,
        score: sql`0.9`,
      })
      .from(schema.assets)
      .where(whereClause);

    // Join with boardAssets if boardId is specified
    if (boardId) {
      queryBuilder = queryBuilder.innerJoin(
        schema.boardAssets,
        eq(schema.assets.id, schema.boardAssets.assetId)
      );
    }

    const results = await queryBuilder
      .orderBy(desc(schema.assets.createdAt))
      .limit(limit)
      .offset(offset);

    return results.map((asset) => ({
      ...asset,
      type: 'asset' as const,
      title: asset.title,
      description: asset.metadata?.description as string | undefined,
      score: this.calculateScore([asset.title].join(' '), query),
      url: asset.url,
      metadata: {
        assetType: asset.type,
        creatorId: asset.creatorId,
      },
    }));
  }

  private async searchUsers(options: {
    query: string;
    limit: number;
    offset: number;
  }): Promise<SearchResult[]> {
    const { query, limit, offset } = options;

    const results = await this.db
      .select({
        id: schema.users.id,
        title: sql`${schema.users.name} || ' (' || ${schema.users.username} || ')'`,
        username: schema.users.username,
        name: schema.users.name,
        bio: schema.users.bio,
        pfpUrl: schema.users.pfpUrl,
        score: sql`0.7`,
      })
      .from(schema.users)
      .where(
        or(
          ilike(schema.users.username, `%${query}%`),
          ilike(schema.users.name, `%${query}%`),
          ilike(schema.users.bio, `%${query}%`)
        )
      )
      .limit(limit)
      .offset(offset);

    return results.map((user) => ({
      ...user,
      title: user.name || user.username || '',
      type: 'user' as const,
      description: user.bio || undefined,
      score: this.calculateScore(
        [user.name || '', user.username, user.bio || ''].join(' '),
        query
      ),
      url: `/user/${user.username}`,
      metadata: {
        username: user.username,
        pfpUrl: user.pfpUrl,
      },
    }));
  }

  private async enhanceQuery(originalQuery: string): Promise<{
    expanded: string;
    insights: {
      relevantTopics: string[];
      searchIntent: string;
      suggestedFilters: string[];
    };
  }> {
    try {
      // Call Mastra AI service agent endpoint
      const response = await fetch(`${this.aiServiceUrl}/api/agents/search-enhancer/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Enhance this search query: ${originalQuery}`
            }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance query');
      }

      const data = await response.json() as any;
      
      // Parse Mastra agent response format
      const responseText = data.text || '';
      let parsedResponse: any = {};
      
      try {
        // Try to extract JSON from the response if the agent returned structured data
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Fallback to basic parsing
        parsedResponse = {
          expandedQuery: responseText || originalQuery,
          insights: {
            relevantTopics: [],
            searchIntent: responseText.slice(0, 100),
            suggestedFilters: [],
          }
        };
      }
      
      return {
        expanded: parsedResponse.expandedQuery || originalQuery,
        insights: parsedResponse.insights || {
          relevantTopics: [],
          searchIntent: '',
          suggestedFilters: [],
        },
      };
    } catch (_error) {
      return {
        expanded: originalQuery,
        insights: {
          relevantTopics: [],
          searchIntent: '',
          suggestedFilters: [],
        },
      };
    }
  }

  private async findSimilarContent(
    _results: SearchResult[]
  ): Promise<SearchResult[]> {
    // This would use embeddings to find similar content
    // For now, return empty as this requires the AI service integration
    return [];
  }

  private calculateScore(content: string, query: string): number {
    if (!query) {
      return 0.5;
    }

    const contentLower = content.toLowerCase();
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ').filter((w) => w.length > 2);

    let score = 0;
    let _matchCount = 0;

    // Calculate score based on word matches
    for (const word of queryWords) {
      if (contentLower.includes(word)) {
        _matchCount++;
        score += 1 / queryWords.length;
      }
    }

    // Bonus for exact phrase match
    if (contentLower.includes(queryLower)) {
      score += 0.5;
    }

    // Bonus for starting with the query
    if (contentLower.startsWith(queryLower)) {
      score += 0.3;
    }

    return Math.min(score, 1.0);
  }

  async saveSearchHistory(
    userId: string,
    query: string,
    expandedContext?: string,
    resultsSnapshot?: any
  ): Promise<string> {
    try {
      const [search] = await this.db
        .insert(schema.searches)
        .values({
          query,
          expandedContext,
          resultsSnapshot,
          newResultsCount: resultsSnapshot?.length || 0,
          userId,
        })
        .returning();

      return search.id;
    } catch (_error) {
      // Don't throw error as search history is not critical
      return '';
    }
  }

  async getSearchHistory(userId: string, limit = 20): Promise<any[]> {
    try {
      return await this.db
        .select({
          id: schema.searches.id,
          query: schema.searches.query,
          expandedContext: schema.searches.expandedContext,
          newResultsCount: schema.searches.newResultsCount,
          lastChecked: schema.searches.lastChecked,
          createdAt: schema.searches.createdAt,
        })
        .from(schema.searches)
        .where(eq(schema.searches.userId, userId))
        .orderBy(desc(schema.searches.createdAt))
        .limit(limit);
    } catch (_error) {
      return [];
    }
  }

  async checkSearchResults(
    searchId: string,
    userId: string
  ): Promise<{
    hasNewResults: boolean;
    newResultsCount: number;
    results: SearchResult[];
  }> {
    try {
      const search = await this.db
        .select()
        .from(schema.searches)
        .where(
          and(
            eq(schema.searches.id, searchId),
            eq(schema.searches.userId, userId)
          )
        )
        .limit(1);

      if (!search[0]) {
        throw notFound('Search not found');
      }

      // Re-run the search with the original query
      const results = await this.search({
        query: search[0].query,
        userId,
        limit: 50,
      });

      const newResultsCount =
        results.results.length - (search[0].newResultsCount || 0);

      // Update search record if new results found
      if (newResultsCount > 0) {
        await this.db
          .update(schema.searches)
          .set({
            newResultsCount: results.results.length,
            lastChecked: new Date(),
          })
          .where(eq(schema.searches.id, searchId));
      }

      return {
        hasNewResults: newResultsCount > 0,
        newResultsCount: Math.max(newResultsCount, 0),
        results: results.results.slice(0, 10), // Return top 10 new results
      };
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to check search results');
    }
  }
}

