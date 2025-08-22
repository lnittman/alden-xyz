import { os, ORPCError } from '@orpc/server';
import { z } from 'zod';
// Protected procedure with auth
const protectedProcedure = os
    .$context()
    .use(async ({ context, next }) => {
    if (!context.user?.userId) {
        throw new ORPCError('UNAUTHORIZED', {
            message: 'Authentication required',
        });
    }
    return next({
        context: context,
    });
});
// Public procedure
const publicProcedure = os.$context();
// User router
export const userRouter = os.$context().router({
    get: protectedProcedure
        .input(z.object({
        userId: z.string().optional(),
    }))
        .handler(async ({ input, context }) => {
        const targetUserId = input.userId || context.user.userId;
        const user = await context.services.userService.getUserById(targetUserId);
        // Ensure pinnedColumns is included in the response
        return {
            ...user,
            pinnedColumns: user.pinnedColumns || [],
        };
    }),
    getByUsername: publicProcedure
        .input(z.object({
        username: z.string(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.userService.getUserByUsername(input.username);
    }),
    update: protectedProcedure
        .input(z.object({
        username: z.string().optional(),
        name: z.string().optional(),
        bio: z.string().optional(),
        location: z.string().optional(),
        website: z.string().optional(),
        pfpUrl: z.string().optional(),
        pinned_columns: z.array(z.any()).optional(),
        pronouns: z.array(z.string()).optional(),
        show_pronouns: z.boolean().optional(),
        gender: z.string().optional(),
        country: z.string().optional(),
        selected_profile_stat: z.string().optional(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.userService.updateUser(context.user.userId, input);
    }),
    getStats: protectedProcedure
        .input(z.object({
        userId: z.string().optional(),
    }))
        .handler(async ({ input, context }) => {
        const targetUserId = input.userId || context.user.userId;
        return context.services.userService.getUserStats(targetUserId);
    }),
    delete: protectedProcedure
        .handler(async ({ context }) => {
        return context.services.userService.deleteUser(context.user.userId);
    }),
});
// Board router
export const boardRouter = os.$context().router({
    list: protectedProcedure
        .input(z.object({
        includeCollaborated: z.boolean().default(false),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
    }))
        .handler(async ({ input, context }) => {
        return context.services.boardService.getUserBoards({
            userId: context.user.userId,
            ...input,
        });
    }),
    get: protectedProcedure
        .input(z.object({
        identifier: z.string(),
        userId: z.string().optional(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.boardService.getBoardById(input.identifier, input.userId || context.user.userId);
    }),
    create: protectedProcedure
        .input(z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        visibility: z.enum(['public', 'private']).default('public'),
        emoji: z.string().optional(),
        instructions: z.string().optional(),
        sources: z.string().optional(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.boardService.createBoard(context.user.userId, {
            ...input,
            icon: input.emoji,
        });
    }),
    update: protectedProcedure
        .input(z.object({
        boardId: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        visibility: z.enum(['public', 'private']).optional(),
        emoji: z.string().optional(),
        instructions: z.string().optional(),
        sources: z.string().optional(),
    }))
        .handler(async ({ input, context }) => {
        const { boardId, emoji, ...data } = input;
        return context.services.boardService.updateBoard(boardId, context.user.userId, {
            ...data,
            icon: emoji,
        });
    }),
    delete: protectedProcedure
        .input(z.object({
        boardId: z.string(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.boardService.deleteBoard(input.boardId, context.user.userId);
    }),
    // Collaborator management
    addCollaborator: protectedProcedure
        .input(z.object({
        boardId: z.string(),
        userId: z.string(),
        accessLevel: z.enum(['view', 'edit', 'admin']).default('view'),
    }))
        .handler(async ({ input, context }) => {
        return context.services.boardService.addCollaborator(input.boardId, context.user.userId, {
            userId: input.userId,
            accessLevel: input.accessLevel,
        });
    }),
    removeCollaborator: protectedProcedure
        .input(z.object({
        boardId: z.string(),
        userId: z.string(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.boardService.removeCollaborator(input.boardId, context.user.userId, input.userId);
    }),
    // Board asset management
    getBoardAssets: protectedProcedure
        .input(z.object({
        boardId: z.string(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.boardService.getBoardAssets(input.boardId, context.user.userId);
    }),
    addAssetToBoard: protectedProcedure
        .input(z.object({
        boardId: z.string(),
        assetId: z.string(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.boardService.addAssetToBoard(input.boardId, context.user.userId, input.assetId);
    }),
    removeAssetFromBoard: protectedProcedure
        .input(z.object({
        boardId: z.string(),
        assetId: z.string(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.boardService.removeAssetFromBoard(input.boardId, context.user.userId, input.assetId);
    }),
});
// Asset router
export const assetRouter = os.$context().router({
    list: protectedProcedure
        .input(z.object({
        boardId: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
    }))
        .handler(async ({ input, context }) => {
        return context.services.assetService.listAssets({
            ...input,
            userId: context.user.userId,
        });
    }),
    get: protectedProcedure
        .input(z.object({
        assetId: z.string(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.assetService.getAssetById(input.assetId);
    }),
    create: protectedProcedure
        .input(z.object({
        boardId: z.string(),
        name: z.string().min(1).max(255),
        type: z.enum(['image', 'video', 'audio', 'gif', 'text']),
        url: z.string().url(),
        size: z.number().positive(),
        mimeType: z.string(),
        metadata: z.record(z.any()).optional(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.assetService.createAsset(context.user.userId, input);
    }),
    update: protectedProcedure
        .input(z.object({
        assetId: z.string(),
        name: z.string().min(1).max(255).optional(),
        metadata: z.record(z.any()).optional(),
    }))
        .handler(async ({ input, context }) => {
        const { assetId, ...data } = input;
        return context.services.assetService.updateAsset(assetId, context.user.userId, data);
    }),
    delete: protectedProcedure
        .input(z.object({
        assetId: z.string(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.assetService.deleteAsset(input.assetId, context.user.userId);
    }),
    // Asset interactions
    like: protectedProcedure
        .input(z.object({
        assetId: z.string(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.assetService.likeAsset(context.user.userId, input.assetId);
    }),
    trackView: protectedProcedure
        .input(z.object({
        assetId: z.string(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.assetService.trackAssetView(context.user.userId, input.assetId);
    }),
    trackUse: protectedProcedure
        .input(z.object({
        assetId: z.string(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.assetService.trackAssetUse(context.user.userId, input.assetId);
    }),
    getStats: protectedProcedure
        .input(z.object({
        assetId: z.string(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.assetService.getAssetStats(input.assetId);
    }),
    getUserRecentAssets: protectedProcedure
        .input(z.object({
        limit: z.number().int().min(1).max(100).default(20),
    }))
        .handler(async ({ input, context }) => {
        return context.services.assetService.getUserRecentAssets(context.user.userId, input.limit);
    }),
});
// Upload router
export const uploadRouter = os.$context().router({
    stage: protectedProcedure
        .input(z.object({
        name: z.string().min(1).max(255),
        type: z.enum(['image', 'video', 'audio', 'gif', 'text', 'file']),
        size: z.number().positive(),
        mimeType: z.string(),
        metadata: z.record(z.any()).optional(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.uploadService.stageUpload(context.user.userId, input);
    }),
    confirm: protectedProcedure
        .input(z.object({
        stageId: z.string(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.uploadService.confirmUpload(input.stageId, context.user.userId);
    }),
    cancel: protectedProcedure
        .input(z.object({
        stageId: z.string(),
    }))
        .handler(async ({ input, context }) => {
        await context.services.uploadService.cancelUpload(input.stageId, context.user.userId);
        return { success: true };
    }),
    getProgress: protectedProcedure
        .input(z.object({
        stageId: z.string().optional(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.uploadService.getUploadProgress(context.user.userId, input.stageId);
    }),
    // Direct file upload
    uploadFile: protectedProcedure
        .input(z.object({
        file: z.instanceof(File),
        boardId: z.string().optional(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.uploadService.handleFileUpload(context.user.userId, input.file, input.boardId);
    }),
});
// Search router
export const searchRouter = os.$context().router({
    query: protectedProcedure
        .input(z.object({
        query: z.string().optional(),
        type: z.enum(['board', 'asset', 'user', 'all']).default('all'),
        userId: z.string().optional(),
        boardId: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        useAI: z.boolean().default(false).optional(),
        includeSimilar: z.boolean().default(false).optional(),
        filters: z
            .object({
            assetType: z
                .array(z.enum(['image', 'video', 'audio', 'gif', 'text', 'file']))
                .optional(),
            boardVisibility: z
                .array(z.enum(['public', 'private', 'shared']))
                .optional(),
        })
            .optional(),
    }))
        .handler(async ({ input, context }) => {
        if (input.useAI) {
            return context.services.searchService.enhancedSearch({
                ...input,
                userId: context.user.userId,
            });
        }
        return context.services.searchService.search({
            ...input,
            userId: context.user.userId,
        });
    }),
    history: protectedProcedure
        .input(z.object({
        limit: z.number().int().min(1).max(100).default(20),
    }))
        .handler(async ({ input, context }) => {
        return context.services.searchService.getSearchHistory(context.user.userId, input.limit);
    }),
    save: protectedProcedure
        .input(z.object({
        query: z.string(),
        expandedContext: z.string().optional(),
        resultsSnapshot: z.any().optional(),
    }))
        .handler(async ({ input, context }) => {
        const searchId = await context.services.searchService.saveSearchHistory(context.user.userId, input.query, input.expandedContext, input.resultsSnapshot);
        return { searchId };
    }),
    check: protectedProcedure
        .input(z.object({
        searchId: z.string(),
    }))
        .handler(async ({ input, context }) => {
        return context.services.searchService.checkSearchResults(input.searchId, context.user.userId);
    }),
    // Public search (no auth required)
    public: publicProcedure
        .input(z.object({
        query: z.string(),
        type: z.enum(['board', 'user']).default('board'), // Only boards and users publicly
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
    }))
        .handler(async ({ input, context }) => {
        // Only search public content for public search
        return context.services.searchService.search({
            ...input,
            // No userId for public search
        });
    }),
});
// Import AI router
import { aiRouter } from './ai-router';
// Main app router
export const appRouter = os.$context().router({
    user: userRouter,
    board: boardRouter,
    asset: assetRouter,
    upload: uploadRouter,
    search: searchRouter,
    ai: aiRouter, // AI-optimized endpoints
});
