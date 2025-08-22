import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { and, eq, desc, asc, isNull, lt } from 'drizzle-orm';
import type { Env } from '../types/env';
import { createDatabaseClient } from '@repo/database';
import { 
  chats, 
  chatMembers, 
  messages, 
  messageAttachments,
  messageReactions,
  messageReads,
  users 
} from '@repo/database';

const app = new Hono<{ Bindings: Env }>();

// Schemas
const createChatSchema = z.object({
  name: z.string().optional(),
  type: z.enum(['direct', 'group']).default('direct'),
  memberIds: z.array(z.string()).min(1),
});

const createMessageSchema = z.object({
  content: z.string().min(1),
  type: z.enum(['text', 'image', 'file', 'system']).default('text'),
  metadata: z.record(z.any()).optional(),
  attachments: z.array(z.object({
    type: z.string(),
    url: z.string(),
    name: z.string().optional(),
    size: z.number().optional(),
    mimeType: z.string().optional(),
  })).optional(),
});

const updateMessageSchema = z.object({
  content: z.string().min(1),
});

const addReactionSchema = z.object({
  emoji: z.string().min(1).max(50),
});

// Middleware to get authenticated user
const requireAuth = async (c: any, next: any) => {
  // Check if user context was already set by main app middleware
  let user = c.get('user');
  
  if (!user) {
    // Try to extract from Authorization header
    const authHeader = c.req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const { verifyToken } = await import('@clerk/backend');
        const verified = await verifyToken(token, {
          secretKey: c.env.CLERK_SECRET_KEY,
        });
        
        if (verified?.sub) {
          user = {
            userId: verified.sub,
            sessionId: verified.sid || '',
            email: verified.email as string | undefined,
          };
          c.set('user', user);
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
      }
    }
  }
  
  if (!user?.userId) {
    throw new HTTPException(401, { message: 'Authentication required' });
  }
  
  await next();
};

// Apply auth to all routes
app.use('*', requireAuth);

// GET /api/chat - List user's chats
app.get('/', async (c) => {
  const user = c.get('user');
  const db = createDatabaseClient(c.env.DATABASE_URL);
  
  const userChats = await db
    .select({
      id: chats.id,
      type: chats.type,
      name: chats.name,
      title: chats.title,
      isArchived: chats.isArchived,
      pinned: chats.pinned,
      createdAt: chats.createdAt,
      updatedAt: chats.updatedAt,
      lastReadAt: chatMembers.lastReadAt
    })
    .from(chats)
    .innerJoin(chatMembers, eq(chats.id, chatMembers.chatId))
    .where(eq(chatMembers.userId, user.userId))
    .orderBy(desc(chats.updatedAt));
  
  return c.json({ success: true, data: userChats });
});

// POST /api/chat - Create a new chat
app.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();
  const data = createChatSchema.parse(body);
  
  const db = createDatabaseClient(c.env.DATABASE_URL);
  
  // Start transaction
  const newChat = await db.transaction(async (tx) => {
    // Create chat
    const [chat] = await tx
      .insert(chats)
      .values({
        name: data.name,
        type: data.type,
        createdBy: user.userId,
      })
      .returning();
    
    // Add members (including creator)
    const memberList = [...new Set([user.userId, ...data.memberIds])];
    await tx.insert(chatMembers).values(
      memberList.map(memberId => ({
        chatId: chat.id,
        userId: memberId,
        role: memberId === user.userId ? 'admin' : 'member',
      }))
    );
    
    return chat;
  });
  
  return c.json({ success: true, data: newChat }, 201);
});

