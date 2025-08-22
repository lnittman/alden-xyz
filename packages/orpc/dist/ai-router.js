import { os, ORPCError } from '@orpc/server';
import { z } from 'zod';
/**
 * AI-optimized ORPC router
 * Provides optimized endpoints for AI service operations
 * with batch support, caching hints, and reduced payloads
 */
// Protected procedure with auth for AI service
const aiProtectedProcedure = os
    .$context()
    .use(async ({ context, next }) => {
    // Allow service-to-service auth or user auth
    const isServiceAuth = context.headers?.get('x-service-token') === process.env.AI_SERVICE_TOKEN;
    const hasUserAuth = !!context.user?.userId;
    if (!isServiceAuth && !hasUserAuth) {
        throw new ORPCError('UNAUTHORIZED', {
            message: 'Authentication required',
        });
    }
    return next({
        context: {
            ...context,
            isAIService: isServiceAuth,
        },
    });
});
// Batch operations router
export const aiBatchRouter = os.$context().router({
    // Batch fetch boards with minimal data
    getBoards: aiProtectedProcedure
        .input(z.object({
        boardIds: z.array(z.string()).max(50),
        fields: z.array(z.enum([
            'id', 'name', 'description', 'icon', 'visibility',
            'assetCount', 'ownerId', 'createdAt', 'updatedAt'
        ])).optional(),
    }))
        .handler(async ({ input }) => {
        // Optimized batch fetch with field selection
        const boards = await Promise.all(input.boardIds.map(async (id) => {
            // In production, this would use a single batch query
            const board = await boardService.getBoardById(id);
            // Return only requested fields for efficiency
            if (input.fields) {
                return Object.fromEntries(input.fields.map(field => [field, board[field]]));
            }
            return board;
        }));
        return { boards };
    }),
    // Batch fetch assets with minimal data
    getAssets: aiProtectedProcedure
        .input(z.object({
        assetIds: z.array(z.string()).max(100),
        includeMetadata: z.boolean().default(false),
        includeThumbnails: z.boolean().default(true),
    }))
        .handler(async ({ input }) => {
        const assets = await Promise.all(input.assetIds.map(async (id) => {
            const asset = await assetService.getAssetById(id);
            // Strip heavy metadata if not needed
            if (!input.includeMetadata) {
                delete asset.metadata;
            }
            return asset;
        }));
        return { assets };
    }),
    // Batch user lookup
    getUsers: aiProtectedProcedure
        .input(z.object({
        userIds: z.array(z.string()).max(50),
        includeStats: z.boolean().default(false),
    }))
        .handler(async ({ input }) => {
        const users = await Promise.all(input.userIds.map(async (id) => {
            const user = await userService.getUserById(id);
            if (input.includeStats) {
                const stats = await userService.getUserStats(id);
                return { ...user, stats };
            }
            return user;
        }));
        return { users };
    }),
});
// Semantic search router with AI enhancements
export const aiSearchRouter = os.$context().router({
    // Enhanced semantic search
    semanticSearch: aiProtectedProcedure
        .input(z.object({
        query: z.string(),
        embeddings: z.array(z.number()).optional(),
        searchType: z.enum(['boards', 'assets', 'users', 'all']).default('all'),
        filters: z.object({
            boardIds: z.array(z.string()).optional(),
            assetTypes: z.array(z.string()).optional(),
            dateRange: z.object({
                start: z.string().optional(),
                end: z.string().optional(),
            }).optional(),
        }).optional(),
        limit: z.number().min(1).max(100).default(20),
        threshold: z.number().min(0).max(1).default(0.7),
    }))
        .handler(async ({ input }) => {
        // If embeddings provided, use them directly (saves computation)
        const queryEmbeddings = input.embeddings || await generateEmbeddings(input.query);
        // Perform vector similarity search
        const results = await vectorSearch({
            embeddings: queryEmbeddings,
            type: input.searchType,
            filters: input.filters,
            limit: input.limit,
            threshold: input.threshold,
        });
        return {
            results,
            metadata: {
                totalResults: results.length,
                searchType: input.searchType,
                threshold: input.threshold,
            },
        };
    }),
    // Find similar content
    findSimilar: aiProtectedProcedure
        .input(z.object({
        sourceId: z.string(),
        sourceType: z.enum(['board', 'asset']),
        limit: z.number().min(1).max(50).default(10),
        diversityFactor: z.number().min(0).max(1).default(0.3),
    }))
        .handler(async ({ input }) => {
        // Get source embeddings
        const sourceEmbeddings = await getEmbeddings(input.sourceId, input.sourceType);
        // Find similar items with diversity
        const similar = await findSimilarWithDiversity({
            embeddings: sourceEmbeddings,
            excludeId: input.sourceId,
            limit: input.limit,
            diversityFactor: input.diversityFactor,
        });
        return { similar };
    }),
});
// Analytics and insights router
export const aiAnalyticsRouter = os.$context().router({
    // Get aggregated insights for AI analysis
    getInsights: aiProtectedProcedure
        .input(z.object({
        entityType: z.enum(['board', 'user', 'asset']),
        entityId: z.string(),
        metrics: z.array(z.enum([
            'engagement', 'growth', 'quality', 'collaboration', 'trends'
        ])).default(['engagement', 'quality']),
        timeframe: z.enum(['1d', '7d', '30d', '90d']).default('30d'),
    }))
        .handler(async ({ input }) => {
        const insights = await analyticsService.getInsights({
            type: input.entityType,
            id: input.entityId,
            metrics: input.metrics,
            timeframe: input.timeframe,
        });
        return {
            insights,
            summary: generateInsightSummary(insights),
        };
    }),
    // Get trending content for AI recommendations
    getTrending: aiProtectedProcedure
        .input(z.object({
        category: z.enum(['boards', 'assets', 'topics']).optional(),
        timeframe: z.enum(['1h', '24h', '7d']).default('24h'),
        limit: z.number().min(1).max(50).default(20),
    }))
        .handler(async ({ input }) => {
        const trending = await analyticsService.getTrending({
            category: input.category,
            timeframe: input.timeframe,
            limit: input.limit,
        });
        return { trending };
    }),
});
// Recommendation router
export const aiRecommendationRouter = os.$context().router({
    // Get personalized recommendations
    getRecommendations: aiProtectedProcedure
        .input(z.object({
        userId: z.string(),
        recommendationType: z.enum([
            'boards', 'assets', 'collaborators', 'topics'
        ]),
        context: z.object({
            currentBoardId: z.string().optional(),
            recentInteractions: z.array(z.string()).optional(),
            preferences: z.record(z.any()).optional(),
        }).optional(),
        limit: z.number().min(1).max(50).default(10),
    }))
        .handler(async ({ input }) => {
        const recommendations = await recommendationService.getPersonalized({
            userId: input.userId,
            type: input.recommendationType,
            context: input.context,
            limit: input.limit,
        });
        return {
            recommendations,
            reasoning: generateRecommendationReasoning(recommendations),
        };
    }),
    // Get collaborative filtering suggestions
    getCollaborativeFiltering: aiProtectedProcedure
        .input(z.object({
        userId: z.string(),
        itemType: z.enum(['boards', 'assets']),
        method: z.enum(['user_based', 'item_based', 'hybrid']).default('hybrid'),
        limit: z.number().min(1).max(30).default(10),
    }))
        .handler(async ({ input }) => {
        const suggestions = await recommendationService.collaborativeFilter({
            userId: input.userId,
            itemType: input.itemType,
            method: input.method,
            limit: input.limit,
        });
        return { suggestions };
    }),
});
// Main AI router combining all sub-routers
export const aiRouter = os.$context().router({
    batch: aiBatchRouter,
    search: aiSearchRouter,
    analytics: aiAnalyticsRouter,
    recommendations: aiRecommendationRouter,
    // Health check for AI service
    health: os
        .$context()
        .handler(async () => {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
        };
    }),
});
// Helper functions (these would be implemented with actual services)
async function generateEmbeddings(text) {
    // Generate embeddings using your embedding service
    return Array(768).fill(0).map(() => Math.random());
}
async function getEmbeddings(id, type) {
    // Fetch cached embeddings from database
    return Array(768).fill(0).map(() => Math.random());
}
async function vectorSearch(params) {
    // Perform vector similarity search
    return [];
}
async function findSimilarWithDiversity(params) {
    // Find similar items with diversity factor
    return [];
}
function generateInsightSummary(insights) {
    // Generate human-readable summary of insights
    return 'Summary of insights';
}
function generateRecommendationReasoning(recommendations) {
    // Generate reasoning for recommendations
    return ['Based on your recent activity', 'Similar users also liked'];
}
// Import services (these would come from your services package)
const boardService = {};
const assetService = {};
const userService = {};
const analyticsService = {};
const recommendationService = {};
