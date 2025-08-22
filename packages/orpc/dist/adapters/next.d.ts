export declare const createBoardAction: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<import("..").Context & Record<never, never>, import("..").Context & Record<never, never> & Omit<import("..").Context & Record<never, never> & Omit<import("..").Context, keyof import("..").Context>, keyof import("..").Context>, import("..").Context>, Omit<import("..").Context, keyof import("..").AuthenticatedContext> & import("..").AuthenticatedContext, import("zod").ZodObject<{
    name: import("zod").ZodString;
    description: import("zod").ZodOptional<import("zod").ZodString>;
    visibility: import("zod").ZodDefault<import("zod").ZodEnum<["public", "private"]>>;
    emoji: import("zod").ZodOptional<import("zod").ZodString>;
    instructions: import("zod").ZodOptional<import("zod").ZodString>;
    sources: import("zod").ZodOptional<import("zod").ZodString>;
}, "strip", import("zod").ZodTypeAny, {
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
export declare const updateBoardAction: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<import("..").Context & Record<never, never>, import("..").Context & Record<never, never> & Omit<import("..").Context & Record<never, never> & Omit<import("..").Context, keyof import("..").Context>, keyof import("..").Context>, import("..").Context>, Omit<import("..").Context, keyof import("..").AuthenticatedContext> & import("..").AuthenticatedContext, import("zod").ZodObject<{
    boardId: import("zod").ZodString;
    name: import("zod").ZodOptional<import("zod").ZodString>;
    description: import("zod").ZodOptional<import("zod").ZodString>;
    visibility: import("zod").ZodOptional<import("zod").ZodEnum<["public", "private"]>>;
    emoji: import("zod").ZodOptional<import("zod").ZodString>;
    instructions: import("zod").ZodOptional<import("zod").ZodString>;
    sources: import("zod").ZodOptional<import("zod").ZodString>;
}, "strip", import("zod").ZodTypeAny, {
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
export declare const deleteBoardAction: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<import("..").Context & Record<never, never>, import("..").Context & Record<never, never> & Omit<import("..").Context & Record<never, never> & Omit<import("..").Context, keyof import("..").Context>, keyof import("..").Context>, import("..").Context>, Omit<import("..").Context, keyof import("..").AuthenticatedContext> & import("..").AuthenticatedContext, import("zod").ZodObject<{
    boardId: import("zod").ZodString;
}, "strip", import("zod").ZodTypeAny, {
    boardId: string;
}, {
    boardId: string;
}>, import("@orpc/contract").Schema<void, void>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
export declare const addBoardCollaboratorAction: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<import("..").Context & Record<never, never>, import("..").Context & Record<never, never> & Omit<import("..").Context & Record<never, never> & Omit<import("..").Context, keyof import("..").Context>, keyof import("..").Context>, import("..").Context>, Omit<import("..").Context, keyof import("..").AuthenticatedContext> & import("..").AuthenticatedContext, import("zod").ZodObject<{
    boardId: import("zod").ZodString;
    userId: import("zod").ZodString;
    accessLevel: import("zod").ZodDefault<import("zod").ZodEnum<["view", "edit", "admin"]>>;
}, "strip", import("zod").ZodTypeAny, {
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
export declare const removeBoardCollaboratorAction: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<import("..").Context & Record<never, never>, import("..").Context & Record<never, never> & Omit<import("..").Context & Record<never, never> & Omit<import("..").Context, keyof import("..").Context>, keyof import("..").Context>, import("..").Context>, Omit<import("..").Context, keyof import("..").AuthenticatedContext> & import("..").AuthenticatedContext, import("zod").ZodObject<{
    boardId: import("zod").ZodString;
    userId: import("zod").ZodString;
}, "strip", import("zod").ZodTypeAny, {
    userId: string;
    boardId: string;
}, {
    userId: string;
    boardId: string;
}>, import("@orpc/contract").Schema<void, void>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
export declare const addAssetToBoardAction: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<import("..").Context & Record<never, never>, import("..").Context & Record<never, never> & Omit<import("..").Context & Record<never, never> & Omit<import("..").Context, keyof import("..").Context>, keyof import("..").Context>, import("..").Context>, Omit<import("..").Context, keyof import("..").AuthenticatedContext> & import("..").AuthenticatedContext, import("zod").ZodObject<{
    boardId: import("zod").ZodString;
    assetId: import("zod").ZodString;
}, "strip", import("zod").ZodTypeAny, {
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
export declare const removeAssetFromBoardAction: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<import("..").Context & Record<never, never>, import("..").Context & Record<never, never> & Omit<import("..").Context & Record<never, never> & Omit<import("..").Context, keyof import("..").Context>, keyof import("..").Context>, import("..").Context>, Omit<import("..").Context, keyof import("..").AuthenticatedContext> & import("..").AuthenticatedContext, import("zod").ZodObject<{
    boardId: import("zod").ZodString;
    assetId: import("zod").ZodString;
}, "strip", import("zod").ZodTypeAny, {
    boardId: string;
    assetId: string;
}, {
    boardId: string;
    assetId: string;
}>, import("@orpc/contract").Schema<void, void>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
export declare const createAssetAction: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<import("..").Context & Record<never, never>, import("..").Context & Record<never, never> & Omit<import("..").Context & Record<never, never> & Omit<import("..").Context, keyof import("..").Context>, keyof import("..").Context>, import("..").Context>, Omit<import("..").Context, keyof import("..").AuthenticatedContext> & import("..").AuthenticatedContext, import("zod").ZodObject<{
    boardId: import("zod").ZodString;
    name: import("zod").ZodString;
    type: import("zod").ZodEnum<["image", "video", "audio", "gif", "text"]>;
    url: import("zod").ZodString;
    size: import("zod").ZodNumber;
    mimeType: import("zod").ZodString;
    metadata: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodAny>>;
}, "strip", import("zod").ZodTypeAny, {
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
export declare const updateAssetAction: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<import("..").Context & Record<never, never>, import("..").Context & Record<never, never> & Omit<import("..").Context & Record<never, never> & Omit<import("..").Context, keyof import("..").Context>, keyof import("..").Context>, import("..").Context>, Omit<import("..").Context, keyof import("..").AuthenticatedContext> & import("..").AuthenticatedContext, import("zod").ZodObject<{
    assetId: import("zod").ZodString;
    name: import("zod").ZodOptional<import("zod").ZodString>;
    metadata: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodAny>>;
}, "strip", import("zod").ZodTypeAny, {
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
export declare const deleteAssetAction: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<import("..").Context & Record<never, never>, import("..").Context & Record<never, never> & Omit<import("..").Context & Record<never, never> & Omit<import("..").Context, keyof import("..").Context>, keyof import("..").Context>, import("..").Context>, Omit<import("..").Context, keyof import("..").AuthenticatedContext> & import("..").AuthenticatedContext, import("zod").ZodObject<{
    assetId: import("zod").ZodString;
}, "strip", import("zod").ZodTypeAny, {
    assetId: string;
}, {
    assetId: string;
}>, import("@orpc/contract").Schema<void, void>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
export declare const likeAssetAction: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<import("..").Context & Record<never, never>, import("..").Context & Record<never, never> & Omit<import("..").Context & Record<never, never> & Omit<import("..").Context, keyof import("..").Context>, keyof import("..").Context>, import("..").Context>, Omit<import("..").Context, keyof import("..").AuthenticatedContext> & import("..").AuthenticatedContext, import("zod").ZodObject<{
    assetId: import("zod").ZodString;
}, "strip", import("zod").ZodTypeAny, {
    assetId: string;
}, {
    assetId: string;
}>, import("@orpc/contract").Schema<{
    liked: boolean;
}, {
    liked: boolean;
}>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
export declare const trackAssetViewAction: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<import("..").Context & Record<never, never>, import("..").Context & Record<never, never> & Omit<import("..").Context & Record<never, never> & Omit<import("..").Context, keyof import("..").Context>, keyof import("..").Context>, import("..").Context>, Omit<import("..").Context, keyof import("..").AuthenticatedContext> & import("..").AuthenticatedContext, import("zod").ZodObject<{
    assetId: import("zod").ZodString;
}, "strip", import("zod").ZodTypeAny, {
    assetId: string;
}, {
    assetId: string;
}>, import("@orpc/contract").Schema<void, void>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
export declare const trackAssetUseAction: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<import("..").Context & Record<never, never>, import("..").Context & Record<never, never> & Omit<import("..").Context & Record<never, never> & Omit<import("..").Context, keyof import("..").Context>, keyof import("..").Context>, import("..").Context>, Omit<import("..").Context, keyof import("..").AuthenticatedContext> & import("..").AuthenticatedContext, import("zod").ZodObject<{
    assetId: import("zod").ZodString;
}, "strip", import("zod").ZodTypeAny, {
    assetId: string;
}, {
    assetId: string;
}>, import("@orpc/contract").Schema<void, void>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
export declare const updateUserAction: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<import("..").Context & Record<never, never>, import("..").Context & Record<never, never> & Omit<import("..").Context & Record<never, never> & Omit<import("..").Context, keyof import("..").Context>, keyof import("..").Context>, import("..").Context>, Omit<import("..").Context, keyof import("..").AuthenticatedContext> & import("..").AuthenticatedContext, import("zod").ZodObject<{
    username: import("zod").ZodOptional<import("zod").ZodString>;
    name: import("zod").ZodOptional<import("zod").ZodString>;
    bio: import("zod").ZodOptional<import("zod").ZodString>;
    location: import("zod").ZodOptional<import("zod").ZodString>;
    website: import("zod").ZodOptional<import("zod").ZodString>;
    pfpUrl: import("zod").ZodOptional<import("zod").ZodString>;
    pinned_columns: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodAny, "many">>;
    pronouns: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
    show_pronouns: import("zod").ZodOptional<import("zod").ZodBoolean>;
    gender: import("zod").ZodOptional<import("zod").ZodString>;
    country: import("zod").ZodOptional<import("zod").ZodString>;
    selected_profile_stat: import("zod").ZodOptional<import("zod").ZodString>;
}, "strip", import("zod").ZodTypeAny, {
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
export declare const deleteUserAction: import("@orpc/server").Procedure<import("@orpc/server").MergedInitialContext<import("..").Context & Record<never, never>, import("..").Context & Record<never, never> & Omit<import("..").Context & Record<never, never> & Omit<import("..").Context, keyof import("..").Context>, keyof import("..").Context>, import("..").Context>, Omit<import("..").Context, keyof import("..").AuthenticatedContext> & import("..").AuthenticatedContext, import("@orpc/contract").Schema<unknown, unknown>, import("@orpc/contract").Schema<{
    success: boolean;
}, {
    success: boolean;
}>, import("@orpc/contract").MergedErrorMap<Record<never, never>, import("@orpc/contract").MergedErrorMap<Record<never, never>, Record<never, never>>>, Record<never, never>>;
//# sourceMappingURL=next.d.ts.map