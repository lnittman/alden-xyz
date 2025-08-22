import { db, eq, and, desc, sql, chats, chatParticipants, messages, users } from '@repo/database'
import { currentUser } from '@clerk/nextjs/server'
import type { Chat, ChatType, ChatWithDetails } from '@/types'

export interface GetChatsOptions {
  archived?: boolean
  type?: ChatType
  search?: string
  labels?: string[]
}

export class ChatService {
  static async getChat(chatId: string): Promise<ChatWithDetails | null> {
    const user = await currentUser()
    if (!user) throw new Error('Not authenticated')

    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
      with: {
        participants: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                username: true,
                pfpUrl: true,
              }
            }
          }
        }
      }
    })

    if (!chat) return null

    // Check if user is participant
    const isParticipant = chat.participants.some(p => p.user.clerkId === user.id)
    if (!isParticipant) throw new Error('Access denied')

    return chat as unknown as ChatWithDetails
  }

  static async createChat(
    userIds: string[] = [], 
    type: ChatType = 'personal'
  ): Promise<Chat> {
    const user = await currentUser()
    if (!user) throw new Error('Not authenticated')

    // Get current user's database record
    const currentDbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, user.id)
    })
    if (!currentDbUser) throw new Error('User not found in database')

    let title = ''
    if (type === 'direct' && userIds.length === 1) {
      const otherUser = await db.query.users.findFirst({
        where: eq(users.clerkId, userIds[0]),
        columns: { name: true, username: true }
      })

      if (otherUser) {
        title = otherUser.name || otherUser.username || 'User'
      }
    }

    // Create chat
    const [newChat] = await db.insert(chats).values({
      type,
      title,
      createdBy: currentDbUser.id
    }).returning()

    // Add participants (convert Clerk IDs to database user IDs)
    const participantUsers = await db.query.users.findMany({
      where: eq(users.clerkId, userIds[0] || user.id),
      columns: { id: true, clerkId: true }
    })

    const participantInserts = [
      { chatId: newChat.id, userId: currentDbUser.id }, // Creator
      ...participantUsers.map(u => ({ chatId: newChat.id, userId: u.id }))
    ]

    await db.insert(chatParticipants).values(participantInserts)

    return newChat as unknown as Chat
  }

  static async getChats(options: GetChatsOptions = {}) {
    const user = await currentUser()
    if (!user) throw new Error('Not authenticated')

    // Get current user's database record
    const currentDbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, user.id)
    })
    if (!currentDbUser) throw new Error('User not found')

    const whereConditions = [
      eq(chatParticipants.userId, currentDbUser.id)
    ]

    // Apply filters
    if (typeof options.archived === 'boolean') {
      whereConditions.push(eq(chats.isArchived, options.archived))
    }
    if (options.type) {
      whereConditions.push(eq(chats.type, options.type))
    }
    if (options.search) {
      whereConditions.push(sql`${chats.title} ILIKE ${`%${options.search}%`}`)
    }
    if (options.labels?.length) {
      whereConditions.push(sql`${chats.labels} @> ${JSON.stringify(options.labels)}`)
    }

    const userChats = await db
      .select({
        chat: chats,
        participant: chatParticipants,
      })
      .from(chats)
      .innerJoin(chatParticipants, eq(chats.id, chatParticipants.chatId))
      .where(and(...whereConditions))
      .orderBy(desc(chats.pinned), desc(chats.createdAt))

    return userChats.map(({ chat, participant }) => {
      const hasUnread = chat.lastMessage && participant.lastReadAt 
        ? new Date(chat.lastMessage.created_at) > new Date(participant.lastReadAt)
        : false

      return {
        ...chat,
        has_unread: hasUnread
      }
    }) as ChatWithDetails[]
  }

  static async updateChatTitle(chatId: string, title: string) {
    await db.update(chats)
      .set({ title })
      .where(eq(chats.id, chatId))
  }

  static async updateChatReadStatus(chatId: string) {
    const user = await currentUser()
    if (!user) throw new Error('Not authenticated')

    // Get current user's database record
    const currentDbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, user.id)
    })
    if (!currentDbUser) throw new Error('User not found')

    await db.update(chatParticipants)
      .set({ lastReadAt: new Date() })
      .where(and(
        eq(chatParticipants.chatId, chatId),
        eq(chatParticipants.userId, currentDbUser.id)
      ))
  }

  static async archiveChat(chatId: string) {
    await db.update(chats)
      .set({ isArchived: true })
      .where(eq(chats.id, chatId))
  }

  static async unarchiveChat(chatId: string) {
    await db.update(chats)
      .set({ isArchived: false })
      .where(eq(chats.id, chatId))
  }

  static async toggleChatPin(chatId: string) {
    const chat = await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
      columns: { pinned: true }
    })

    if (chat) {
      await db.update(chats)
        .set({ pinned: !chat.pinned })
        .where(eq(chats.id, chatId))
    }
  }

  static async updateChatLabels(chatId: string, labels: string[]) {
    await db.update(chats)
      .set({ labels })
      .where(eq(chats.id, chatId))
  }

  static async deleteChat(chatId: string) {
    await db.delete(chats)
      .where(eq(chats.id, chatId))
  }
}

// Export both class methods and individual functions for compatibility
export const { 
  getChat, 
  createChat, 
  getChats, 
  updateChatTitle, 
  updateChatReadStatus, 
  archiveChat, 
  unarchiveChat, 
  toggleChatPin, 
  updateChatLabels, 
  deleteChat 
} = ChatService 