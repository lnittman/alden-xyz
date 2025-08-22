import { createClient } from '@repo/orpc/client';
import type { AppRouter } from '@repo/orpc/router';

/**
 * ORPC client for AI service to communicate with the API layer
 * This provides type-safe access to all API endpoints for AI tools
 * 
 * Architecture:
 * - AI tools need real data (boards, assets, users) from the database
 * - API service owns the database layer
 * - AI service calls API service via ORPC to get/manipulate data
 * - This is proper microservices communication, not a circular dependency
 */

// Create the ORPC client with proper configuration for service-to-service communication
const apiUrl = process.env.API_URL || 'http://localhost:8787';

export const orpcClient = createClient<AppRouter>({
  baseUrl: apiUrl,
  // Use service token for AI -> API authentication
  accessToken: async () => {
    // In production, use a service-to-service token
    const serviceToken = process.env.AI_SERVICE_TOKEN;
    if (serviceToken) {
      return serviceToken;
    }
    // In development, can use a test token or skip auth
    return null;
  },
});

/**
 * AI Service Client - Wrapper for AI-specific operations
 * Provides convenient methods for AI tools to access API data
 */
export class AIServiceClient {
  constructor(private client: typeof orpcClient) {}

  // Board operations
  async searchBoards(query: string, filters?: any) {
    return this.client.search.query({
      query,
      type: 'board',
      useAI: true,
      filters,
    });
  }

  async getBoard(boardId: string, userId?: string) {
    return this.client.board.get({
      identifier: boardId,
      userId,
    });
  }

  async createBoard(data: {
    name: string;
    description?: string;
    visibility?: 'public' | 'private';
    emoji?: string;
    instructions?: string;
    sources?: string;
  }) {
    return this.client.board.create(data);
  }

  async updateBoard(boardId: string, data: any) {
    return this.client.board.update({
      boardId,
      ...data,
    });
  }

  async deleteBoard(boardId: string) {
    return this.client.board.delete({ boardId });
  }

  async getBoardAssets(boardId: string) {
    return this.client.board.getBoardAssets({ boardId });
  }

  // Asset operations
  async searchAssets(query: string, boardId?: string) {
    return this.client.search.query({
      query,
      type: 'asset',
      boardId,
      useAI: true,
    });
  }

  async getAsset(assetId: string) {
    return this.client.asset.get({ assetId });
  }

  async createAsset(data: {
    boardId: string;
    name: string;
    type: 'image' | 'video' | 'audio' | 'gif' | 'text';
    url: string;
    size: number;
    mimeType: string;
    metadata?: Record<string, any>;
  }) {
    return this.client.asset.create(data);
  }

  async updateAsset(assetId: string, data: any) {
    return this.client.asset.update({
      assetId,
      ...data,
    });
  }

  async deleteAsset(assetId: string) {
    return this.client.asset.delete({ assetId });
  }

  async trackAssetView(assetId: string) {
    return this.client.asset.trackView({ assetId });
  }

  async getAssetStats(assetId: string) {
    return this.client.asset.getStats({ assetId });
  }

  // User operations
  async getUser(userId?: string) {
    return this.client.user.get({ userId });
  }

  async getUserByUsername(username: string) {
    return this.client.user.getByUsername({ username });
  }

  async getUserStats(userId?: string) {
    return this.client.user.getStats({ userId });
  }

  // Collaboration operations
  async addCollaborator(boardId: string, userId: string, accessLevel: 'view' | 'edit' | 'admin' = 'view') {
    return this.client.board.addCollaborator({
      boardId,
      userId,
      accessLevel,
    });
  }

  async removeCollaborator(boardId: string, userId: string) {
    return this.client.board.removeCollaborator({
      boardId,
      userId,
    });
  }

  // Enhanced search with AI
  async enhancedSearch(params: {
    query: string;
    type?: 'board' | 'asset' | 'user' | 'all';
    filters?: any;
    limit?: number;
  }) {
    return this.client.search.query({
      ...params,
      useAI: true,
      includeSimilar: true,
    });
  }

  // Batch operations for efficiency
  async batchGetBoards(boardIds: string[]) {
    return Promise.all(
      boardIds.map(id => this.getBoard(id))
    );
  }

  async batchGetAssets(assetIds: string[]) {
    return Promise.all(
      assetIds.map(id => this.getAsset(id))
    );
  }

  // Search history operations
  async getSearchHistory(limit: number = 20) {
    return this.client.search.history({ limit });
  }

  async saveSearchHistory(query: string, expandedContext?: string, resultsSnapshot?: any) {
    return this.client.search.save({
      query,
      expandedContext,
      resultsSnapshot,
    });
  }
}

// Default client instance for AI tools to use
export const aiServiceClient = new AIServiceClient(orpcClient);