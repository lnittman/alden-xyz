import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserService } from '../user';

// Mock the database module
vi.mock('@repo/database', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    from: vi.fn(),
    transaction: vi.fn((callback: any) =>
      callback({
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      })
    ),
  },
  schema: {
    users: 'users',
    boards: 'boards',
    boardCollaborators: 'boardCollaborators',
    assets: 'assets',
    boardAssets: 'boardAssets',
    comments: 'comments',
    likedBoards: 'likedBoards',
    viewedBoards: 'viewedBoards',
  },
  eq: vi.fn((a, b) => ({ type: 'eq', a, b })),
  and: vi.fn((...args) => ({ type: 'and', args })),
  or: vi.fn((...args) => ({ type: 'or', args })),
  desc: vi.fn((a) => ({ type: 'desc', a })),
  count: vi.fn(() => ({ type: 'count' })),
  sql: vi.fn((strings: any, ...values: any[]) => ({
    type: 'sql',
    strings,
    values,
  })),
}));

describe('UserService', () => {
  let userService: UserService;
  let db: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const database = await import('@repo/database');
    db = database.db;
    userService = new UserService();
  });

  describe('getUserById', () => {
    it('should fetch user with all related data', async () => {
      const mockUser = {
        id: 'user-123',
        username: 'johndoe',
        email: 'john@example.com',
        name: 'John Doe',
        bio: 'Software Engineer',
        clerkId: 'clerk-123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      };

      // Mock the database calls
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([mockUser]),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: '3' }]),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockReturnValue({
                limit: vi
                  .fn()
                  .mockResolvedValue([
                    { board: { id: 'board-1', name: 'Project A' } },
                    { board: { id: 'board-2', name: 'Project B' } },
                  ]),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue([
                    {
                      board: { id: 'board-3', name: 'Shared Project' },
                      accessLevel: 'editor',
                      joinedAt: new Date('2024-01-10'),
                    },
                  ]),
                }),
              }),
            }),
          }),
        });

      const result = await userService.getUserById('user-123');

      expect(result).toBeDefined();
      expect(result.id).toBe('user-123');
      expect(result.username).toBe('johndoe');
      expect(result.boardCount).toBe(3);
      expect(result.recentBoards).toHaveLength(2);
      expect(result.collaborations).toHaveLength(1);
    });

    it('should throw error when user not found', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(userService.getUserById('non-existent')).rejects.toThrow(
        'User not found'
      );
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error('Connection failed')),
          }),
        }),
      });

      await expect(userService.getUserById('user-123')).rejects.toThrow(
        'Failed to fetch user'
      );
    });
  });

  describe('getUserByUsername', () => {
    it('should find user by username', async () => {
      const mockUser = {
        id: 'user-456',
        username: 'janedoe',
        email: 'jane@example.com',
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const result = await userService.getUserByUsername('janedoe');
      expect(result.username).toBe('janedoe');
    });

    it('should throw when username not found', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(
        userService.getUserByUsername('nonexistent')
      ).rejects.toThrow('User not found');
    });
  });

  describe('getUserByClerkId', () => {
    it('should find user by Clerk ID', async () => {
      const mockUser = {
        id: 'user-123',
        clerkId: 'clerk-123',
        username: 'testuser',
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const result = await userService.getUserByClerkId('clerk-123');
      expect(result.clerkId).toBe('clerk-123');
    });
  });

  describe('getUserByEmail', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
      };

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const result = await userService.getUserByEmail('test@example.com');
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('createUser', () => {
    it('should create new user', async () => {
      const newUserData = {
        username: 'newuser',
        email: 'new@example.com',
        passwordHash: 'hashed_password',
        name: 'New User',
      };

      const createdUser = {
        id: 'user-789',
        ...newUserData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([createdUser]),
        }),
      });

      const result = await userService.createUser(newUserData);
      expect(result.id).toBe('user-789');
      expect(result.username).toBe('newuser');
    });

    it('should handle creation errors', async () => {
      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error('Insert failed')),
        }),
      });

      await expect(
        userService.createUser({
          username: 'test',
          email: 'test@example.com',
          passwordHash: 'hash',
        })
      ).rejects.toThrow('Failed to create user');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        bio: 'Updated bio',
      };

      const mockUpdatedUser = {
        id: 'user-123',
        ...updateData,
        updatedAt: new Date(),
      };

      // Mock user exists check
      vi.mocked(db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 'user-123' }]),
          }),
        }),
      });

      // Mock update
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockUpdatedUser]),
          }),
        }),
      });

      const result = await userService.updateUser('user-123', updateData);
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw notFound when user does not exist', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

      await expect(
        userService.updateUser('nonexistent', { name: 'Test' })
      ).rejects.toThrow('User not found');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      });

      await expect(userService.deleteUser('user-123')).resolves.toBeUndefined();
      expect(db.delete).toHaveBeenCalled();
    });

    it('should handle deletion errors', async () => {
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockRejectedValue(new Error('Delete failed')),
      });

      await expect(userService.deleteUser('user-123')).rejects.toThrow(
        'Failed to delete user'
      );
    });
  });

  describe('listUsers', () => {
    it('should list users with pagination', async () => {
      const mockUsers = [
        { id: 'user-1', username: 'user1', email: 'user1@example.com' },
        { id: 'user-2', username: 'user2', email: 'user2@example.com' },
      ];

      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockResolvedValue(mockUsers),
            }),
          }),
        }),
      });

      const result = await userService.listUsers({ limit: 10, offset: 0 });
      expect(result).toHaveLength(2);
    });
  });
});
