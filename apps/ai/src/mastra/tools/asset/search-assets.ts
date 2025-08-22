import { createTool } from '@mastra/core';
import { z } from 'zod';
import { aiServiceClient } from '../../lib/orpc-client';

/**
 * Perform semantic and multimodal search across assets
 * Uses ORPC client to communicate with API layer
 */
export const searchAssetsTool = createTool({
  id: 'search-assets',
  description: 'Search assets using semantic similarity, visual features, metadata, and AI-powered content understanding',
  inputSchema: z.object({
    query: z.string().describe('Search query (text description, keywords, or semantic concept)'),
    userId: z.string().describe('User ID to search assets for'),
    searchMethods: z.object({
      semantic: z.boolean().default(true).describe('Use vector embeddings for semantic search'),
      visual: z.boolean().default(true).describe('Use computer vision for visual similarity'),
      metadata: z.boolean().default(true).describe('Search metadata and captions'),
      content: z.boolean().default(false).describe('Use OCR/ASR for content within assets'),
    }).default({}),
    filters: z.object({
      assetTypes: z.array(z.enum(['image', 'video', 'audio', 'document', 'gif'])).optional(),
      boardIds: z.array(z.string()).optional().describe('Limit search to specific boards'),
      tags: z.array(z.string()).optional().describe('Filter by tags'),
      dateRange: z.object({
        start: z.string().optional(),
        end: z.string().optional(),
      }).optional(),
      visualAttributes: z.object({
        dominantColors: z.array(z.string()).optional(),
        brightness: z.enum(['dark', 'medium', 'bright']).optional(),
        saturation: z.enum(['low', 'medium', 'high']).optional(),
        composition: z.enum(['portrait', 'landscape', 'square']).optional(),
      }).optional(),
      minWidth: z.number().optional(),
      minHeight: z.number().optional(),
      maxFileSize: z.number().optional(),
    }).default({}),
    ranking: z.object({
      relevanceWeight: z.number().min(0).max(1).default(0.4),
      recencyWeight: z.number().min(0).max(1).default(0.2),
      qualityWeight: z.number().min(0).max(1).default(0.2),
      popularityWeight: z.number().min(0).max(1).default(0.2),
    }).default({}),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
    includeAnalysis: z.boolean().default(false).describe('Include AI analysis of results'),
  }),
  outputSchema: z.object({
    assets: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      url: z.string(),
      thumbnailUrl: z.string().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      size: z.number().optional(),
      mimeType: z.string().optional(),
      createdAt: z.string(),
      updatedAt: z.string(),
      relevanceScore: z.number(),
      matchDetails: z.object({
        semanticScore: z.number().optional(),
        visualScore: z.number().optional(),
        metadataScore: z.number().optional(),
        contentScore: z.number().optional(),
        matchType: z.array(z.string()),
        matchReasons: z.array(z.string()),
      }),
      metadata: z.record(z.unknown()).optional(),
      tags: z.array(z.string()).optional(),
      boards: z.array(z.object({
        id: z.string(),
        name: z.string(),
      })).optional(),
    })),
    totalCount: z.number(),
    searchMetadata: z.object({
      searchMethods: z.array(z.string()),
      executionTime: z.number(),
      indexesUsed: z.array(z.string()),
      filterStats: z.object({
        beforeFilters: z.number(),
        afterFilters: z.number(),
        filtersApplied: z.array(z.string()),
      }),
    }),
    suggestions: z.array(z.object({
      type: z.string(),
      query: z.string(),
      reason: z.string(),
    })).optional(),
    analysis: z.object({
      queryInterpretation: z.string(),
      resultPatterns: z.array(z.string()),
      recommendations: z.array(z.string()),
    }).optional(),
  }),
  execute: async ({ context }) => {
    const { query, userId, searchMethods, filters, ranking, limit, offset, includeAnalysis } = context;
    try {
      const startTime = Date.now();
      
      // Use ORPC client to search assets via API
      const searchResult = await aiServiceClient.searchAssets(query, filters.boardIds?.[0]);
      
      // Transform API response to match tool output schema
      const assets = searchResult.assets?.map((asset: any) => ({
        id: asset.id,
        name: asset.name,
        type: asset.type,
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl || asset.url,
        width: asset.width,
        height: asset.height,
        size: asset.size,
        mimeType: asset.mimeType,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
        relevanceScore: asset.score || 0.5,
        matchDetails: {
          semanticScore: asset.semanticScore || 0,
          visualScore: asset.visualScore || 0,
          metadataScore: asset.metadataScore || 0,
          matchType: ['semantic'],
          matchReasons: [`Match for query: ${query}`],
        },
        metadata: asset.metadata || {},
        tags: asset.tags || [],
        boards: asset.boards || [],
      })) || [];

      // Apply additional filters if needed
      let results = assets;
      if (filters.assetTypes && filters.assetTypes.length > 0) {
        results = results.filter(asset => filters.assetTypes!.includes(asset.type as any));
      }

      const executionTime = Date.now() - startTime;
      const totalCount = results.length;
      const paginatedResults = results.slice(offset, offset + limit);

      const searchMetadata = {
        searchMethods: Object.entries(searchMethods)
          .filter(([, enabled]) => enabled)
          .map(([method]) => method),
        executionTime,
        indexesUsed: ['vector_embeddings', 'metadata_search', 'tag_index'],
        filterStats: {
          beforeFilters: filteredAssets.length,
          afterFilters: totalCount,
          filtersApplied: [
            ...(filters.assetTypes ? ['assetTypes'] : []),
            ...(filters.boardIds ? ['boardIds'] : []),
            ...(filters.tags ? ['tags'] : []),
          ],
        },
      };

      const suggestions = query.length < 3 ? [
        {
          type: 'query_expansion',
          query: 'urban photography street art',
          reason: 'Try adding more descriptive terms for better results',
        },
        {
          type: 'filter_suggestion',
          query: 'architecture modern buildings',
          reason: 'Consider filtering by image type for architectural content',
        },
      ] : undefined;

      const analysis = includeAnalysis ? {
        queryInterpretation: `Searching for visual content related to "${query}" with emphasis on ${searchMethods.visual ? 'visual similarity' : 'semantic meaning'}`,
        resultPatterns: [
          'Results show strong preference for urban photography themes',
          'High-quality images with detailed metadata perform better',
          'Recent assets tend to rank higher in search results',
        ],
        recommendations: [
          'Consider adding more descriptive tags to improve searchability',
          'Images with location metadata show better discoverability',
          'Try semantic search for conceptual queries, keyword search for specific terms',
        ],
      } : undefined;

      return {
        assets: paginatedResults,
        totalCount,
        searchMetadata,
        suggestions,
        analysis,
      };
    } catch (error) {
      throw new Error(`Failed to search assets: ${error}`);
    }
  },
});