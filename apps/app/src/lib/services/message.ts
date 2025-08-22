import { db, eq, desc, asc, sql, messages, users } from '@repo/database'
import { currentUser } from '@clerk/nextjs/server'
import type { Message } from '@/types'
import { AIService } from '@/lib/ai/services'
import { EmbeddingService } from '@/lib/ai/embeddings'

export class MessageService {
  static async getMessages(chatId: string, limit = 50): Promise<Message[]> {
    const messageRecords = await db.query.messages.findMany({
      where: eq(messages.chatId, chatId),
      with: {
        sender: {
          columns: {
            name: true,
            username: true,
          }
        }
      },
      orderBy: asc(messages.createdAt),
      limit
    })

    return messageRecords.map(msg => ({
      id: msg.id,
      chat_id: msg.chatId,
      content: msg.content,
      sender_id: msg.senderId,
      created_at: msg.createdAt.toISOString(),
      sender: {
        email: msg.sender.username, // Use username as email proxy
        full_name: msg.sender.name
      },
      embedding: msg.embedding,
      references: msg.references
    })) as Message[]
  }

  static async sendMessage(
    chatId: string,
    content: string
  ): Promise<Message> {
    const user = await currentUser()
    if (!user) throw new Error('Not authenticated')

    // Get current user's database record
    const currentDbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, user.id)
    })
    if (!currentDbUser) throw new Error('User not found in database')

    // Create message
    const [message] = await db.insert(messages).values({
      chatId,
      content,
      senderId: currentDbUser.id
    }).returning()

    // Process message in background
    Promise.all([
      // Generate and store embedding
      EmbeddingService.generateAndStore(content, {
        messageId: message.id,
        chatId
      }),

      // Find similar messages
      AIService.findSimilarMessages(content, chatId)
        .then(async (similarMessages) => {
          if (similarMessages.length > 0) {
            // Generate AI response if needed
            const response = await AIService.generateResponse(
              content,
              similarMessages.map(m => m.content).join('\n')
            )
            // Handle response...
          }
        })
    ]).catch(console.error) // Handle background processing errors

    // Return message with sender info
    const messageWithSender = await db.query.messages.findFirst({
      where: eq(messages.id, message.id),
      with: {
        sender: {
          columns: {
            name: true,
            username: true,
          }
        }
      }
    })

    return {
      id: messageWithSender!.id,
      chat_id: messageWithSender!.chatId,
      content: messageWithSender!.content,
      sender_id: messageWithSender!.senderId,
      created_at: messageWithSender!.createdAt.toISOString(),
      sender: {
        email: messageWithSender!.sender.username,
        full_name: messageWithSender!.sender.name
      },
      embedding: messageWithSender!.embedding,
      references: messageWithSender!.references
    } as Message
  }

  static async updateMessageEmbedding(
    messageId: string,
    embedding: number[]
  ) {
    return db.update(messages)
      .set({ embedding })
      .where(eq(messages.id, messageId))
  }

  static async findSimilarMessages(
    chatId: string,
    embedding: number[],
    limit = 5
  ): Promise<Message[]> {
    const similarMessages = await db.execute(sql`
      SELECT id, content, created_at, sender_id,
             1 - (embedding <=> ${embedding}::vector) as similarity
      FROM ${messages}
      WHERE chat_id = ${chatId}
        AND embedding IS NOT NULL
      ORDER BY similarity DESC
      LIMIT ${limit}
    `)

    return similarMessages.rows.map(row => ({
      id: row.id,
      chat_id: chatId,
      content: row.content,
      sender_id: row.sender_id,
      created_at: row.created_at,
      similarity: row.similarity
    })) as Message[]
  }
}

// Export both class methods and individual functions for compatibility
export const { 
  getMessages, 
  sendMessage, 
  updateMessageEmbedding, 
  findSimilarMessages 
} = MessageService 