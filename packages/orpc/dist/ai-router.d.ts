import { z } from 'zod';
import type { AuthenticatedContext, Context } from './context';
export declare const aiBatchRouter: {
    getBoards: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
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
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getAssets: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
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
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getUsers: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
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
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
};
export declare const aiSearchRouter: {
    semanticSearch: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
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
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    findSimilar: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
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
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
};
export declare const aiAnalyticsRouter: {
    getInsights: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
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
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getTrending: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
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
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
};
export declare const aiRecommendationRouter: {
    getRecommendations: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
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
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
    getCollaborativeFiltering: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
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
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
};
export declare const aiRouter: {
    batch: {
        getBoards: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
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
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getAssets: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
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
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getUsers: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
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
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
    };
    search: {
        semanticSearch: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
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
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        findSimilar: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
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
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
    };
    analytics: {
        getInsights: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
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
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getTrending: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
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
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
    };
    recommendations: {
        getRecommendations: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
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
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
        getCollaborativeFiltering: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never> & Omit<Context & Record<never, never> & Omit<Context, keyof Context>, keyof Context>, Context>, Omit<Context, keyof AuthenticatedContext | "isAIService"> & AuthenticatedContext & {
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
        }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
    };
    health: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<Context & Record<never, never>, Context & Record<never, never>, Context>, Context, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
        status: string;
        timestamp: string;
        version: string;
    }, {
        status: string;
        timestamp: string;
        version: string;
    }>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>, Record<never, never>>;
};
export type AIRouter = typeof aiRouter;
//# sourceMappingURL=ai-router.d.ts.map