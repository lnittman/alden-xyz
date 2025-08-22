import { ORPCError } from '@orpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { boardRouter, userRouter } from '../router';

// Mock the services
vi.mock('@repo/services', () => ({
  userService: {
    getUserById: vi.fn(),
    getUserByUsername: vi.fn(),
    updateUser: vi.fn(),
  },
  boardService: {
    createBoard: vi.fn(),
    getBoardById: vi.fn(),
    updateBoard: vi.fn(),
    deleteBoard: vi.fn(),
    getUserBoards: vi.fn(),
  },
  assetService: {},
}));

describe('ORPC Router Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Router', () => {
    describe('get endpoint', () => {
      it('should get current user when no userId provided', async () => {
        const mockUser = {
          id: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
        };

        const { userService } = await import('@repo/services');
        vi.mocked(userService.getUserById).mockResolvedValue(mockUser);

        const context = {
          user: { userId: 'user-123' },
        };

        const handler = userRouter.get.handler;
        const result = await handler({ input: {}, context });

        expect(userService.getUserById).toHaveBeenCalledWith('user-123');
        expect(result).toEqual(mockUser);
      });

      it('should get specific user when userId provided', async () => {
        const mockUser = {
          id: 'user-456',
          username: 'otheruser',
          email: 'other@example.com',
        };

        const { userService } = await import('@repo/services');
        vi.mocked(userService.getUserById).mockResolvedValue(mockUser);

        const context = {
          user: { userId: 'user-123' },
        };

        const handler = userRouter.get.handler;
        const result = await handler({
          input: { userId: 'user-456' },
          context,
        });

        expect(userService.getUserById).toHaveBeenCalledWith('user-456');
        expect(result).toEqual(mockUser);
      });

      it('should throw UNAUTHORIZED when no user context', async () => {
        const context = {
          user: null,
        };

        const handler = userRouter.get.handler;

        await expect(handler({ input: {}, context })).rejects.toThrow(
          ORPCError
        );
      });
    });

    describe('getByUsername endpoint', () => {
      it('should get user by username without auth', async () => {
        const mockUser = {
          id: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
        };

        const { userService } = await import('@repo/services');
        vi.mocked(userService.getUserByUsername).mockResolvedValue(mockUser);

        const context = {
          user: null, // No auth required
        };

        const handler = userRouter.getByUsername.handler;
        const result = await handler({
          input: { username: 'testuser' },
          context,
        });

        expect(userService.getUserByUsername).toHaveBeenCalledWith('testuser');
        expect(result).toEqual(mockUser);
      });
    });

    describe('update endpoint', () => {
      it('should update current user', async () => {
        const updateData = {
          name: 'Updated Name',
          bio: 'Updated bio',
        };

        const mockUpdatedUser = {
          id: 'user-123',
          username: 'testuser',
          ...updateData,
        };

        const { userService } = await import('@repo/services');
        vi.mocked(userService.updateUser).mockResolvedValue(mockUpdatedUser);

        const context = {
          user: { userId: 'user-123' },
        };

        const handler = userRouter.update.handler;
        const result = await handler({
          input: updateData,
          context,
        });

        expect(userService.updateUser).toHaveBeenCalledWith(
          'user-123',
          updateData
        );
        expect(result).toEqual(mockUpdatedUser);
      });

      it('should throw UNAUTHORIZED when no user context', async () => {
        const context = {
          user: null,
        };

        const handler = userRouter.update.handler;

        await expect(
          handler({ input: { name: 'Test' }, context })
        ).rejects.toThrow(ORPCError);
      });
    });
  });

  describe('Board Router', () => {
    describe('create endpoint', () => {
      it('should create a new board', async () => {
        const boardData = {
          title: 'New Board',
          description: 'Board description',
          isPublic: true,
        };

        const mockCreatedBoard = {
          id: 'board-123',
          ...boardData,
          creatorId: 'user-123',
          createdAt: new Date(),
        };

        const { boardService } = await import('@repo/services');
        vi.mocked(boardService.createBoard).mockResolvedValue(mockCreatedBoard);

        const context = {
          user: { userId: 'user-123' },
        };

        const handler = boardRouter.create.handler;
        const result = await handler({
          input: boardData,
          context,
        });

        expect(boardService.createBoard).toHaveBeenCalledWith({
          ...boardData,
          creatorId: 'user-123',
        });
        expect(result).toEqual(mockCreatedBoard);
      });

      it('should throw UNAUTHORIZED when no user context', async () => {
        const context = {
          user: null,
        };

        const handler = boardRouter.create.handler;

        await expect(
          handler({
            input: { title: 'Board', description: 'Desc' },
            context,
          })
        ).rejects.toThrow(ORPCError);
      });
    });

    describe('get endpoint', () => {
      it('should get board by id', async () => {
        const mockBoard = {
          id: 'board-123',
          title: 'Test Board',
          description: 'Board description',
          creatorId: 'user-123',
          isPublic: true,
        };

        const { boardService } = await import('@repo/services');
        vi.mocked(boardService.getBoardById).mockResolvedValue(mockBoard);

        const context = {
          user: null, // Public boards don't require auth
        };

        const handler = boardRouter.get.handler;
        const result = await handler({
          input: { boardId: 'board-123' },
          context,
        });

        expect(boardService.getBoardById).toHaveBeenCalledWith('board-123');
        expect(result).toEqual(mockBoard);
      });
    });

    describe('update endpoint', () => {
      it('should update board', async () => {
        const updateData = {
          boardId: 'board-123',
          title: 'Updated Title',
          description: 'Updated description',
        };

        const mockUpdatedBoard = {
          id: 'board-123',
          title: updateData.title,
          description: updateData.description,
          updatedAt: new Date(),
        };

        const { boardService } = await import('@repo/services');
        vi.mocked(boardService.updateBoard).mockResolvedValue(mockUpdatedBoard);

        const context = {
          user: { userId: 'user-123' },
        };

        const handler = boardRouter.update.handler;
        const result = await handler({
          input: updateData,
          context,
        });

        expect(boardService.updateBoard).toHaveBeenCalledWith('board-123', {
          title: updateData.title,
          description: updateData.description,
        });
        expect(result).toEqual(mockUpdatedBoard);
      });
    });

    describe('delete endpoint', () => {
      it('should delete board', async () => {
        const { boardService } = await import('@repo/services');
        vi.mocked(boardService.deleteBoard).mockResolvedValue(undefined);

        const context = {
          user: { userId: 'user-123' },
        };

        const handler = boardRouter.delete.handler;
        const result = await handler({
          input: { boardId: 'board-123' },
          context,
        });

        expect(boardService.deleteBoard).toHaveBeenCalledWith('board-123');
        expect(result).toEqual({ success: true });
      });
    });

    describe('list endpoint', () => {
      it('should list user boards', async () => {
        const mockBoards = [
          { id: 'board-1', title: 'Board 1' },
          { id: 'board-2', title: 'Board 2' },
        ];

        const { boardService } = await import('@repo/services');
        vi.mocked(boardService.getUserBoards).mockResolvedValue(mockBoards);

        const context = {
          user: { userId: 'user-123' },
        };

        const handler = boardRouter.list.handler;
        const result = await handler({
          input: { limit: 10, offset: 0 },
          context,
        });

        expect(boardService.getUserBoards).toHaveBeenCalledWith('user-123', {
          limit: 10,
          offset: 0,
        });
        expect(result).toEqual(mockBoards);
      });
    });
  });
});
