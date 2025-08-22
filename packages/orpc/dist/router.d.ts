import { z } from 'zod';
import type { AuthenticatedContext, Context } from './context';
export declare const userRouter: {
    get: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        userId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        userId?: string | undefined;
    }, {
        userId?: string | undefined;
    }>, import("@orpc/contract").Schema<{
        pinnedColumns: string[];
        stats: {
            boardsCreated: number;
            collaborations: number;
        };
        recentBoards: {
            id: string;
            name: string;
            visibility: string;
            description: string | null;
            instructions: string | null;
            sources: string | null;
            icon: string;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        collaborations: {
            accessLevel: string;
            joinedAt: Date;
            id: string;
            name: string;
            visibility: string;
            description: string | null;
            instructions: string | null;
            sources: string | null;
            icon: string;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        id: string;
        clerkId: string | null;
        email: string | null;
        username: string | null;
        passwordHash: string | null;
        phoneNumber: string | null;
        phoneVerified: boolean;
        pfpUrl: string | null;
        imageUrl: string | null;
        bio: string | null;
        gender: string | null;
        name: string | null;
        interests: string[] | null;
        pronouns: string | null;
        profileCompletion: number;
        selectedProfileStat: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, {
        pinnedColumns: string[];
        stats: {
            boardsCreated: number;
            collaborations: number;
        };
        recentBoards: {
            id: string;
            name: string;
            visibility: string;
            description: string | null;
            instructions: string | null;
            sources: string | null;
            icon: string;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        collaborations: {
            accessLevel: string;
            joinedAt: Date;
            id: string;
            name: string;
            visibility: string;
            description: string | null;
            instructions: string | null;
            sources: string | null;
            icon: string;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        id: string;
        clerkId: string | null;
        email: string | null;
        username: string | null;
        passwordHash: string | null;
        phoneNumber: string | null;
        phoneVerified: boolean;
        pfpUrl: string | null;
        imageUrl: string | null;
        bio: string | null;
        gender: string | null;
        name: string | null;
        interests: string[] | null;
        pronouns: string | null;
        profileCompletion: number;
        selectedProfileStat: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getByUsername: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never>, Context>, Context, z.ZodObject<{
        username: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        username: string;
    }, {
        username: string;
    }>, import("@orpc/contract").Schema<{
        id: string;
        clerkId: string | null;
        email: string | null;
        username: string | null;
        passwordHash: string | null;
        phoneNumber: string | null;
        phoneVerified: boolean;
        pfpUrl: string | null;
        imageUrl: string | null;
        bio: string | null;
        gender: string | null;
        name: string | null;
        interests: string[] | null;
        pronouns: string | null;
        profileCompletion: number;
        pinnedColumns: string[] | null;
        selectedProfileStat: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, {
        id: string;
        clerkId: string | null;
        email: string | null;
        username: string | null;
        passwordHash: string | null;
        phoneNumber: string | null;
        phoneVerified: boolean;
        pfpUrl: string | null;
        imageUrl: string | null;
        bio: string | null;
        gender: string | null;
        name: string | null;
        interests: string[] | null;
        pronouns: string | null;
        profileCompletion: number;
        pinnedColumns: string[] | null;
        selectedProfileStat: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    update: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        username: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        bio: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
        pfpUrl: z.ZodOptional<z.ZodString>;
        pinned_columns: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
        pronouns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        show_pronouns: z.ZodOptional<z.ZodBoolean>;
        gender: z.ZodOptional<z.ZodString>;
        country: z.ZodOptional<z.ZodString>;
        selected_profile_stat: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        username?: string | undefined;
        pfpUrl?: string | undefined;
        bio?: string | undefined;
        gender?: string | undefined;
        pronouns?: string[] | undefined;
        pinned_columns?: any[] | undefined;
        selected_profile_stat?: string | undefined;
        location?: string | undefined;
        website?: string | undefined;
        show_pronouns?: boolean | undefined;
        country?: string | undefined;
    }, {
        name?: string | undefined;
        username?: string | undefined;
        pfpUrl?: string | undefined;
        bio?: string | undefined;
        gender?: string | undefined;
        pronouns?: string[] | undefined;
        pinned_columns?: any[] | undefined;
        selected_profile_stat?: string | undefined;
        location?: string | undefined;
        website?: string | undefined;
        show_pronouns?: boolean | undefined;
        country?: string | undefined;
    }>, import("@orpc/contract").Schema<{
        id: string;
        clerkId: string | null;
        email: string | null;
        username: string | null;
        passwordHash: string | null;
        phoneNumber: string | null;
        phoneVerified: boolean;
        pfpUrl: string | null;
        imageUrl: string | null;
        bio: string | null;
        gender: string | null;
        name: string | null;
        interests: string[] | null;
        pronouns: string | null;
        profileCompletion: number;
        pinnedColumns: string[] | null;
        selectedProfileStat: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, {
        id: string;
        clerkId: string | null;
        email: string | null;
        username: string | null;
        passwordHash: string | null;
        phoneNumber: string | null;
        phoneVerified: boolean;
        pfpUrl: string | null;
        imageUrl: string | null;
        bio: string | null;
        gender: string | null;
        name: string | null;
        interests: string[] | null;
        pronouns: string | null;
        profileCompletion: number;
        pinnedColumns: string[] | null;
        selectedProfileStat: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getStats: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        userId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        userId?: string | undefined;
    }, {
        userId?: string | undefined;
    }>, import("@orpc/contract").Schema<{
        boardsCreated: number;
        assetsCreated: number;
        collaborations: number;
        joinedAt: Date;
    }, {
        boardsCreated: number;
        assetsCreated: number;
        collaborations: number;
        joinedAt: Date;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    delete: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
        success: boolean;
    }, {
        success: boolean;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
};
export declare const boardRouter: {
    list: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        includeCollaborated: z.ZodDefault<z.ZodBoolean>;
        limit: z.ZodDefault<z.ZodNumber>;
        offset: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        offset: number;
        includeCollaborated: boolean;
    }, {
        limit?: number | undefined;
        offset?: number | undefined;
        includeCollaborated?: boolean | undefined;
    }>, import("@orpc/contract").Schema<{
        boards: {
            creator: {
                id: string;
                username: string | null;
                name: string | null;
                pfpUrl: string | null;
            };
            assetCount: number;
            id: string;
            name: string;
            visibility: string;
            description: string | null;
            instructions: string | null;
            sources: string | null;
            icon: string;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        limit: number;
        offset: number;
    }, {
        boards: {
            creator: {
                id: string;
                username: string | null;
                name: string | null;
                pfpUrl: string | null;
            };
            assetCount: number;
            id: string;
            name: string;
            visibility: string;
            description: string | null;
            instructions: string | null;
            sources: string | null;
            icon: string;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        limit: number;
        offset: number;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    get: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        identifier: z.ZodString;
        userId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        identifier: string;
        userId?: string | undefined;
    }, {
        identifier: string;
        userId?: string | undefined;
    }>, import("@orpc/contract").Schema<{
        creator: {
            id: string;
            username: string | null;
            name: string | null;
            pfpUrl: string | null;
        };
        assetCount: number;
        collaboratorCount: number;
        id: string;
        name: string;
        visibility: string;
        description: string | null;
        instructions: string | null;
        sources: string | null;
        icon: string;
        embedding: number[] | null;
        embeddingMetadata: Record<string, any> | null;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
    }, {
        creator: {
            id: string;
            username: string | null;
            name: string | null;
            pfpUrl: string | null;
        };
        assetCount: number;
        collaboratorCount: number;
        id: string;
        name: string;
        visibility: string;
        description: string | null;
        instructions: string | null;
        sources: string | null;
        icon: string;
        embedding: number[] | null;
        embeddingMetadata: Record<string, any> | null;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    create: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        visibility: z.ZodDefault<z.ZodEnum<["public", "private"]>>;
        emoji: z.ZodOptional<z.ZodString>;
        instructions: z.ZodOptional<z.ZodString>;
        sources: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        visibility: "public" | "private";
        description?: string | undefined;
        instructions?: string | undefined;
        sources?: string | undefined;
        emoji?: string | undefined;
    }, {
        name: string;
        visibility?: "public" | "private" | undefined;
        description?: string | undefined;
        instructions?: string | undefined;
        sources?: string | undefined;
        emoji?: string | undefined;
    }>, import("@orpc/contract").Schema<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        embedding: number[] | null;
        visibility: string;
        description: string | null;
        instructions: string | null;
        sources: string | null;
        icon: string;
        embeddingMetadata: Record<string, any> | null;
        creatorId: string;
    }, {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        embedding: number[] | null;
        visibility: string;
        description: string | null;
        instructions: string | null;
        sources: string | null;
        icon: string;
        embeddingMetadata: Record<string, any> | null;
        creatorId: string;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    update: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        boardId: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        visibility: z.ZodOptional<z.ZodEnum<["public", "private"]>>;
        emoji: z.ZodOptional<z.ZodString>;
        instructions: z.ZodOptional<z.ZodString>;
        sources: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        boardId: string;
        name?: string | undefined;
        visibility?: "public" | "private" | undefined;
        description?: string | undefined;
        instructions?: string | undefined;
        sources?: string | undefined;
        emoji?: string | undefined;
    }, {
        boardId: string;
        name?: string | undefined;
        visibility?: "public" | "private" | undefined;
        description?: string | undefined;
        instructions?: string | undefined;
        sources?: string | undefined;
        emoji?: string | undefined;
    }>, import("@orpc/contract").Schema<{
        id: string;
        name: string;
        visibility: string;
        description: string | null;
        instructions: string | null;
        sources: string | null;
        icon: string;
        embedding: number[] | null;
        embeddingMetadata: Record<string, any> | null;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
    }, {
        id: string;
        name: string;
        visibility: string;
        description: string | null;
        instructions: string | null;
        sources: string | null;
        icon: string;
        embedding: number[] | null;
        embeddingMetadata: Record<string, any> | null;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    delete: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        boardId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        boardId: string;
    }, {
        boardId: string;
    }>, import("@orpc/contract").Schema<void, void>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    addCollaborator: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        boardId: z.ZodString;
        userId: z.ZodString;
        accessLevel: z.ZodDefault<z.ZodEnum<["view", "edit", "admin"]>>;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        boardId: string;
        accessLevel: "view" | "edit" | "admin";
    }, {
        userId: string;
        boardId: string;
        accessLevel?: "view" | "edit" | "admin" | undefined;
    }>, import("@orpc/contract").Schema<{
        createdAt: Date;
        userId: string;
        boardId: string;
        accessLevel: string;
    }, {
        createdAt: Date;
        userId: string;
        boardId: string;
        accessLevel: string;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    removeCollaborator: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        boardId: z.ZodString;
        userId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        boardId: string;
    }, {
        userId: string;
        boardId: string;
    }>, import("@orpc/contract").Schema<void, void>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getBoardAssets: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        boardId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        boardId: string;
    }, {
        boardId: string;
    }>, import("@orpc/contract").Schema<{
        asset: {
            id: string;
            type: string;
            name: string;
            url: string;
            thumbnailUrl: string | null;
            storageKey: string | null;
            width: number | null;
            height: number | null;
            duration: number | null;
            size: number | null;
            mimeType: string | null;
            metadata: Record<string, any> | null;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        };
        order: number | null;
        addedAt: Date;
    }[], {
        asset: {
            id: string;
            type: string;
            name: string;
            url: string;
            thumbnailUrl: string | null;
            storageKey: string | null;
            width: number | null;
            height: number | null;
            duration: number | null;
            size: number | null;
            mimeType: string | null;
            metadata: Record<string, any> | null;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        };
        order: number | null;
        addedAt: Date;
    }[]>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    addAssetToBoard: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        boardId: z.ZodString;
        assetId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        boardId: string;
        assetId: string;
    }, {
        boardId: string;
        assetId: string;
    }>, import("@orpc/contract").Schema<{
        createdAt: Date;
        boardId: string;
        assetId: string;
        order: number | null;
    }, {
        createdAt: Date;
        boardId: string;
        assetId: string;
        order: number | null;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    removeAssetFromBoard: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        boardId: z.ZodString;
        assetId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        boardId: string;
        assetId: string;
    }, {
        boardId: string;
        assetId: string;
    }>, import("@orpc/contract").Schema<void, void>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
};
export declare const assetRouter: {
    list: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        boardId: z.ZodOptional<z.ZodString>;
        limit: z.ZodDefault<z.ZodNumber>;
        offset: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        offset: number;
        boardId?: string | undefined;
    }, {
        boardId?: string | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
    }>, import("@orpc/contract").Schema<{
        creator: {
            id: string;
            username: string | null;
            name: string | null;
            pfpUrl: string | null;
        };
        boardCount: number;
        id: string;
        type: string;
        name: string;
        url: string;
        thumbnailUrl: string | null;
        storageKey: string | null;
        width: number | null;
        height: number | null;
        duration: number | null;
        size: number | null;
        mimeType: string | null;
        metadata: Record<string, any> | null;
        embedding: number[] | null;
        embeddingMetadata: Record<string, any> | null;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
    }[], {
        creator: {
            id: string;
            username: string | null;
            name: string | null;
            pfpUrl: string | null;
        };
        boardCount: number;
        id: string;
        type: string;
        name: string;
        url: string;
        thumbnailUrl: string | null;
        storageKey: string | null;
        width: number | null;
        height: number | null;
        duration: number | null;
        size: number | null;
        mimeType: string | null;
        metadata: Record<string, any> | null;
        embedding: number[] | null;
        embeddingMetadata: Record<string, any> | null;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    get: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        assetId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        assetId: string;
    }, {
        assetId: string;
    }>, import("@orpc/contract").Schema<{
        creator: {
            id: string;
            username: string | null;
            name: string | null;
            pfpUrl: string | null;
        };
        id: string;
        type: string;
        name: string;
        url: string;
        thumbnailUrl: string | null;
        storageKey: string | null;
        width: number | null;
        height: number | null;
        duration: number | null;
        size: number | null;
        mimeType: string | null;
        metadata: Record<string, any> | null;
        embedding: number[] | null;
        embeddingMetadata: Record<string, any> | null;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
    }, {
        creator: {
            id: string;
            username: string | null;
            name: string | null;
            pfpUrl: string | null;
        };
        id: string;
        type: string;
        name: string;
        url: string;
        thumbnailUrl: string | null;
        storageKey: string | null;
        width: number | null;
        height: number | null;
        duration: number | null;
        size: number | null;
        mimeType: string | null;
        metadata: Record<string, any> | null;
        embedding: number[] | null;
        embeddingMetadata: Record<string, any> | null;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    create: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        boardId: z.ZodString;
        name: z.ZodString;
        type: z.ZodEnum<["image", "video", "audio", "gif", "text"]>;
        url: z.ZodString;
        size: z.ZodNumber;
        mimeType: z.ZodString;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        type: "text" | "image" | "video" | "audio" | "gif";
        url: string;
        size: number;
        mimeType: string;
        boardId: string;
        metadata?: Record<string, any> | undefined;
    }, {
        name: string;
        type: "text" | "image" | "video" | "audio" | "gif";
        url: string;
        size: number;
        mimeType: string;
        boardId: string;
        metadata?: Record<string, any> | undefined;
    }>, import("@orpc/contract").Schema<{
        duration: number | null;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        metadata: Record<string, any> | null;
        embedding: number[] | null;
        embeddingMetadata: Record<string, any> | null;
        creatorId: string;
        url: string;
        thumbnailUrl: string | null;
        storageKey: string | null;
        width: number | null;
        height: number | null;
        size: number | null;
        mimeType: string | null;
    }, {
        duration: number | null;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        metadata: Record<string, any> | null;
        embedding: number[] | null;
        embeddingMetadata: Record<string, any> | null;
        creatorId: string;
        url: string;
        thumbnailUrl: string | null;
        storageKey: string | null;
        width: number | null;
        height: number | null;
        size: number | null;
        mimeType: string | null;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    update: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        assetId: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        assetId: string;
        name?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }, {
        assetId: string;
        name?: string | undefined;
        metadata?: Record<string, any> | undefined;
    }>, import("@orpc/contract").Schema<{
        id: string;
        type: string;
        name: string;
        url: string;
        thumbnailUrl: string | null;
        storageKey: string | null;
        width: number | null;
        height: number | null;
        duration: number | null;
        size: number | null;
        mimeType: string | null;
        metadata: Record<string, any> | null;
        embedding: number[] | null;
        embeddingMetadata: Record<string, any> | null;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
    }, {
        id: string;
        type: string;
        name: string;
        url: string;
        thumbnailUrl: string | null;
        storageKey: string | null;
        width: number | null;
        height: number | null;
        duration: number | null;
        size: number | null;
        mimeType: string | null;
        metadata: Record<string, any> | null;
        embedding: number[] | null;
        embeddingMetadata: Record<string, any> | null;
        creatorId: string;
        createdAt: Date;
        updatedAt: Date;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    delete: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        assetId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        assetId: string;
    }, {
        assetId: string;
    }>, import("@orpc/contract").Schema<void, void>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    like: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        assetId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        assetId: string;
    }, {
        assetId: string;
    }>, import("@orpc/contract").Schema<{
        liked: boolean;
    }, {
        liked: boolean;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    trackView: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        assetId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        assetId: string;
    }, {
        assetId: string;
    }>, import("@orpc/contract").Schema<void, void>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    trackUse: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        assetId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        assetId: string;
    }, {
        assetId: string;
    }>, import("@orpc/contract").Schema<void, void>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getStats: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        assetId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        assetId: string;
    }, {
        assetId: string;
    }>, import("@orpc/contract").Schema<{
        likes: number;
        totalViews: number;
        uniqueViews: number;
        boardsUsing: number;
    }, {
        likes: number;
        totalViews: number;
        uniqueViews: number;
        boardsUsing: number;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getUserRecentAssets: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        limit: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
    }, {
        limit?: number | undefined;
    }>, import("@orpc/contract").Schema<{
        asset: {
            id: string;
            type: string;
            name: string;
            url: string;
            thumbnailUrl: string | null;
            storageKey: string | null;
            width: number | null;
            height: number | null;
            duration: number | null;
            size: number | null;
            mimeType: string | null;
            metadata: Record<string, any> | null;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        };
        usedAt: Date;
    }[], {
        asset: {
            id: string;
            type: string;
            name: string;
            url: string;
            thumbnailUrl: string | null;
            storageKey: string | null;
            width: number | null;
            height: number | null;
            duration: number | null;
            size: number | null;
            mimeType: string | null;
            metadata: Record<string, any> | null;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        };
        usedAt: Date;
    }[]>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
};
export declare const uploadRouter: {
    stage: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["image", "video", "audio", "gif", "text", "file"]>;
        size: z.ZodNumber;
        mimeType: z.ZodString;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        type: "text" | "image" | "video" | "audio" | "gif" | "file";
        size: number;
        mimeType: string;
        metadata?: Record<string, any> | undefined;
    }, {
        name: string;
        type: "text" | "image" | "video" | "audio" | "gif" | "file";
        size: number;
        mimeType: string;
        metadata?: Record<string, any> | undefined;
    }>, import("@orpc/contract").Schema<import("@squish-xyz/services").StagedUpload, import("@squish-xyz/services").StagedUpload>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    confirm: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        stageId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        stageId: string;
    }, {
        stageId: string;
    }>, import("@orpc/contract").Schema<{
        key: string;
        url: string;
        thumbnailUrl?: string;
    }, {
        key: string;
        url: string;
        thumbnailUrl?: string;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    cancel: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        stageId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        stageId: string;
    }, {
        stageId: string;
    }>, import("@orpc/contract").Schema<{
        success: boolean;
    }, {
        success: boolean;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getProgress: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        stageId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        stageId?: string | undefined;
    }, {
        stageId?: string | undefined;
    }>, import("@orpc/contract").Schema<import("@squish-xyz/services").StagedUpload[], import("@squish-xyz/services").StagedUpload[]>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    uploadFile: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        file: z.ZodType<File, z.ZodTypeDef, File>;
        boardId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        file: File;
        boardId?: string | undefined;
    }, {
        file: File;
        boardId?: string | undefined;
    }>, import("@orpc/contract").Schema<{
        id: string;
        type: "image" | "video" | "audio" | "gif" | "text" | "file";
        name: string;
        url: string;
        thumbnailUrl?: string;
        metadata: Record<string, any>;
    }, {
        id: string;
        type: "image" | "video" | "audio" | "gif" | "text" | "file";
        name: string;
        url: string;
        thumbnailUrl?: string;
        metadata: Record<string, any>;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
};
export declare const searchRouter: {
    query: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        query: z.ZodOptional<z.ZodString>;
        type: z.ZodDefault<z.ZodEnum<["board", "asset", "user", "all"]>>;
        userId: z.ZodOptional<z.ZodString>;
        boardId: z.ZodOptional<z.ZodString>;
        limit: z.ZodDefault<z.ZodNumber>;
        offset: z.ZodDefault<z.ZodNumber>;
        useAI: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        includeSimilar: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
        filters: z.ZodOptional<z.ZodObject<{
            assetType: z.ZodOptional<z.ZodArray<z.ZodEnum<["image", "video", "audio", "gif", "text", "file"]>, "many">>;
            boardVisibility: z.ZodOptional<z.ZodArray<z.ZodEnum<["public", "private", "shared"]>, "many">>;
        }, "strip", z.ZodTypeAny, {
            assetType?: ("text" | "image" | "video" | "audio" | "gif" | "file")[] | undefined;
            boardVisibility?: ("public" | "private" | "shared")[] | undefined;
        }, {
            assetType?: ("text" | "image" | "video" | "audio" | "gif" | "file")[] | undefined;
            boardVisibility?: ("public" | "private" | "shared")[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        type: "user" | "board" | "asset" | "all";
        limit: number;
        offset: number;
        userId?: string | undefined;
        query?: string | undefined;
        boardId?: string | undefined;
        useAI?: boolean | undefined;
        includeSimilar?: boolean | undefined;
        filters?: {
            assetType?: ("text" | "image" | "video" | "audio" | "gif" | "file")[] | undefined;
            boardVisibility?: ("public" | "private" | "shared")[] | undefined;
        } | undefined;
    }, {
        type?: "user" | "board" | "asset" | "all" | undefined;
        userId?: string | undefined;
        query?: string | undefined;
        boardId?: string | undefined;
        useAI?: boolean | undefined;
        includeSimilar?: boolean | undefined;
        filters?: {
            assetType?: ("text" | "image" | "video" | "audio" | "gif" | "file")[] | undefined;
            boardVisibility?: ("public" | "private" | "shared")[] | undefined;
        } | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
    }>, import("@orpc/contract").Schema<{
        results: import("@squish-xyz/services").SearchResult[];
        total: number;
        query: string;
        filters: Record<string, any>;
    } | {
        results: import("@squish-xyz/services").SearchResult[];
        total: number;
        query: string;
        expanded: string[];
        aiInsights?: {
            relevantTopics: string[];
            searchIntent: string;
            suggestedFilters: string[];
        };
    }, {
        results: import("@squish-xyz/services").SearchResult[];
        total: number;
        query: string;
        filters: Record<string, any>;
    } | {
        results: import("@squish-xyz/services").SearchResult[];
        total: number;
        query: string;
        expanded: string[];
        aiInsights?: {
            relevantTopics: string[];
            searchIntent: string;
            suggestedFilters: string[];
        };
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    history: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        limit: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
    }, {
        limit?: number | undefined;
    }>, import("@orpc/contract").Schema<any[], any[]>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    save: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        query: z.ZodString;
        expandedContext: z.ZodOptional<z.ZodString>;
        resultsSnapshot: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        query: string;
        expandedContext?: string | undefined;
        resultsSnapshot?: any;
    }, {
        query: string;
        expandedContext?: string | undefined;
        resultsSnapshot?: any;
    }>, import("@orpc/contract").Schema<{
        searchId: string;
    }, {
        searchId: string;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    check: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
        searchId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        searchId: string;
    }, {
        searchId: string;
    }>, import("@orpc/contract").Schema<{
        hasNewResults: boolean;
        newResultsCount: number;
        results: import("@squish-xyz/services").SearchResult[];
    }, {
        hasNewResults: boolean;
        newResultsCount: number;
        results: import("@squish-xyz/services").SearchResult[];
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    public: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never>, Context>, Context, z.ZodObject<{
        query: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<["board", "user"]>>;
        limit: z.ZodDefault<z.ZodNumber>;
        offset: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type: "user" | "board";
        query: string;
        limit: number;
        offset: number;
    }, {
        query: string;
        type?: "user" | "board" | undefined;
        limit?: number | undefined;
        offset?: number | undefined;
    }>, import("@orpc/contract").Schema<{
        results: import("@squish-xyz/services").SearchResult[];
        total: number;
        query: string;
        filters: Record<string, any>;
    }, {
        results: import("@squish-xyz/services").SearchResult[];
        total: number;
        query: string;
        filters: Record<string, any>;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
};
export declare const appRouter: {
    user: {
        get: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            userId: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            userId?: string | undefined;
        }, {
            userId?: string | undefined;
        }>, import("@orpc/contract").Schema<{
            pinnedColumns: string[];
            stats: {
                boardsCreated: number;
                collaborations: number;
            };
            recentBoards: {
                id: string;
                name: string;
                visibility: string;
                description: string | null;
                instructions: string | null;
                sources: string | null;
                icon: string;
                embedding: number[] | null;
                embeddingMetadata: Record<string, any> | null;
                creatorId: string;
                createdAt: Date;
                updatedAt: Date;
            }[];
            collaborations: {
                accessLevel: string;
                joinedAt: Date;
                id: string;
                name: string;
                visibility: string;
                description: string | null;
                instructions: string | null;
                sources: string | null;
                icon: string;
                embedding: number[] | null;
                embeddingMetadata: Record<string, any> | null;
                creatorId: string;
                createdAt: Date;
                updatedAt: Date;
            }[];
            id: string;
            clerkId: string | null;
            email: string | null;
            username: string | null;
            passwordHash: string | null;
            phoneNumber: string | null;
            phoneVerified: boolean;
            pfpUrl: string | null;
            imageUrl: string | null;
            bio: string | null;
            gender: string | null;
            name: string | null;
            interests: string[] | null;
            pronouns: string | null;
            profileCompletion: number;
            selectedProfileStat: string | null;
            createdAt: Date;
            updatedAt: Date;
        }, {
            pinnedColumns: string[];
            stats: {
                boardsCreated: number;
                collaborations: number;
            };
            recentBoards: {
                id: string;
                name: string;
                visibility: string;
                description: string | null;
                instructions: string | null;
                sources: string | null;
                icon: string;
                embedding: number[] | null;
                embeddingMetadata: Record<string, any> | null;
                creatorId: string;
                createdAt: Date;
                updatedAt: Date;
            }[];
            collaborations: {
                accessLevel: string;
                joinedAt: Date;
                id: string;
                name: string;
                visibility: string;
                description: string | null;
                instructions: string | null;
                sources: string | null;
                icon: string;
                embedding: number[] | null;
                embeddingMetadata: Record<string, any> | null;
                creatorId: string;
                createdAt: Date;
                updatedAt: Date;
            }[];
            id: string;
            clerkId: string | null;
            email: string | null;
            username: string | null;
            passwordHash: string | null;
            phoneNumber: string | null;
            phoneVerified: boolean;
            pfpUrl: string | null;
            imageUrl: string | null;
            bio: string | null;
            gender: string | null;
            name: string | null;
            interests: string[] | null;
            pronouns: string | null;
            profileCompletion: number;
            selectedProfileStat: string | null;
            createdAt: Date;
            updatedAt: Date;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getByUsername: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never>, keyof Context>, Context>, Context, z.ZodObject<{
            username: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            username: string;
        }, {
            username: string;
        }>, import("@orpc/contract").Schema<{
            id: string;
            clerkId: string | null;
            email: string | null;
            username: string | null;
            passwordHash: string | null;
            phoneNumber: string | null;
            phoneVerified: boolean;
            pfpUrl: string | null;
            imageUrl: string | null;
            bio: string | null;
            gender: string | null;
            name: string | null;
            interests: string[] | null;
            pronouns: string | null;
            profileCompletion: number;
            pinnedColumns: string[] | null;
            selectedProfileStat: string | null;
            createdAt: Date;
            updatedAt: Date;
        }, {
            id: string;
            clerkId: string | null;
            email: string | null;
            username: string | null;
            passwordHash: string | null;
            phoneNumber: string | null;
            phoneVerified: boolean;
            pfpUrl: string | null;
            imageUrl: string | null;
            bio: string | null;
            gender: string | null;
            name: string | null;
            interests: string[] | null;
            pronouns: string | null;
            profileCompletion: number;
            pinnedColumns: string[] | null;
            selectedProfileStat: string | null;
            createdAt: Date;
            updatedAt: Date;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        update: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            username: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            bio: z.ZodOptional<z.ZodString>;
            location: z.ZodOptional<z.ZodString>;
            website: z.ZodOptional<z.ZodString>;
            pfpUrl: z.ZodOptional<z.ZodString>;
            pinned_columns: z.ZodOptional<z.ZodArray<z.ZodAny, "many">>;
            pronouns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            show_pronouns: z.ZodOptional<z.ZodBoolean>;
            gender: z.ZodOptional<z.ZodString>;
            country: z.ZodOptional<z.ZodString>;
            selected_profile_stat: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name?: string | undefined;
            username?: string | undefined;
            pfpUrl?: string | undefined;
            bio?: string | undefined;
            gender?: string | undefined;
            pronouns?: string[] | undefined;
            pinned_columns?: any[] | undefined;
            selected_profile_stat?: string | undefined;
            location?: string | undefined;
            website?: string | undefined;
            show_pronouns?: boolean | undefined;
            country?: string | undefined;
        }, {
            name?: string | undefined;
            username?: string | undefined;
            pfpUrl?: string | undefined;
            bio?: string | undefined;
            gender?: string | undefined;
            pronouns?: string[] | undefined;
            pinned_columns?: any[] | undefined;
            selected_profile_stat?: string | undefined;
            location?: string | undefined;
            website?: string | undefined;
            show_pronouns?: boolean | undefined;
            country?: string | undefined;
        }>, import("@orpc/contract").Schema<{
            id: string;
            clerkId: string | null;
            email: string | null;
            username: string | null;
            passwordHash: string | null;
            phoneNumber: string | null;
            phoneVerified: boolean;
            pfpUrl: string | null;
            imageUrl: string | null;
            bio: string | null;
            gender: string | null;
            name: string | null;
            interests: string[] | null;
            pronouns: string | null;
            profileCompletion: number;
            pinnedColumns: string[] | null;
            selectedProfileStat: string | null;
            createdAt: Date;
            updatedAt: Date;
        }, {
            id: string;
            clerkId: string | null;
            email: string | null;
            username: string | null;
            passwordHash: string | null;
            phoneNumber: string | null;
            phoneVerified: boolean;
            pfpUrl: string | null;
            imageUrl: string | null;
            bio: string | null;
            gender: string | null;
            name: string | null;
            interests: string[] | null;
            pronouns: string | null;
            profileCompletion: number;
            pinnedColumns: string[] | null;
            selectedProfileStat: string | null;
            createdAt: Date;
            updatedAt: Date;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getStats: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            userId: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            userId?: string | undefined;
        }, {
            userId?: string | undefined;
        }>, import("@orpc/contract").Schema<{
            boardsCreated: number;
            assetsCreated: number;
            collaborations: number;
            joinedAt: Date;
        }, {
            boardsCreated: number;
            assetsCreated: number;
            collaborations: number;
            joinedAt: Date;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        delete: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            success: boolean;
        }, {
            success: boolean;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
    };
    board: {
        list: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            includeCollaborated: z.ZodDefault<z.ZodBoolean>;
            limit: z.ZodDefault<z.ZodNumber>;
            offset: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            offset: number;
            includeCollaborated: boolean;
        }, {
            limit?: number | undefined;
            offset?: number | undefined;
            includeCollaborated?: boolean | undefined;
        }>, import("@orpc/contract").Schema<{
            boards: {
                creator: {
                    id: string;
                    username: string | null;
                    name: string | null;
                    pfpUrl: string | null;
                };
                assetCount: number;
                id: string;
                name: string;
                visibility: string;
                description: string | null;
                instructions: string | null;
                sources: string | null;
                icon: string;
                embedding: number[] | null;
                embeddingMetadata: Record<string, any> | null;
                creatorId: string;
                createdAt: Date;
                updatedAt: Date;
            }[];
            limit: number;
            offset: number;
        }, {
            boards: {
                creator: {
                    id: string;
                    username: string | null;
                    name: string | null;
                    pfpUrl: string | null;
                };
                assetCount: number;
                id: string;
                name: string;
                visibility: string;
                description: string | null;
                instructions: string | null;
                sources: string | null;
                icon: string;
                embedding: number[] | null;
                embeddingMetadata: Record<string, any> | null;
                creatorId: string;
                createdAt: Date;
                updatedAt: Date;
            }[];
            limit: number;
            offset: number;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        get: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            identifier: z.ZodString;
            userId: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            identifier: string;
            userId?: string | undefined;
        }, {
            identifier: string;
            userId?: string | undefined;
        }>, import("@orpc/contract").Schema<{
            creator: {
                id: string;
                username: string | null;
                name: string | null;
                pfpUrl: string | null;
            };
            assetCount: number;
            collaboratorCount: number;
            id: string;
            name: string;
            visibility: string;
            description: string | null;
            instructions: string | null;
            sources: string | null;
            icon: string;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        }, {
            creator: {
                id: string;
                username: string | null;
                name: string | null;
                pfpUrl: string | null;
            };
            assetCount: number;
            collaboratorCount: number;
            id: string;
            name: string;
            visibility: string;
            description: string | null;
            instructions: string | null;
            sources: string | null;
            icon: string;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        create: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            visibility: z.ZodDefault<z.ZodEnum<["public", "private"]>>;
            emoji: z.ZodOptional<z.ZodString>;
            instructions: z.ZodOptional<z.ZodString>;
            sources: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            visibility: "public" | "private";
            description?: string | undefined;
            instructions?: string | undefined;
            sources?: string | undefined;
            emoji?: string | undefined;
        }, {
            name: string;
            visibility?: "public" | "private" | undefined;
            description?: string | undefined;
            instructions?: string | undefined;
            sources?: string | undefined;
            emoji?: string | undefined;
        }>, import("@orpc/contract").Schema<{
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            embedding: number[] | null;
            visibility: string;
            description: string | null;
            instructions: string | null;
            sources: string | null;
            icon: string;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
        }, {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            embedding: number[] | null;
            visibility: string;
            description: string | null;
            instructions: string | null;
            sources: string | null;
            icon: string;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        update: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            boardId: z.ZodString;
            name: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            visibility: z.ZodOptional<z.ZodEnum<["public", "private"]>>;
            emoji: z.ZodOptional<z.ZodString>;
            instructions: z.ZodOptional<z.ZodString>;
            sources: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            boardId: string;
            name?: string | undefined;
            visibility?: "public" | "private" | undefined;
            description?: string | undefined;
            instructions?: string | undefined;
            sources?: string | undefined;
            emoji?: string | undefined;
        }, {
            boardId: string;
            name?: string | undefined;
            visibility?: "public" | "private" | undefined;
            description?: string | undefined;
            instructions?: string | undefined;
            sources?: string | undefined;
            emoji?: string | undefined;
        }>, import("@orpc/contract").Schema<{
            id: string;
            name: string;
            visibility: string;
            description: string | null;
            instructions: string | null;
            sources: string | null;
            icon: string;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        }, {
            id: string;
            name: string;
            visibility: string;
            description: string | null;
            instructions: string | null;
            sources: string | null;
            icon: string;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        delete: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            boardId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            boardId: string;
        }, {
            boardId: string;
        }>, import("@orpc/contract").Schema<void, void>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        addCollaborator: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            boardId: z.ZodString;
            userId: z.ZodString;
            accessLevel: z.ZodDefault<z.ZodEnum<["view", "edit", "admin"]>>;
        }, "strip", z.ZodTypeAny, {
            userId: string;
            boardId: string;
            accessLevel: "view" | "edit" | "admin";
        }, {
            userId: string;
            boardId: string;
            accessLevel?: "view" | "edit" | "admin" | undefined;
        }>, import("@orpc/contract").Schema<{
            createdAt: Date;
            userId: string;
            boardId: string;
            accessLevel: string;
        }, {
            createdAt: Date;
            userId: string;
            boardId: string;
            accessLevel: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        removeCollaborator: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            boardId: z.ZodString;
            userId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            userId: string;
            boardId: string;
        }, {
            userId: string;
            boardId: string;
        }>, import("@orpc/contract").Schema<void, void>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getBoardAssets: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            boardId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            boardId: string;
        }, {
            boardId: string;
        }>, import("@orpc/contract").Schema<{
            asset: {
                id: string;
                type: string;
                name: string;
                url: string;
                thumbnailUrl: string | null;
                storageKey: string | null;
                width: number | null;
                height: number | null;
                duration: number | null;
                size: number | null;
                mimeType: string | null;
                metadata: Record<string, any> | null;
                embedding: number[] | null;
                embeddingMetadata: Record<string, any> | null;
                creatorId: string;
                createdAt: Date;
                updatedAt: Date;
            };
            order: number | null;
            addedAt: Date;
        }[], {
            asset: {
                id: string;
                type: string;
                name: string;
                url: string;
                thumbnailUrl: string | null;
                storageKey: string | null;
                width: number | null;
                height: number | null;
                duration: number | null;
                size: number | null;
                mimeType: string | null;
                metadata: Record<string, any> | null;
                embedding: number[] | null;
                embeddingMetadata: Record<string, any> | null;
                creatorId: string;
                createdAt: Date;
                updatedAt: Date;
            };
            order: number | null;
            addedAt: Date;
        }[]>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        addAssetToBoard: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            boardId: z.ZodString;
            assetId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            boardId: string;
            assetId: string;
        }, {
            boardId: string;
            assetId: string;
        }>, import("@orpc/contract").Schema<{
            createdAt: Date;
            boardId: string;
            assetId: string;
            order: number | null;
        }, {
            createdAt: Date;
            boardId: string;
            assetId: string;
            order: number | null;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        removeAssetFromBoard: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            boardId: z.ZodString;
            assetId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            boardId: string;
            assetId: string;
        }, {
            boardId: string;
            assetId: string;
        }>, import("@orpc/contract").Schema<void, void>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
    };
    asset: {
        list: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            boardId: z.ZodOptional<z.ZodString>;
            limit: z.ZodDefault<z.ZodNumber>;
            offset: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            offset: number;
            boardId?: string | undefined;
        }, {
            boardId?: string | undefined;
            limit?: number | undefined;
            offset?: number | undefined;
        }>, import("@orpc/contract").Schema<{
            creator: {
                id: string;
                username: string | null;
                name: string | null;
                pfpUrl: string | null;
            };
            boardCount: number;
            id: string;
            type: string;
            name: string;
            url: string;
            thumbnailUrl: string | null;
            storageKey: string | null;
            width: number | null;
            height: number | null;
            duration: number | null;
            size: number | null;
            mimeType: string | null;
            metadata: Record<string, any> | null;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        }[], {
            creator: {
                id: string;
                username: string | null;
                name: string | null;
                pfpUrl: string | null;
            };
            boardCount: number;
            id: string;
            type: string;
            name: string;
            url: string;
            thumbnailUrl: string | null;
            storageKey: string | null;
            width: number | null;
            height: number | null;
            duration: number | null;
            size: number | null;
            mimeType: string | null;
            metadata: Record<string, any> | null;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        }[]>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        get: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            assetId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            assetId: string;
        }, {
            assetId: string;
        }>, import("@orpc/contract").Schema<{
            creator: {
                id: string;
                username: string | null;
                name: string | null;
                pfpUrl: string | null;
            };
            id: string;
            type: string;
            name: string;
            url: string;
            thumbnailUrl: string | null;
            storageKey: string | null;
            width: number | null;
            height: number | null;
            duration: number | null;
            size: number | null;
            mimeType: string | null;
            metadata: Record<string, any> | null;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        }, {
            creator: {
                id: string;
                username: string | null;
                name: string | null;
                pfpUrl: string | null;
            };
            id: string;
            type: string;
            name: string;
            url: string;
            thumbnailUrl: string | null;
            storageKey: string | null;
            width: number | null;
            height: number | null;
            duration: number | null;
            size: number | null;
            mimeType: string | null;
            metadata: Record<string, any> | null;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        create: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            boardId: z.ZodString;
            name: z.ZodString;
            type: z.ZodEnum<["image", "video", "audio", "gif", "text"]>;
            url: z.ZodString;
            size: z.ZodNumber;
            mimeType: z.ZodString;
            metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            type: "text" | "image" | "video" | "audio" | "gif";
            url: string;
            size: number;
            mimeType: string;
            boardId: string;
            metadata?: Record<string, any> | undefined;
        }, {
            name: string;
            type: "text" | "image" | "video" | "audio" | "gif";
            url: string;
            size: number;
            mimeType: string;
            boardId: string;
            metadata?: Record<string, any> | undefined;
        }>, import("@orpc/contract").Schema<{
            duration: number | null;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            metadata: Record<string, any> | null;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            url: string;
            thumbnailUrl: string | null;
            storageKey: string | null;
            width: number | null;
            height: number | null;
            size: number | null;
            mimeType: string | null;
        }, {
            duration: number | null;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            type: string;
            metadata: Record<string, any> | null;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            url: string;
            thumbnailUrl: string | null;
            storageKey: string | null;
            width: number | null;
            height: number | null;
            size: number | null;
            mimeType: string | null;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        update: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            assetId: z.ZodString;
            name: z.ZodOptional<z.ZodString>;
            metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            assetId: string;
            name?: string | undefined;
            metadata?: Record<string, any> | undefined;
        }, {
            assetId: string;
            name?: string | undefined;
            metadata?: Record<string, any> | undefined;
        }>, import("@orpc/contract").Schema<{
            id: string;
            type: string;
            name: string;
            url: string;
            thumbnailUrl: string | null;
            storageKey: string | null;
            width: number | null;
            height: number | null;
            duration: number | null;
            size: number | null;
            mimeType: string | null;
            metadata: Record<string, any> | null;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        }, {
            id: string;
            type: string;
            name: string;
            url: string;
            thumbnailUrl: string | null;
            storageKey: string | null;
            width: number | null;
            height: number | null;
            duration: number | null;
            size: number | null;
            mimeType: string | null;
            metadata: Record<string, any> | null;
            embedding: number[] | null;
            embeddingMetadata: Record<string, any> | null;
            creatorId: string;
            createdAt: Date;
            updatedAt: Date;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        delete: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            assetId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            assetId: string;
        }, {
            assetId: string;
        }>, import("@orpc/contract").Schema<void, void>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        like: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            assetId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            assetId: string;
        }, {
            assetId: string;
        }>, import("@orpc/contract").Schema<{
            liked: boolean;
        }, {
            liked: boolean;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        trackView: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            assetId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            assetId: string;
        }, {
            assetId: string;
        }>, import("@orpc/contract").Schema<void, void>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        trackUse: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            assetId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            assetId: string;
        }, {
            assetId: string;
        }>, import("@orpc/contract").Schema<void, void>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getStats: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            assetId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            assetId: string;
        }, {
            assetId: string;
        }>, import("@orpc/contract").Schema<{
            likes: number;
            totalViews: number;
            uniqueViews: number;
            boardsUsing: number;
        }, {
            likes: number;
            totalViews: number;
            uniqueViews: number;
            boardsUsing: number;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getUserRecentAssets: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            limit: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
        }, {
            limit?: number | undefined;
        }>, import("@orpc/contract").Schema<{
            asset: {
                id: string;
                type: string;
                name: string;
                url: string;
                thumbnailUrl: string | null;
                storageKey: string | null;
                width: number | null;
                height: number | null;
                duration: number | null;
                size: number | null;
                mimeType: string | null;
                metadata: Record<string, any> | null;
                embedding: number[] | null;
                embeddingMetadata: Record<string, any> | null;
                creatorId: string;
                createdAt: Date;
                updatedAt: Date;
            };
            usedAt: Date;
        }[], {
            asset: {
                id: string;
                type: string;
                name: string;
                url: string;
                thumbnailUrl: string | null;
                storageKey: string | null;
                width: number | null;
                height: number | null;
                duration: number | null;
                size: number | null;
                mimeType: string | null;
                metadata: Record<string, any> | null;
                embedding: number[] | null;
                embeddingMetadata: Record<string, any> | null;
                creatorId: string;
                createdAt: Date;
                updatedAt: Date;
            };
            usedAt: Date;
        }[]>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
    };
    upload: {
        stage: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            name: z.ZodString;
            type: z.ZodEnum<["image", "video", "audio", "gif", "text", "file"]>;
            size: z.ZodNumber;
            mimeType: z.ZodString;
            metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            type: "text" | "image" | "video" | "audio" | "gif" | "file";
            size: number;
            mimeType: string;
            metadata?: Record<string, any> | undefined;
        }, {
            name: string;
            type: "text" | "image" | "video" | "audio" | "gif" | "file";
            size: number;
            mimeType: string;
            metadata?: Record<string, any> | undefined;
        }>, import("@orpc/contract").Schema<import("@squish-xyz/services").StagedUpload, import("@squish-xyz/services").StagedUpload>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        confirm: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            stageId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            stageId: string;
        }, {
            stageId: string;
        }>, import("@orpc/contract").Schema<{
            key: string;
            url: string;
            thumbnailUrl?: string;
        }, {
            key: string;
            url: string;
            thumbnailUrl?: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        cancel: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            stageId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            stageId: string;
        }, {
            stageId: string;
        }>, import("@orpc/contract").Schema<{
            success: boolean;
        }, {
            success: boolean;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getProgress: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            stageId: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            stageId?: string | undefined;
        }, {
            stageId?: string | undefined;
        }>, import("@orpc/contract").Schema<import("@squish-xyz/services").StagedUpload[], import("@squish-xyz/services").StagedUpload[]>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        uploadFile: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            file: z.ZodType<File, z.ZodTypeDef, File>;
            boardId: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            file: File;
            boardId?: string | undefined;
        }, {
            file: File;
            boardId?: string | undefined;
        }>, import("@orpc/contract").Schema<{
            id: string;
            type: "image" | "video" | "audio" | "gif" | "text" | "file";
            name: string;
            url: string;
            thumbnailUrl?: string;
            metadata: Record<string, any>;
        }, {
            id: string;
            type: "image" | "video" | "audio" | "gif" | "text" | "file";
            name: string;
            url: string;
            thumbnailUrl?: string;
            metadata: Record<string, any>;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
    };
    search: {
        query: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            query: z.ZodOptional<z.ZodString>;
            type: z.ZodDefault<z.ZodEnum<["board", "asset", "user", "all"]>>;
            userId: z.ZodOptional<z.ZodString>;
            boardId: z.ZodOptional<z.ZodString>;
            limit: z.ZodDefault<z.ZodNumber>;
            offset: z.ZodDefault<z.ZodNumber>;
            useAI: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            includeSimilar: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
            filters: z.ZodOptional<z.ZodObject<{
                assetType: z.ZodOptional<z.ZodArray<z.ZodEnum<["image", "video", "audio", "gif", "text", "file"]>, "many">>;
                boardVisibility: z.ZodOptional<z.ZodArray<z.ZodEnum<["public", "private", "shared"]>, "many">>;
            }, "strip", z.ZodTypeAny, {
                assetType?: ("text" | "image" | "video" | "audio" | "gif" | "file")[] | undefined;
                boardVisibility?: ("public" | "private" | "shared")[] | undefined;
            }, {
                assetType?: ("text" | "image" | "video" | "audio" | "gif" | "file")[] | undefined;
                boardVisibility?: ("public" | "private" | "shared")[] | undefined;
            }>>;
        }, "strip", z.ZodTypeAny, {
            type: "user" | "board" | "asset" | "all";
            limit: number;
            offset: number;
            userId?: string | undefined;
            query?: string | undefined;
            boardId?: string | undefined;
            useAI?: boolean | undefined;
            includeSimilar?: boolean | undefined;
            filters?: {
                assetType?: ("text" | "image" | "video" | "audio" | "gif" | "file")[] | undefined;
                boardVisibility?: ("public" | "private" | "shared")[] | undefined;
            } | undefined;
        }, {
            type?: "user" | "board" | "asset" | "all" | undefined;
            userId?: string | undefined;
            query?: string | undefined;
            boardId?: string | undefined;
            useAI?: boolean | undefined;
            includeSimilar?: boolean | undefined;
            filters?: {
                assetType?: ("text" | "image" | "video" | "audio" | "gif" | "file")[] | undefined;
                boardVisibility?: ("public" | "private" | "shared")[] | undefined;
            } | undefined;
            limit?: number | undefined;
            offset?: number | undefined;
        }>, import("@orpc/contract").Schema<{
            results: import("@squish-xyz/services").SearchResult[];
            total: number;
            query: string;
            filters: Record<string, any>;
        } | {
            results: import("@squish-xyz/services").SearchResult[];
            total: number;
            query: string;
            expanded: string[];
            aiInsights?: {
                relevantTopics: string[];
                searchIntent: string;
                suggestedFilters: string[];
            };
        }, {
            results: import("@squish-xyz/services").SearchResult[];
            total: number;
            query: string;
            filters: Record<string, any>;
        } | {
            results: import("@squish-xyz/services").SearchResult[];
            total: number;
            query: string;
            expanded: string[];
            aiInsights?: {
                relevantTopics: string[];
                searchIntent: string;
                suggestedFilters: string[];
            };
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        history: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            limit: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
        }, {
            limit?: number | undefined;
        }>, import("@orpc/contract").Schema<any[], any[]>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        save: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            query: z.ZodString;
            expandedContext: z.ZodOptional<z.ZodString>;
            resultsSnapshot: z.ZodOptional<z.ZodAny>;
        }, "strip", z.ZodTypeAny, {
            query: string;
            expandedContext?: string | undefined;
            resultsSnapshot?: any;
        }, {
            query: string;
            expandedContext?: string | undefined;
            resultsSnapshot?: any;
        }>, import("@orpc/contract").Schema<{
            searchId: string;
        }, {
            searchId: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        check: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext> & AuthenticatedContext, z.ZodObject<{
            searchId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            searchId: string;
        }, {
            searchId: string;
        }>, import("@orpc/contract").Schema<{
            hasNewResults: boolean;
            newResultsCount: number;
            results: import("@squish-xyz/services").SearchResult[];
        }, {
            hasNewResults: boolean;
            newResultsCount: number;
            results: import("@squish-xyz/services").SearchResult[];
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        public: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never>, keyof Context>, Context>, Context, z.ZodObject<{
            query: z.ZodString;
            type: z.ZodDefault<z.ZodEnum<["board", "user"]>>;
            limit: z.ZodDefault<z.ZodNumber>;
            offset: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            type: "user" | "board";
            query: string;
            limit: number;
            offset: number;
        }, {
            query: string;
            type?: "user" | "board" | undefined;
            limit?: number | undefined;
            offset?: number | undefined;
        }>, import("@orpc/contract").Schema<{
            results: import("@squish-xyz/services").SearchResult[];
            total: number;
            query: string;
            filters: Record<string, any>;
        }, {
            results: import("@squish-xyz/services").SearchResult[];
            total: number;
            query: string;
            filters: Record<string, any>;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
    };
    ai: {
        batch: {
            getBoards: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
                isAIService: boolean;
            }, z.ZodObject<{
                boardIds: z.ZodArray<z.ZodString, "many">;
                fields: z.ZodOptional<z.ZodArray<z.ZodEnum<["id", "name", "description", "icon", "visibility", "assetCount", "ownerId", "createdAt", "updatedAt"]>, "many">>;
            }, "strip", z.ZodTypeAny, {
                boardIds: string[];
                fields?: ("id" | "name" | "createdAt" | "updatedAt" | "visibility" | "description" | "icon" | "assetCount" | "ownerId")[] | undefined;
            }, {
                boardIds: string[];
                fields?: ("id" | "name" | "createdAt" | "updatedAt" | "visibility" | "description" | "icon" | "assetCount" | "ownerId")[] | undefined;
            }>, import("@orpc/contract").Schema<{
                boards: any[];
            }, {
                boards: any[];
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>>, Record<never, never>>;
            getAssets: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
                isAIService: boolean;
            }, z.ZodObject<{
                assetIds: z.ZodArray<z.ZodString, "many">;
                includeMetadata: z.ZodDefault<z.ZodBoolean>;
                includeThumbnails: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                assetIds: string[];
                includeMetadata: boolean;
                includeThumbnails: boolean;
            }, {
                assetIds: string[];
                includeMetadata?: boolean | undefined;
                includeThumbnails?: boolean | undefined;
            }>, import("@orpc/contract").Schema<{
                assets: any[];
            }, {
                assets: any[];
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>>, Record<never, never>>;
            getUsers: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
                isAIService: boolean;
            }, z.ZodObject<{
                userIds: z.ZodArray<z.ZodString, "many">;
                includeStats: z.ZodDefault<z.ZodBoolean>;
            }, "strip", z.ZodTypeAny, {
                userIds: string[];
                includeStats: boolean;
            }, {
                userIds: string[];
                includeStats?: boolean | undefined;
            }>, import("@orpc/contract").Schema<{
                users: any[];
            }, {
                users: any[];
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>>, Record<never, never>>;
        };
        search: {
            semanticSearch: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
                isAIService: boolean;
            }, z.ZodObject<{
                query: z.ZodString;
                embeddings: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
                searchType: z.ZodDefault<z.ZodEnum<["boards", "assets", "users", "all"]>>;
                filters: z.ZodOptional<z.ZodObject<{
                    boardIds: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    assetTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    dateRange: z.ZodOptional<z.ZodObject<{
                        start: z.ZodOptional<z.ZodString>;
                        end: z.ZodOptional<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        end?: string | undefined;
                        start?: string | undefined;
                    }, {
                        end?: string | undefined;
                        start?: string | undefined;
                    }>>;
                }, "strip", z.ZodTypeAny, {
                    boardIds?: string[] | undefined;
                    assetTypes?: string[] | undefined;
                    dateRange?: {
                        end?: string | undefined;
                        start?: string | undefined;
                    } | undefined;
                }, {
                    boardIds?: string[] | undefined;
                    assetTypes?: string[] | undefined;
                    dateRange?: {
                        end?: string | undefined;
                        start?: string | undefined;
                    } | undefined;
                }>>;
                limit: z.ZodDefault<z.ZodNumber>;
                threshold: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                query: string;
                limit: number;
                searchType: "boards" | "assets" | "all" | "users";
                threshold: number;
                filters?: {
                    boardIds?: string[] | undefined;
                    assetTypes?: string[] | undefined;
                    dateRange?: {
                        end?: string | undefined;
                        start?: string | undefined;
                    } | undefined;
                } | undefined;
                embeddings?: number[] | undefined;
            }, {
                query: string;
                filters?: {
                    boardIds?: string[] | undefined;
                    assetTypes?: string[] | undefined;
                    dateRange?: {
                        end?: string | undefined;
                        start?: string | undefined;
                    } | undefined;
                } | undefined;
                limit?: number | undefined;
                embeddings?: number[] | undefined;
                searchType?: "boards" | "assets" | "all" | "users" | undefined;
                threshold?: number | undefined;
            }>, import("@orpc/contract").Schema<{
                results: any[];
                metadata: {
                    totalResults: number;
                    searchType: "boards" | "assets" | "all" | "users";
                    threshold: number;
                };
            }, {
                results: any[];
                metadata: {
                    totalResults: number;
                    searchType: "boards" | "assets" | "all" | "users";
                    threshold: number;
                };
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>>, Record<never, never>>;
            findSimilar: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
                isAIService: boolean;
            }, z.ZodObject<{
                sourceId: z.ZodString;
                sourceType: z.ZodEnum<["board", "asset"]>;
                limit: z.ZodDefault<z.ZodNumber>;
                diversityFactor: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                limit: number;
                sourceId: string;
                sourceType: "board" | "asset";
                diversityFactor: number;
            }, {
                sourceId: string;
                sourceType: "board" | "asset";
                limit?: number | undefined;
                diversityFactor?: number | undefined;
            }>, import("@orpc/contract").Schema<{
                similar: any[];
            }, {
                similar: any[];
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>>, Record<never, never>>;
        };
        analytics: {
            getInsights: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
                isAIService: boolean;
            }, z.ZodObject<{
                entityType: z.ZodEnum<["board", "user", "asset"]>;
                entityId: z.ZodString;
                metrics: z.ZodDefault<z.ZodArray<z.ZodEnum<["engagement", "growth", "quality", "collaboration", "trends"]>, "many">>;
                timeframe: z.ZodDefault<z.ZodEnum<["1d", "7d", "30d", "90d"]>>;
            }, "strip", z.ZodTypeAny, {
                entityType: "user" | "board" | "asset";
                entityId: string;
                metrics: ("collaboration" | "engagement" | "growth" | "quality" | "trends")[];
                timeframe: "1d" | "7d" | "30d" | "90d";
            }, {
                entityType: "user" | "board" | "asset";
                entityId: string;
                metrics?: ("collaboration" | "engagement" | "growth" | "quality" | "trends")[] | undefined;
                timeframe?: "1d" | "7d" | "30d" | "90d" | undefined;
            }>, import("@orpc/contract").Schema<{
                insights: any;
                summary: string;
            }, {
                insights: any;
                summary: string;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>>, Record<never, never>>;
            getTrending: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
                isAIService: boolean;
            }, z.ZodObject<{
                category: z.ZodOptional<z.ZodEnum<["boards", "assets", "topics"]>>;
                timeframe: z.ZodDefault<z.ZodEnum<["1h", "24h", "7d"]>>;
                limit: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                limit: number;
                timeframe: "7d" | "1h" | "24h";
                category?: "boards" | "assets" | "topics" | undefined;
            }, {
                category?: "boards" | "assets" | "topics" | undefined;
                limit?: number | undefined;
                timeframe?: "7d" | "1h" | "24h" | undefined;
            }>, import("@orpc/contract").Schema<{
                trending: any;
            }, {
                trending: any;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>>, Record<never, never>>;
        };
        recommendations: {
            getRecommendations: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
                isAIService: boolean;
            }, z.ZodObject<{
                userId: z.ZodString;
                recommendationType: z.ZodEnum<["boards", "assets", "collaborators", "topics"]>;
                context: z.ZodOptional<z.ZodObject<{
                    currentBoardId: z.ZodOptional<z.ZodString>;
                    recentInteractions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                    preferences: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                }, "strip", z.ZodTypeAny, {
                    currentBoardId?: string | undefined;
                    recentInteractions?: string[] | undefined;
                    preferences?: Record<string, any> | undefined;
                }, {
                    currentBoardId?: string | undefined;
                    recentInteractions?: string[] | undefined;
                    preferences?: Record<string, any> | undefined;
                }>>;
                limit: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                userId: string;
                limit: number;
                recommendationType: "boards" | "assets" | "collaborators" | "topics";
                context?: {
                    currentBoardId?: string | undefined;
                    recentInteractions?: string[] | undefined;
                    preferences?: Record<string, any> | undefined;
                } | undefined;
            }, {
                userId: string;
                recommendationType: "boards" | "assets" | "collaborators" | "topics";
                limit?: number | undefined;
                context?: {
                    currentBoardId?: string | undefined;
                    recentInteractions?: string[] | undefined;
                    preferences?: Record<string, any> | undefined;
                } | undefined;
            }>, import("@orpc/contract").Schema<{
                recommendations: any;
                reasoning: string[];
            }, {
                recommendations: any;
                reasoning: string[];
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>>, Record<never, never>>;
            getCollaborativeFiltering: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
                isAIService: boolean;
            }, z.ZodObject<{
                userId: z.ZodString;
                itemType: z.ZodEnum<["boards", "assets"]>;
                method: z.ZodDefault<z.ZodEnum<["user_based", "item_based", "hybrid"]>>;
                limit: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                userId: string;
                limit: number;
                method: "user_based" | "item_based" | "hybrid";
                itemType: "boards" | "assets";
            }, {
                userId: string;
                itemType: "boards" | "assets";
                limit?: number | undefined;
                method?: "user_based" | "item_based" | "hybrid" | undefined;
            }>, import("@orpc/contract").Schema<{
                suggestions: any;
            }, {
                suggestions: any;
            }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>>, Record<never, never>>;
        };
        health: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never>, keyof Context>, Context>, Context, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
            status: string;
            timestamp: string;
            version: string;
        }, {
            status: string;
            timestamp: string;
            version: string;
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
    };
};
export type AppRouter = typeof appRouter;
//# sourceMappingURL=router.d.ts.map