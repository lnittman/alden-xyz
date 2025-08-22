import { type DatabaseClient } from '@repo/database';
import {
  and,
  count,
  desc,
  eq,
  inArray,
  like,
  schema,
  sql,
} from '@repo/database';
import {
  ServiceError,
  internalError,
  notFound,
  unauthorized,
} from './lib/errors';

export class AssetService {
  constructor(private db: DatabaseClient) {}
  async createAsset(
    userId: string,
    data: {
      name: string;
      url: string;
      type: string; // image, video, audio, gif, text, file
      thumbnailUrl?: string;
      storageKey?: string;
      width?: number;
      height?: number;
      duration?: number;
      size?: number;
      mimeType?: string;
      metadata?: Record<string, any>;
    }
  ) {
    try {
      const [asset] = await this.db
        .insert(schema.assets)
        .values({
          ...data,
          creatorId: userId,
        })
        .returning();

      return asset;
    } catch (_error) {
      throw internalError('Failed to create asset');
    }
  }

  async getAssetById(assetId: string) {
    try {
      const [asset] = await this.db
        .select({
          asset: schema.assets,
          creator: {
            id: schema.users.id,
            username: schema.users.username,
            name: schema.users.name,
            pfpUrl: schema.users.pfpUrl,
          },
        })
        .from(schema.assets)
        .innerJoin(schema.users, eq(schema.assets.creatorId, schema.users.id))
        .where(eq(schema.assets.id, assetId))
        .limit(1);

      if (!asset) {
        throw notFound('Asset not found');
      }

      return {
        ...asset.asset,
        creator: asset.creator,
      };
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to fetch asset');
    }
  }

