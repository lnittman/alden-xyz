import { z } from 'zod';

// Board creation schema
export const createBoardSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

// Legacy alias for backward compatibility
export const CreateBoardBodySchema = createBoardSchema;

// Board update schema
export const updateBoardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

// Legacy alias for backward compatibility
export const UpdateBoardBodySchema = updateBoardSchema;

// Board icon update schema
export const UpdateBoardIconBodySchema = z.object({
  icon: z.string().emoji().optional(),
});

// Add collaborator schema
export const AddBoardCollaboratorBodySchema = z.object({
  userId: z.string().uuid(),
  accessLevel: z.enum(['view', 'edit', 'admin']).default('view'),
});

// Board query params schema
export const boardQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

// Board ID params schema
export const boardIdSchema = z.object({
  boardId: z.string().uuid(),
});

// Add assets to board schema
export const addAssetsToBoardSchema = z.object({
  assetIds: z.array(z.string().uuid()).min(1),
});

// Types
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type BoardQueryParams = z.infer<typeof boardQuerySchema>;
export type BoardIdParams = z.infer<typeof boardIdSchema>;
export type AddAssetsToBoardInput = z.infer<typeof addAssetsToBoardSchema>;
export type UpdateBoardIconInput = z.infer<typeof UpdateBoardIconBodySchema>;
export type AddBoardCollaboratorInput = z.infer<
  typeof AddBoardCollaboratorBodySchema
>;
