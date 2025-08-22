import { db, eq, or, ilike, users, chatParticipants } from '@repo/database'
import { currentUser } from '@clerk/nextjs/server'
import type { User, UserProfile } from '@/types'

export class UserService {
  static async getProfile(): Promise<User | null> {
    const user = await currentUser()
    if (!user) return null

    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, user.id)
    })

    if (!dbUser) return null

    return {
      id: dbUser.clerkId,
      email: user.emailAddresses[0]?.emailAddress,
      full_name: dbUser.name,
      avatar_url: dbUser.pfpUrl
    } as User
  }

  static async updateProfile(
    data: Partial<User>
  ): Promise<User> {
    const user = await currentUser()
    if (!user) throw new Error('Not authenticated')

    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, user.id)
    })
    if (!dbUser) throw new Error('User not found')

    await db.update(users)
      .set({
        name: data.full_name,
        pfpUrl: data.avatar_url,
      })
      .where(eq(users.clerkId, user.id))

    return this.getProfile() as Promise<User>
  }

  static async searchUsers(query: string, limit = 5): Promise<User[]> {
    const user = await currentUser()
    if (!user) throw new Error('Not authenticated')

    // Get current user's database record to exclude from results
    const currentDbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, user.id)
    })
    if (!currentDbUser) throw new Error('Current user not found')

    const foundUsers = await db.query.users.findMany({
      where: or(
        ilike(users.username, `%${query}%`),
        ilike(users.name, `%${query}%`)
      ),
      columns: {
        clerkId: true,
        username: true,
        name: true,
        pfpUrl: true,
      },
      limit
    })

    // Filter out current user
    return foundUsers
      .filter(u => u.clerkId !== user.id)
      .map(u => ({
        id: u.clerkId,
        email: u.username, // Use username as email proxy
        full_name: u.name,
        avatar_url: u.pfpUrl
      })) as User[]
  }

  static async getChatParticipants(chatId: string): Promise<UserProfile[]> {
    const participants = await db.query.chatParticipants.findMany({
      where: eq(chatParticipants.chatId, chatId),
      with: {
        user: {
          columns: {
            clerkId: true,
            username: true,
            name: true,
            pfpUrl: true,
          }
        }
      }
    })

    return participants.map(p => ({
      id: p.user.clerkId,
      email: p.user.username,
      full_name: p.user.name,
      avatar_url: p.user.pfpUrl,
      joined_at: p.joinedAt.toISOString()
    })) as UserProfile[]
  }

  static async createOrUpdateUser(clerkUser: any): Promise<User> {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUser.id)
    })

    if (existingUser) {
      // Update existing user
      await db.update(users)
        .set({
          name: clerkUser.fullName || clerkUser.firstName + ' ' + clerkUser.lastName,
          pfpUrl: clerkUser.imageUrl,
          updatedAt: new Date()
        })
        .where(eq(users.clerkId, clerkUser.id))
      
      return {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        full_name: existingUser.name,
        avatar_url: existingUser.pfpUrl
      } as User
    } else {
      // Create new user
      const [newUser] = await db.insert(users).values({
        clerkId: clerkUser.id,
        username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] || 'user',
        name: clerkUser.fullName || (clerkUser.firstName + ' ' + clerkUser.lastName).trim(),
        pfpUrl: clerkUser.imageUrl,
        passwordHash: 'clerk_managed', // Placeholder since Clerk manages auth
        phoneNumber: clerkUser.phoneNumbers[0]?.phoneNumber || '',
        phoneVerified: clerkUser.phoneNumbers[0]?.verification?.status === 'verified'
      }).returning()

      return {
        id: newUser.clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        full_name: newUser.name,
        avatar_url: newUser.pfpUrl
      } as User
    }
  }
}

// Export both class methods and individual functions for compatibility
export const { 
  getProfile, 
  updateProfile, 
  searchUsers,
  getChatParticipants,
  createOrUpdateUser
} = UserService

// Alias for backward compatibility
export const searchProfiles = searchUsers
export const createProfile = createOrUpdateUser 