  async updateAsset(
    assetId: string,
    userId: string,
    data: Partial<{
      name: string;
      thumbnailUrl: string;
      metadata: Record<string, any>;
    }>
  ) {
    try {
      // Check ownership
      const [asset] = await this.db
        .select()
        .from(schema.assets)
        .where(eq(schema.assets.id, assetId))
        .limit(1);

      if (!asset) {
        throw notFound('Asset not found');
      }

      if (asset.creatorId !== userId) {
        throw unauthorized('You can only update your own assets');
      }

      const [updatedAsset] = await this.db
        .update(schema.assets)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(schema.assets.id, assetId))
        .returning();

      return updatedAsset;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to update asset');
    }
  }

  async deleteAsset(assetId: string, userId: string) {
    try {
      // Check ownership
      const [asset] = await this.db
        .select()
        .from(schema.assets)
        .where(eq(schema.assets.id, assetId))
        .limit(1);

      if (!asset) {
        throw notFound('Asset not found');
      }

      if (asset.creatorId !== userId) {
        throw unauthorized('You can only delete your own assets');
      }

      // Delete the asset (cascade will handle related records)
      await this.db.delete(schema.assets).where(eq(schema.assets.id, assetId));

      // TODO: Delete from storage provider if storageKey exists
      if (asset.storageKey) {
      }
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to delete asset');
    }
  }

  async listAssets(options: {
    userId?: string;
    type?: string;
    search?: string;
    limit?: number;
    offset?: number;
    orderBy?: 'createdAt' | 'updatedAt' | 'name';
    order?: 'asc' | 'desc';
  }) {
    try {
      const conditions = [];

      // Filter by creator
      if (options.userId) {
        conditions.push(eq(schema.assets.creatorId, options.userId));
      }

      // Filter by type
      if (options.type) {
        conditions.push(eq(schema.assets.type, options.type));
      }

      // Search by name
      if (options.search) {
        conditions.push(like(schema.assets.name, `%${options.search}%`));
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
          asset: schema.assets,
          creator: {
            id: schema.users.id,
            username: schema.users.username,
            name: schema.users.name,
            pfpUrl: schema.users.pfpUrl,
          },
          boardCount: count(schema.boardAssets.boardId),
        })
        .from(schema.assets)
        .innerJoin(schema.users, eq(schema.assets.creatorId, schema.users.id))
        .leftJoin(
          schema.boardAssets,
          eq(schema.boardAssets.assetId, schema.assets.id)
        )
        .where(whereClause)
        .groupBy(schema.assets.id, schema.users.id)
        .orderBy(
          orderDirection === 'desc'
            ? desc(schema.assets.createdAt)
            : schema.assets.createdAt
        )
        .limit(limit)
        .offset(offset);

      return results.map((r) => ({
        ...r.asset,
        creator: r.creator,
        boardCount: Number(r.boardCount),
      }));
    } catch (_error) {
      throw internalError('Failed to list assets');
    }
  }

  async getAssetsByIds(assetIds: string[]) {
    try {
      const assets = await this.db
        .select({
          asset: schema.assets,
          creator: {
            id: schema.users.id,
            username: schema.users.username,
            name: schema.users.name,
            pfpUrl: schema.users.pfpUrl,
          },
        })
        .from(schema.assets)
        .innerJoin(schema.users, eq(schema.assets.creatorId, schema.users.id))
        .where(inArray(schema.assets.id, assetIds));

      return assets.map((a) => ({
        ...a.asset,
        creator: a.creator,
      }));
    } catch (_error) {
      throw internalError('Failed to fetch assets');
    }
  }

  async getUserRecentAssets(userId: string, limit = 20) {
    try {
      const recentAssets = await this.db
        .select({
          asset: schema.assets,
          usedAt: schema.recentAssets.usedAt,
        })
        .from(schema.recentAssets)
        .innerJoin(
          schema.assets,
          eq(schema.recentAssets.assetId, schema.assets.id)
        )
        .where(eq(schema.recentAssets.userId, userId))
        .orderBy(desc(schema.recentAssets.usedAt))
        .limit(limit);

      return recentAssets;
    } catch (_error) {
      throw internalError('Failed to fetch recent assets');
    }
  }

  async trackAssetUse(userId: string, assetId: string) {
    try {
      // Check if record exists
      const [existing] = await this.db
        .select()
        .from(schema.recentAssets)
        .where(
          and(
            eq(schema.recentAssets.userId, userId),
            eq(schema.recentAssets.assetId, assetId)
          )
        )
        .limit(1);

      if (existing) {
        // Update timestamp
        await this.db
          .update(schema.recentAssets)
          .set({ usedAt: new Date() })
          .where(
            and(
              eq(schema.recentAssets.userId, userId),
              eq(schema.recentAssets.assetId, assetId)
            )
          );
      } else {
        // Create new record
        await this.db.insert(schema.recentAssets).values({
          userId,
          assetId,
        });
      }
    } catch (_error) {
      // Don't throw, just log error
    }
  }

  async likeAsset(userId: string, assetId: string) {
    try {
      // Check if asset exists
      const [asset] = await this.db
        .select()
        .from(schema.assets)
        .where(eq(schema.assets.id, assetId))
        .limit(1);

      if (!asset) {
        throw notFound('Asset not found');
      }

      // Check if already liked
      const [existing] = await this.db
        .select()
        .from(schema.likedAssets)
        .where(
          and(
            eq(schema.likedAssets.userId, userId),
            eq(schema.likedAssets.assetId, assetId)
          )
        )
        .limit(1);

      if (existing) {
        // Unlike
        await this.db
          .delete(schema.likedAssets)
          .where(
            and(
              eq(schema.likedAssets.userId, userId),
              eq(schema.likedAssets.assetId, assetId)
            )
          );

        return { liked: false };
      }
      // Like
      await this.db.insert(schema.likedAssets).values({
        userId,
        assetId,
      });

      return { liked: true };
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to like/unlike asset');
    }
  }

  async trackAssetView(userId: string, assetId: string) {
    try {
      // Check if record exists
      const [existing] = await this.db
        .select()
        .from(schema.viewedAssets)
        .where(
          and(
            eq(schema.viewedAssets.userId, userId),
            eq(schema.viewedAssets.assetId, assetId)
          )
        )
        .limit(1);

      if (existing) {
        // Increment view count
        await this.db
          .update(schema.viewedAssets)
          .set({
            viewCount: existing.viewCount + 1,
            lastViewed: new Date(),
          })
          .where(
            and(
              eq(schema.viewedAssets.userId, userId),
              eq(schema.viewedAssets.assetId, assetId)
            )
          );
      } else {
        // Create new record
        await this.db.insert(schema.viewedAssets).values({
          userId,
          assetId,
        });
      }
    } catch (_error) {
      // Don't throw, just log error
    }
  }

  async getAssetStats(assetId: string) {
    try {
      const [likes, views, boards] = await Promise.all([
        // Count likes
        this.db
          .select({ count: count() })
          .from(schema.likedAssets)
          .where(eq(schema.likedAssets.assetId, assetId)),

        // Sum views
        this.db
          .select({
            totalViews: sql<number>`SUM(${schema.viewedAssets.viewCount})`,
            uniqueViews: count(),
          })
          .from(schema.viewedAssets)
          .where(eq(schema.viewedAssets.assetId, assetId)),

        // Count boards using this asset
        this.db
          .select({ count: count() })
          .from(schema.boardAssets)
          .where(eq(schema.boardAssets.assetId, assetId)),
      ]);

      return {
        likes: Number(likes[0]?.count || 0),
        totalViews: Number(views[0]?.totalViews || 0),
        uniqueViews: Number(views[0]?.uniqueViews || 0),
        boardsUsing: Number(boards[0]?.count || 0),
      };
    } catch (_error) {
      throw internalError('Failed to fetch asset stats');
    }
  }
}

