import { type DatabaseClient } from '@repo/database';
import {
  and,
  count,
  desc,
  eq,
  like,
  or,
  schema,
  sql,
} from '@repo/database';
import {
  ServiceError,
  internalError,
  notFound,
  unauthorized,
} from './lib/errors';

export class BoardService {
  constructor(private db: DatabaseClient) {}
  async createBoard(
    userId: string,
    data: {
      name: string;
      visibility?: string;
      description?: string;
      instructions?: string;
      sources?: string;
      icon?: string;
    }
  ) {
    try {
      const [board] = await this.db
        .insert(schema.boards)
        .values({
          ...data,
          creatorId: userId,
          visibility: data.visibility || 'public',
          icon: data.icon || '🖼️',
        })
        .returning();

      return board;
    } catch (_error) {
      throw internalError('Failed to create board');
    }
  }

  async getBoardById(boardId: string, userId?: string) {
    try {
      const [board] = await this.db
        .select({
          board: schema.boards,
          creator: {
            id: schema.users.id,
            username: schema.users.username,
            name: schema.users.name,
            pfpUrl: schema.users.pfpUrl,
          },
        })
        .from(schema.boards)
        .innerJoin(schema.users, eq(schema.boards.creatorId, schema.users.id))
        .where(eq(schema.boards.id, boardId))
        .limit(1);

      if (!board) {
        throw notFound('Board not found');
      }

      // Check visibility permissions
      if (board.board.visibility === 'private' && board.creator.id !== userId) {
        // Check if user is a collaborator
        if (userId) {
          const [collaboration] = await this.db
            .select()
            .from(schema.boardCollaborators)
            .where(
              and(
                eq(schema.boardCollaborators.boardId, boardId),
                eq(schema.boardCollaborators.userId, userId)
              )
            )
            .limit(1);

          if (!collaboration) {
            throw unauthorized('You do not have access to this board');
          }
        } else {
          throw unauthorized('You do not have access to this board');
        }
      }

      // Get assets count
      const [assetCount] = await this.db
        .select({ count: count() })
        .from(schema.boardAssets)
        .where(eq(schema.boardAssets.boardId, boardId));

      // Get collaborators count
      const [collaboratorCount] = await this.db
        .select({ count: count() })
        .from(schema.boardCollaborators)
        .where(eq(schema.boardCollaborators.boardId, boardId));

      return {
        ...board.board,
        creator: board.creator,
        assetCount: Number(assetCount?.count || 0),
        collaboratorCount: Number(collaboratorCount?.count || 0),
      };
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to fetch board');
    }
  }

