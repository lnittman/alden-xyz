// API Types
export * from './api/chat'
export * from './api/message'
export * from './api/user'

// AI Types
export * from './ai/context'
export * from './ai/embedding' 

export type ChatType = 'personal' | 'direct' | 'group'

export interface Profile {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  created_at: Date
  updated_at: Date
}

export interface ChatParticipant {
  id: string
  chat_id: string
  user_id: string
  joined_at: Date
  last_read_at: Date
  profile: Profile
}

export interface Message {
  id: string
  chat_id: string
  content: string
  sender_id: string
  created_at: Date
  sender: Pick<Profile, 'email' | 'full_name'>
  embedding?: number[] | null
  references?: any | null
}

export interface Chat {
  id: string
  title: string | null
  type: ChatType
  created_at: Date
  updated_at: Date
  created_by: string
  pinned: boolean
  is_archived: boolean
  labels: string[]
}

export interface ChatWithDetails extends Chat {
  chat_participants: ChatParticipant[]
  last_message?: Message
  has_unread?: boolean
} 
