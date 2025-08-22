import { api } from "@/lib/api/client"
import { User, MessageSquare, Link, Hash } from "lucide-react"
import { truncate } from "@/lib/utils"

interface ReferenceDetection {
  type: Reference['type']
  confidence: number
  metadata: Record<string, any>
}

export interface Reference {
  id: string
  type: 'user' | 'message' | 'chat' | 'file' | 'link' | 'topic'
  title: string
  preview?: string
  metadata: {
    icon?: React.ComponentType
    source?: string
    timestamp?: string
    badge?: string
  }
}

export class ReferenceService {
  // Detect reference type from input
  static async detectReference(input: string): Promise<ReferenceDetection> {
    // Check for explicit triggers
    if (input.startsWith('@')) {
      return { 
        type: 'user', 
        confidence: 1,
        metadata: { query: input.slice(1) }
      }
    }
    
    if (input.startsWith('>')) {
      return { 
        type: 'message', 
        confidence: 1,
        metadata: { query: input.slice(1) }
      }
    }
    
    if (input.startsWith('#')) {
      return { 
        type: 'topic', 
        confidence: 1,
        metadata: { query: input.slice(1) }
      }
    }
    
    // URL detection
    if (this.isValidUrl(input)) {
      return { 
        type: 'link', 
        confidence: 1,
        metadata: { url: input }
      }
    }
    
    // Smart detection based on content
    return this.smartDetectReference(input)
  }

  // Find relevant references
  static async findReferences(
    detection: ReferenceDetection,
    context: { chatId: string; token?: string }
  ): Promise<Reference[]> {
    const { type, metadata } = detection
    
    try {
      switch (type) {
        case 'user':
          const usersResponse = await api.get(`/users/search?q=${encodeURIComponent(metadata.query)}&limit=5`, { token: context.token })
          const users = await usersResponse.json()
          return (users || []).map(this.formatUserReference)

        case 'message':
          const messagesResponse = await api.get(`/chats/${context.chatId}/messages/search?q=${encodeURIComponent(metadata.query)}&limit=5`, { token: context.token })
          const messages = await messagesResponse.json()
          return (messages || []).map(this.formatMessageReference)

        case 'chat':
          const chatsResponse = await api.get(`/chats/search?q=${encodeURIComponent(metadata.query)}&limit=5`, { token: context.token })
          const chats = await chatsResponse.json()
          return (chats || []).map(this.formatChatReference)

        case 'file':
          const filesResponse = await api.get(`/chats/${context.chatId}/files/search?q=${encodeURIComponent(metadata.query)}&limit=5`, { token: context.token })
          const files = await filesResponse.json()
          return (files || []).map(this.formatFileReference)

        case 'link':
          return [{
            id: 'new-link',
            type: 'link',
            title: metadata.url,
            preview: 'Add new link',
            metadata: {
              icon: Link,
              source: 'web'
            }
          }]

        case 'topic':
          const topicsResponse = await api.get(`/topics/search?q=${encodeURIComponent(metadata.query)}&limit=5`, { token: context.token })
          const topics = await topicsResponse.json()
          return (topics || []).map(this.formatTopicReference)

        default:
          return []
      }
    } catch (error) {
      console.error('Error finding references:', error)
      return []
    }
  }

  // Reference formatting helpers
  private static formatUserReference(user: any): Reference {
    return {
      id: user.id,
      type: 'user',
      title: user.full_name,
      preview: user.email,
      metadata: {
        icon: User,
        badge: user.role,
        source: 'team'
      }
    }
  }

  private static formatMessageReference(message: any): Reference {
    return {
      id: message.id,
      type: 'message',
      title: truncate(message.content, 50),
      preview: `${message.sender?.full_name} · ${formatRelativeTime(message.created_at)}`,
      metadata: {
        icon: MessageSquare,
        timestamp: formatRelativeTime(message.created_at)
      }
    }
  }

  private static formatChatReference(chat: any): Reference {
    return {
      id: chat.id,
      type: 'chat',
      title: chat.title,
      preview: `${chat.message_count || 0} messages`,
      metadata: {
        icon: MessageSquare,
        timestamp: formatRelativeTime(chat.updated_at)
      }
    }
  }

  private static formatFileReference(file: any): Reference {
    return {
      id: file.id,
      type: 'file',
      title: file.name,
      preview: `${file.size_formatted} · ${file.type}`,
      metadata: {
        icon: Link,
        timestamp: formatRelativeTime(file.created_at)
      }
    }
  }

  private static formatTopicReference(topic: any): Reference {
    return {
      id: topic.id,
      type: 'topic',
      title: `#${topic.name}`,
      preview: `${topic.reference_count || 0} references`,
      metadata: {
        icon: Hash,
        badge: topic.category
      }
    }
  }

  // Utility functions
  private static isValidUrl(str: string): boolean {
    try {
      new URL(str)
      return true
    } catch {
      return false
    }
  }

  private static async smartDetectReference(input: string): Promise<ReferenceDetection> {
    // Default to searching all types
    return {
      type: 'message',
      confidence: 0.5,
      metadata: { query: input }
    }
  }
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}