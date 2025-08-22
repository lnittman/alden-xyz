import { and, count, desc, eq, schema, type DatabaseClient } from '@repo/database';
import { ServiceError, internalError, notFound } from './lib/errors';

export class UserService {
  constructor(private db: DatabaseClient) {}

  async getUserById(userId: string) {
    try {
      const [user] = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);

      if (!user) {
        throw notFound('User not found');
      }

      // Get user's boards count
      const [boardCount] = await this.db
        .select({ count: count() })
        .from(schema.boards)
        .where(eq(schema.boards.creatorId, userId));

      // Get recent boards
      const recentBoards = await this.db
        .select({
          board: schema.boards,
        })
        .from(schema.boards)
        .where(eq(schema.boards.creatorId, userId))
        .orderBy(desc(schema.boards.updatedAt))
        .limit(10);

      // Get collaborations
      const collaborations = await this.db
        .select({
          board: schema.boards,
          accessLevel: schema.boardCollaborators.accessLevel,
          joinedAt: schema.boardCollaborators.createdAt,
        })
        .from(schema.boardCollaborators)
        .innerJoin(
          schema.boards,
          eq(schema.boardCollaborators.boardId, schema.boards.id)
        )
        .where(eq(schema.boardCollaborators.userId, userId))
        .orderBy(desc(schema.boardCollaborators.createdAt))
        .limit(10);

      return {
        ...user,
        stats: {
          boardsCreated: Number(boardCount?.count || 0),
          collaborations: collaborations.length,
        },
        recentBoards: recentBoards.map((r) => r.board),
        collaborations: collaborations.map((c) => ({
          ...c.board,
          accessLevel: c.accessLevel,
          joinedAt: c.joinedAt,
        })),
      };
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to get user');
    }
  }

  async getUserByUsername(username: string) {
    try {
      const [user] = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.username, username))
        .limit(1);

      if (!user) {
        throw notFound('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to get user by username');
    }
  }

  async updateUser(
    userId: string,
    data: {
      username?: string;
      name?: string;
      bio?: string;
      location?: string;
      website?: string;
      pfpUrl?: string;
      pinned_columns?: any[];
      pronouns?: string[];
      show_pronouns?: boolean;
      gender?: string;
      country?: string;
      selected_profile_stat?: string;
    }
  ) {
    try {
      // Prepare update data, handling special fields
      const updateData: any = {
        updatedAt: new Date(),
      };

      // Map incoming field names to database column names
      if (data.username !== undefined) updateData.username = data.username;
      if (data.name !== undefined) updateData.name = data.name;
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.website !== undefined) updateData.website = data.website;
      if (data.pfpUrl !== undefined) updateData.pfpUrl = data.pfpUrl;
      if (data.pinned_columns !== undefined) updateData.pinnedColumns = data.pinned_columns;
      if (data.pronouns !== undefined) updateData.pronouns = data.pronouns;
      if (data.show_pronouns !== undefined) updateData.showPronouns = data.show_pronouns;
      if (data.gender !== undefined) updateData.gender = data.gender;
      if (data.country !== undefined) updateData.country = data.country;
      if (data.selected_profile_stat !== undefined) updateData.selectedProfileStat = data.selected_profile_stat;

      const [updatedUser] = await this.db
        .update(schema.users)
        .set(updateData)
        .where(eq(schema.users.id, userId))
        .returning();

      if (!updatedUser) {
        throw notFound('User not found');
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to update user');
    }
  }

  async deleteUser(userId: string) {
    try {
      // Delete user's boards
      await this.db
        .delete(schema.boards)
        .where(eq(schema.boards.creatorId, userId));

      // Delete user's assets
      await this.db
        .delete(schema.assets)
        .where(eq(schema.assets.creatorId, userId));

      // Delete user
      const [deletedUser] = await this.db
        .delete(schema.users)
        .where(eq(schema.users.id, userId))
        .returning();

      if (!deletedUser) {
        throw notFound('User not found');
      }

      return { success: true };
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to delete user');
    }
  }

  async getUserStats(userId: string) {
    try {
      const [boardStats] = await this.db
        .select({ count: count() })
        .from(schema.boards)
        .where(eq(schema.boards.creatorId, userId));

      const [assetStats] = await this.db
        .select({ count: count() })
        .from(schema.assets)
        .where(eq(schema.assets.creatorId, userId));

      const [collaborationStats] = await this.db
        .select({ count: count() })
        .from(schema.boardCollaborators)
        .where(eq(schema.boardCollaborators.userId, userId));

      return {
        boardsCreated: Number(boardStats?.count || 0),
        assetsCreated: Number(assetStats?.count || 0),
        collaborations: Number(collaborationStats?.count || 0),
        joinedAt: new Date(), // Would need to fetch from user record
      };
    } catch (error) {
      throw internalError('Failed to get user stats');
    }
  }
}

