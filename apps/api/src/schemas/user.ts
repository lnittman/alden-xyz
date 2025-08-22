import { z } from 'zod';

// User update schema
export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/)
    .optional(),
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  interests: z.array(z.string()).max(10).optional(),
  pronouns: z.string().optional(),
});

// User query params schema
export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

// Username params schema
export const usernameSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
});

// User ID params schema
export const userIdSchema = z.object({
  userId: z.string().uuid(),
});

// Follow/unfollow schema
export const followUserSchema = z.object({
  targetUserId: z.string().uuid(),
});

// User preferences schema
export const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  language: z.string().optional(),
});

// Types
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQueryParams = z.infer<typeof userQuerySchema>;
export type UsernameParams = z.infer<typeof usernameSchema>;
export type UserIdParams = z.infer<typeof userIdSchema>;
export type FollowUserInput = z.infer<typeof followUserSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