// GET /api/chat/:chatId - Get chat details
app.get('/:chatId', async (c) => {
  const user = c.get('user');
  const chatId = c.req.param('chatId');
  const db = createDatabaseClient(c.env.DATABASE_URL);
  
  // Verify user is member of chat
  const membership = await db
    .select()
    .from(chatMembers)
    .where(and(
      eq(chatMembers.chatId, chatId),
      eq(chatMembers.userId, user.userId)
    ))
    .limit(1);
  
  if (membership.length === 0) {
    throw new HTTPException(404, { message: 'Chat not found' });
  }
  
  // Get chat details
  const [chat] = await db
    .select()
    .from(chats)
    .where(eq(chats.id, chatId))
    .limit(1);

  if (!chat) {
    throw new HTTPException(404, { message: 'Chat not found' });
  }

  // Get chat members separately
  const members = await db
    .select({
      userId: chatMembers.userId,
      role: chatMembers.role,
      joinedAt: chatMembers.joinedAt,
      username: users.username,
      name: users.name,
      imageUrl: users.imageUrl,
      email: users.email,
    })
    .from(chatMembers)
    .leftJoin(users, eq(chatMembers.userId, users.id))
    .where(eq(chatMembers.chatId, chatId));

  const chatData = {
    ...chat,
    members
  };
  
  return c.json({ success: true, data: chatData });
});

// GET /api/chat/:chatId/messages - Get chat messages
app.get('/:chatId/messages', async (c) => {
  const user = c.get('user');
  const chatId = c.req.param('chatId');
  const limit = parseInt(c.req.query('limit') || '50');
  const cursor = c.req.query('cursor');
  
  const db = createDatabaseClient(c.env.DATABASE_URL);
  
  // Verify user is member
  const membership = await db
    .select()
    .from(chatMembers)
    .where(and(
      eq(chatMembers.chatId, chatId),
      eq(chatMembers.userId, user.userId)
    ))
    .limit(1);
  
  if (membership.length === 0) {
    throw new HTTPException(404, { message: 'Chat not found' });
  }
  
  // Build where conditions
  const whereConditions = [
    eq(messages.chatId, chatId),
    eq(messages.isDeleted, false)
  ];
  
  if (cursor) {
    whereConditions.push(lt(messages.createdAt, new Date(cursor)));
  }
  
  const messagesData = await db
    .select({
      id: messages.id,
      chatId: messages.chatId,
      senderId: messages.senderId,
      userId: messages.userId,
      content: messages.content,
      type: messages.type,
      metadata: messages.metadata,
      isDeleted: messages.isDeleted,
      isEdited: messages.isEdited,
      createdAt: messages.createdAt,
      updatedAt: messages.updatedAt,
      senderName: users.name,
      senderUsername: users.username,
      senderImageUrl: users.imageUrl,
    })
    .from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .where(and(...whereConditions))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
  
  // Update last read
  await db
    .update(chatMembers)
    .set({ lastReadAt: new Date() })
    .where(and(
      eq(chatMembers.chatId, chatId),
      eq(chatMembers.userId, user.userId)
    ));
  
  return c.json({ 
    success: true, 
    data: messagesData,
    nextCursor: messagesData.length === limit ? messagesData[messagesData.length - 1].createdAt : null
  });
});

// POST /api/chat/:chatId/messages - Send a message
app.post('/:chatId/messages', async (c) => {
  const user = c.get('user');
  const chatId = c.req.param('chatId');
  const body = await c.req.json();
  const data = createMessageSchema.parse(body);
  
  const db = createDatabaseClient(c.env.DATABASE_URL);
  
  // Verify user is member
  const membership = await db
    .select()
    .from(chatMembers)
    .where(and(
      eq(chatMembers.chatId, chatId),
      eq(chatMembers.userId, user.userId)
    ))
    .limit(1);
  
  if (membership.length === 0) {
    throw new HTTPException(404, { message: 'Chat not found' });
  }
  
  // Create message with attachments
  const newMessage = await db.transaction(async (tx) => {
    const [message] = await tx
      .insert(messages)
      .values({
        chatId,
        senderId: user.userId,
        userId: user.userId, // Same as senderId for consistency
        content: data.content,
        type: data.type,
        metadata: data.metadata,
      })
      .returning();
    
    // Add attachments if provided
    if (data.attachments && data.attachments.length > 0) {
      await tx.insert(messageAttachments).values(
        data.attachments.map(att => ({
          messageId: message.id,
          type: att.type,
          url: att.url,
          name: att.name,
          size: att.size,
          mimeType: att.mimeType,
        }))
      );
    }
    
    // Mark as read by sender
    await tx.insert(messageReads).values({
      messageId: message.id,
      userId: user.userId,
    });
    
    return message;
  });
  
  return c.json({ success: true, data: newMessage }, 201);
});