  async updateBoard(
    boardId: string,
    userId: string,
    data: Partial<{
      name: string;
      visibility: string;
      description: string;
      instructions: string;
      sources: string;
      icon: string;
    }>
  ) {
    try {
      // Check ownership
      const [board] = await this.db
        .select()
        .from(schema.boards)
        .where(eq(schema.boards.id, boardId))
        .limit(1);

      if (!board) {
        throw notFound('Board not found');
      }

      if (board.creatorId !== userId) {
        // Check if user has edit permissions
        const [collaboration] = await this.db
          .select()
          .from(schema.boardCollaborators)
          .where(
            and(
              eq(schema.boardCollaborators.boardId, boardId),
              eq(schema.boardCollaborators.userId, userId),
              or(
                eq(schema.boardCollaborators.accessLevel, 'edit'),
                eq(schema.boardCollaborators.accessLevel, 'admin')
              )
            )
          )
          .limit(1);

        if (!collaboration) {
          throw unauthorized('You do not have permission to edit this board');
        }
      }

      const [updatedBoard] = await this.db
        .update(schema.boards)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(schema.boards.id, boardId))
        .returning();

      return updatedBoard;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to update board');
    }
  }

  async deleteBoard(boardId: string, userId: string) {
    try {
      // Check ownership
      const [board] = await this.db
        .select()
        .from(schema.boards)
        .where(eq(schema.boards.id, boardId))
        .limit(1);

      if (!board) {
        throw notFound('Board not found');
      }

      if (board.creatorId !== userId) {
        throw unauthorized('You can only delete your own boards');
      }

      await this.db.delete(schema.boards).where(eq(schema.boards.id, boardId));
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to delete board');
    }
  }

  async listBoards(options: {
    userId?: string;
    visibility?: 'public' | 'private';
    search?: string;
    limit?: number;
    offset?: number;
    orderBy?: 'createdAt' | 'updatedAt' | 'name';
    order?: 'asc' | 'desc';
  }) {
    try {
      const conditions = [];

      // Filter by visibility
      if (options.visibility) {
        conditions.push(eq(schema.boards.visibility, options.visibility));
      } else if (!options.userId) {
        // If not filtering by user, only show public boards
        conditions.push(eq(schema.boards.visibility, 'public'));
      }

      // Filter by user (their boards or boards they collaborate on)
      if (options.userId) {
        const _userBoardsSubquery = this.db
          .select({ boardId: schema.boards.id })
          .from(schema.boards)
          .where(eq(schema.boards.creatorId, options.userId));

        const collaborationSubquery = this.db
          .select({ boardId: schema.boardCollaborators.boardId })
          .from(schema.boardCollaborators)
          .where(eq(schema.boardCollaborators.userId, options.userId));

        conditions.push(
          or(
            eq(schema.boards.creatorId, options.userId),
            sql`${schema.boards.id} IN (${collaborationSubquery})`
          )
        );
      }

      // Search by name or description
      if (options.search) {
        conditions.push(
          or(
            like(schema.boards.name, `%${options.search}%`),
            like(schema.boards.description, `%${options.search}%`)
          )
        );
      }

      // Build query
      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Apply ordering
      const _orderColumn = options.orderBy || 'createdAt';
      const orderDirection = options.order || 'desc';

      // Apply pagination
      const limit = options.limit || 20;
      const offset = options.offset || 0;

      const results = await this.db
        .select({
          board: schema.boards,
          creator: {
            id: schema.users.id,
            username: schema.users.username,
            name: schema.users.name,
            pfpUrl: schema.users.pfpUrl,
          },
          assetCount: count(schema.boardAssets.assetId),
        })
        .from(schema.boards)
        .innerJoin(schema.users, eq(schema.boards.creatorId, schema.users.id))
        .leftJoin(
          schema.boardAssets,
          eq(schema.boardAssets.boardId, schema.boards.id)
        )
        .where(whereClause)
        .groupBy(schema.boards.id, schema.users.id)
        .orderBy(
          orderDirection === 'desc'
            ? desc(schema.boards.createdAt)
            : schema.boards.createdAt
        )
        .limit(limit)
        .offset(offset);

      return results.map((r) => ({
        ...r.board,
        creator: r.creator,
        assetCount: Number(r.assetCount),
      }));
    } catch (_error) {
      throw internalError('Failed to list boards');
    }
  }

  async addCollaborator(
    boardId: string,
    ownerId: string,
    data: {
      userId: string;
      accessLevel?: 'view' | 'edit' | 'admin';
    }
  ) {
    try {
      // Check ownership
      const [board] = await this.db
        .select()
        .from(schema.boards)
        .where(eq(schema.boards.id, boardId))
        .limit(1);

      if (!board) {
        throw notFound('Board not found');
      }

      if (board.creatorId !== ownerId) {
        throw unauthorized('Only the board owner can add collaborators');
      }

      // Check if collaboration already exists
      const [existing] = await this.db
        .select()
        .from(schema.boardCollaborators)
        .where(
          and(
            eq(schema.boardCollaborators.boardId, boardId),
            eq(schema.boardCollaborators.userId, data.userId)
          )
        )
        .limit(1);

      if (existing) {
        // Update access level
        const [updated] = await this.db
          .update(schema.boardCollaborators)
          .set({
            accessLevel: data.accessLevel || 'view',
          })
          .where(
            and(
              eq(schema.boardCollaborators.boardId, boardId),
              eq(schema.boardCollaborators.userId, data.userId)
            )
          )
          .returning();

        return updated;
      }

      // Create new collaboration
      const [collaboration] = await this.db
        .insert(schema.boardCollaborators)
        .values({
          boardId,
          userId: data.userId,
          accessLevel: data.accessLevel || 'view',
        })
        .returning();

      return collaboration;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to add collaborator');
    }
  }

  async removeCollaborator(boardId: string, ownerId: string, userId: string) {
    try {
      // Check ownership
      const [board] = await this.db
        .select()
        .from(schema.boards)
        .where(eq(schema.boards.id, boardId))
        .limit(1);

      if (!board) {
        throw notFound('Board not found');
      }

      if (board.creatorId !== ownerId) {
        throw unauthorized('Only the board owner can remove collaborators');
      }

      await this.db
        .delete(schema.boardCollaborators)
        .where(
          and(
            eq(schema.boardCollaborators.boardId, boardId),
            eq(schema.boardCollaborators.userId, userId)
          )
        );
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to remove collaborator');
    }
  }

  async getBoardAssets(boardId: string, userId?: string) {
    try {
      // Check access permissions
      await this.getBoardById(boardId, userId);

      const assets = await this.db
        .select({
          asset: schema.assets,
          order: schema.boardAssets.order,
          addedAt: schema.boardAssets.createdAt,
        })
        .from(schema.boardAssets)
        .innerJoin(
          schema.assets,
          eq(schema.boardAssets.assetId, schema.assets.id)
        )
        .where(eq(schema.boardAssets.boardId, boardId))
        .orderBy(schema.boardAssets.order);

      return assets;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to fetch board assets');
    }
  }

  async addAssetToBoard(
    boardId: string,
    userId: string,
    assetId: string,
    order?: number
  ) {
    try {
      // Check permissions
      const [board] = await this.db
        .select()
        .from(schema.boards)
        .where(eq(schema.boards.id, boardId))
        .limit(1);

      if (!board) {
        throw notFound('Board not found');
      }

      if (board.creatorId !== userId) {
        // Check if user has edit permissions
        const [collaboration] = await this.db
          .select()
          .from(schema.boardCollaborators)
          .where(
            and(
              eq(schema.boardCollaborators.boardId, boardId),
              eq(schema.boardCollaborators.userId, userId),
              or(
                eq(schema.boardCollaborators.accessLevel, 'edit'),
                eq(schema.boardCollaborators.accessLevel, 'admin')
              )
            )
          )
          .limit(1);

        if (!collaboration) {
          throw unauthorized('You do not have permission to edit this board');
        }
      }

      // Check if asset exists
      const [asset] = await this.db
        .select()
        .from(schema.assets)
        .where(eq(schema.assets.id, assetId))
        .limit(1);

      if (!asset) {
        throw notFound('Asset not found');
      }

      // Get max order if not provided
      if (order === undefined) {
        const [maxOrder] = await this.db
          .select({ max: sql<number>`MAX(${schema.boardAssets.order})` })
          .from(schema.boardAssets)
          .where(eq(schema.boardAssets.boardId, boardId));

        order = (maxOrder?.max || 0) + 1;
      }

      // Add asset to board
      const [boardAsset] = await this.db
        .insert(schema.boardAssets)
        .values({
          boardId,
          assetId,
          order,
        })
        .returning();

      // Update board's updatedAt
      await this.db
        .update(schema.boards)
        .set({ updatedAt: new Date() })
        .where(eq(schema.boards.id, boardId));

      return boardAsset;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to add asset to board');
    }
  }

  async removeAssetFromBoard(boardId: string, userId: string, assetId: string) {
    try {
      // Check permissions (same as addAssetToBoard)
      const [board] = await this.db
        .select()
        .from(schema.boards)
        .where(eq(schema.boards.id, boardId))
        .limit(1);

      if (!board) {
        throw notFound('Board not found');
      }

      if (board.creatorId !== userId) {
        const [collaboration] = await this.db
          .select()
          .from(schema.boardCollaborators)
          .where(
            and(
              eq(schema.boardCollaborators.boardId, boardId),
              eq(schema.boardCollaborators.userId, userId),
              or(
                eq(schema.boardCollaborators.accessLevel, 'edit'),
                eq(schema.boardCollaborators.accessLevel, 'admin')
              )
            )
          )
          .limit(1);

        if (!collaboration) {
          throw unauthorized('You do not have permission to edit this board');
        }
      }

      await this.db
        .delete(schema.boardAssets)
        .where(
          and(
            eq(schema.boardAssets.boardId, boardId),
            eq(schema.boardAssets.assetId, assetId)
          )
        );

      // Update board's updatedAt
      await this.db
        .update(schema.boards)
        .set({ updatedAt: new Date() })
        .where(eq(schema.boards.id, boardId));
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to remove asset from board');
    }
  }

  async getUserBoards({
    userId,
    includeCollaborated = false,
    limit = 20,
    offset = 0,
  }: {
    userId: string;
    includeCollaborated?: boolean;
    limit?: number;
    offset?: number;
  }) {
    try {
      const whereClause = includeCollaborated
        ? or(
            eq(schema.boards.creatorId, userId),
            sql`${schema.boards.id} IN (
              SELECT ${schema.boardCollaborators.boardId}
              FROM ${schema.boardCollaborators}
              WHERE ${schema.boardCollaborators.userId} = ${userId}
            )`
          )
        : eq(schema.boards.creatorId, userId);

      const boards = await this.db
        .select({
          board: schema.boards,
          creator: {
            id: schema.users.id,
            username: schema.users.username,
            name: schema.users.name,
            pfpUrl: schema.users.pfpUrl,
          },
          assetCount: count(schema.boardAssets.assetId),
        })
        .from(schema.boards)
        .innerJoin(schema.users, eq(schema.boards.creatorId, schema.users.id))
        .leftJoin(
          schema.boardAssets,
          eq(schema.boards.id, schema.boardAssets.boardId)
        )
        .where(whereClause)
        .groupBy(schema.boards.id, schema.users.id)
        .orderBy(desc(schema.boards.updatedAt))
        .limit(limit)
        .offset(offset);

      return {
        boards: boards.map(({ board, creator, assetCount }) => ({
          ...board,
          creator,
          assetCount,
        })),
        limit,
        offset,
      };
    } catch (_error) {
      throw internalError('Failed to get user boards');
    }
  }
}