// PUT /api/chat/:chatId/messages/:messageId - Edit a message
app.put('/:chatId/messages/:messageId', async (c) => {
  const user = c.get('user');
  const messageId = c.req.param('messageId');
  const body = await c.req.json();
  const data = updateMessageSchema.parse(body);
  
  const db = createDatabaseClient(c.env.DATABASE_URL);
  
  // Verify user owns the message
  const [message] = await db
    .select()
    .from(messages)
    .where(and(
      eq(messages.id, messageId),
      eq(messages.userId, user.userId),
      eq(messages.isDeleted, false)
    ))
    .limit(1);
  
  if (!message) {
    throw new HTTPException(404, { message: 'Message not found' });
  }
  
  // Update message
  const [updated] = await db
    .update(messages)
    .set({
      content: data.content,
      isEdited: true,
      updatedAt: new Date(),
    })
    .where(eq(messages.id, messageId))
    .returning();
  
  return c.json({ success: true, data: updated });
});

// DELETE /api/chat/:chatId/messages/:messageId - Delete a message
app.delete('/:chatId/messages/:messageId', async (c) => {
  const user = c.get('user');
  const messageId = c.req.param('messageId');
  
  const db = createDatabaseClient(c.env.DATABASE_URL);
  
  // Verify user owns the message
  const [message] = await db
    .select()
    .from(messages)
    .where(and(
      eq(messages.id, messageId),
      eq(messages.userId, user.userId),
      eq(messages.isDeleted, false)
    ))
    .limit(1);
  
  if (!message) {
    throw new HTTPException(404, { message: 'Message not found' });
  }
  
  // Soft delete
  await db
    .update(messages)
    .set({
      isDeleted: true,
      updatedAt: new Date(),
    })
    .where(eq(messages.id, messageId));
  
  return c.json({ success: true });
});

// POST /api/chat/:chatId/messages/:messageId/reactions - Add reaction
app.post('/:chatId/messages/:messageId/reactions', async (c) => {
  const user = c.get('user');
  const messageId = c.req.param('messageId');
  const body = await c.req.json();
  const data = addReactionSchema.parse(body);
  
  const db = createDatabaseClient(c.env.DATABASE_URL);
  
  // Add or update reaction
  await db
    .insert(messageReactions)
    .values({
      messageId,
      userId: user.userId,
      emoji: data.emoji,
    })
    .onConflictDoUpdate({
      target: [messageReactions.messageId, messageReactions.userId, messageReactions.emoji],
      set: { createdAt: new Date() },
    });
  
  return c.json({ success: true });
});

// DELETE /api/chat/:chatId/messages/:messageId/reactions/:emoji - Remove reaction
app.delete('/:chatId/messages/:messageId/reactions/:emoji', async (c) => {
  const user = c.get('user');
  const messageId = c.req.param('messageId');
  const emoji = c.req.param('emoji');
  
  const db = createDatabaseClient(c.env.DATABASE_URL);
  
  await db
    .delete(messageReactions)
    .where(and(
      eq(messageReactions.messageId, messageId),
      eq(messageReactions.userId, user.userId),
      eq(messageReactions.emoji, emoji)
    ));
  
  return c.json({ success: true });
});

// POST /api/chat/:chatId/read - Mark messages as read
app.post('/:chatId/read', async (c) => {
  const user = c.get('user');
  const chatId = c.req.param('chatId');
  
  const db = createDatabaseClient(c.env.DATABASE_URL);
  
  // Update last read timestamp
  await db
    .update(chatMembers)
    .set({ lastReadAt: new Date() })
    .where(and(
      eq(chatMembers.chatId, chatId),
      eq(chatMembers.userId, user.userId)
    ));
  
  return c.json({ success: true });
});

export default app;