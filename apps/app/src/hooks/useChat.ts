"use client"

import { useState, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import useSWR, { mutate } from 'swr'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

interface Chat {
  id: string
  name?: string
  type: 'direct' | 'group'
  avatarUrl?: string
  metadata?: Record<string, any>
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

interface Message {
  id: string
  chatId: string
  userId: string
  content: string
  type: 'text' | 'image' | 'file' | 'system'
  metadata?: Record<string, any>
  editedAt?: Date
  deletedAt?: Date
  createdAt: Date
  updatedAt: Date
}

interface ChatWithLastMessage {
  chat: Chat
  lastMessage?: Message
  unreadCount: number
}

// Fetcher with auth
async function fetcherWithAuth(url: string, token: string) {
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    throw error
  }
  
  const data = await res.json()
  return data.data
}

// Hook to list user's chats
export function useChats() {
  const { getToken } = useAuth()
  
  const { data, error, isLoading } = useSWR<ChatWithLastMessage[]>(
    [`${API_URL}/api/chat`, getToken],
    async ([url]) => {
      const token = await getToken()
      if (!token) throw new Error('No auth token')
      return fetcherWithAuth(url, token)
    }
  )
  
  return {
    chats: data || [],
    isLoading,
    error,
  }
}

// Hook to get chat details
export function useChatDetails(chatId: string) {
  const { getToken } = useAuth()
  
  const { data, error, isLoading } = useSWR(
    chatId ? [`${API_URL}/api/chat/${chatId}`, getToken] : null,
    async ([url]) => {
      const token = await getToken()
      if (!token) throw new Error('No auth token')
      return fetcherWithAuth(url, token)
    }
  )
  
  return {
    chat: data,
    isLoading,
    error,
  }
}

// Hook to get chat messages
export function useChatMessages(chatId: string, limit = 50) {
  const { getToken } = useAuth()
  const [cursor, setCursor] = useState<string | null>(null)
  
  const { data, error, isLoading } = useSWR(
    chatId ? [`${API_URL}/api/chat/${chatId}/messages?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`, getToken] : null,
    async ([url]) => {
      const token = await getToken()
      if (!token) throw new Error('No auth token')
      return fetcherWithAuth(url, token)
    }
  )
  
  const loadMore = useCallback(() => {
    if (data?.nextCursor) {
      setCursor(data.nextCursor)
    }
  }, [data])
  
  return {
    messages: data?.data || [],
    nextCursor: data?.nextCursor,
    isLoading,
    error,
    loadMore,
    hasMore: !!data?.nextCursor,
  }
}

// Hook to send a message
export function useSendMessage(chatId: string) {
  const { getToken } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const sendMessage = useCallback(async (
    content: string, 
    options?: {
      type?: 'text' | 'image' | 'file' | 'system'
      metadata?: Record<string, any>
      attachments?: Array<{
        type: string
        url: string
        name?: string
        size?: number
        mimeType?: string
      }>
    }
  ) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const token = await getToken()
      if (!token) throw new Error('No auth token')
      
      const res = await fetch(`${API_URL}/api/chat/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          type: options?.type || 'text',
          metadata: options?.metadata,
          attachments: options?.attachments,
        }),
      })
      
      if (!res.ok) {
        throw new Error('Failed to send message')
      }
      
      const data = await res.json()
      
      // Refresh messages
      mutate([`${API_URL}/api/chat/${chatId}/messages?limit=50`, getToken])
      
      return data.data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [chatId, getToken])
  
  return {
    sendMessage,
    isLoading,
    error,
  }
}

// Hook to create a new chat
export function useCreateChat() {
  const { getToken } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const createChat = useCallback(async (
    memberIds: string[],
    options?: {
      name?: string
      type?: 'direct' | 'group'
    }
  ) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const token = await getToken()
      if (!token) throw new Error('No auth token')
      
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberIds,
          name: options?.name,
          type: options?.type || (memberIds.length === 1 ? 'direct' : 'group'),
        }),
      })
      
      if (!res.ok) {
        throw new Error('Failed to create chat')
      }
      
      const data = await res.json()
      
      // Refresh chats list
      mutate([`${API_URL}/api/chat`, getToken])
      
      return data.data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [getToken])
  
  return {
    createChat,
    isLoading,
    error,
  }
}

// Hook to edit a message
export function useEditMessage(chatId: string, messageId: string) {
  const { getToken } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const editMessage = useCallback(async (content: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const token = await getToken()
      if (!token) throw new Error('No auth token')
      
      const res = await fetch(`${API_URL}/api/chat/${chatId}/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })
      
      if (!res.ok) {
        throw new Error('Failed to edit message')
      }
      
      const data = await res.json()
      
      // Refresh messages
      mutate([`${API_URL}/api/chat/${chatId}/messages?limit=50`, getToken])
      
      return data.data
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [chatId, messageId, getToken])
  
  return {
    editMessage,
    isLoading,
    error,
  }
}

// Hook to delete a message
export function useDeleteMessage(chatId: string, messageId: string) {
  const { getToken } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const deleteMessage = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const token = await getToken()
      if (!token) throw new Error('No auth token')
      
      const res = await fetch(`${API_URL}/api/chat/${chatId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!res.ok) {
        throw new Error('Failed to delete message')
      }
      
      // Refresh messages
      mutate([`${API_URL}/api/chat/${chatId}/messages?limit=50`, getToken])
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [chatId, messageId, getToken])
  
  return {
    deleteMessage,
    isLoading,
    error,
  }
}

// Hook to add a reaction
export function useAddReaction(chatId: string, messageId: string) {
  const { getToken } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const addReaction = useCallback(async (emoji: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const token = await getToken()
      if (!token) throw new Error('No auth token')
      
      const res = await fetch(`${API_URL}/api/chat/${chatId}/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji }),
      })
      
      if (!res.ok) {
        throw new Error('Failed to add reaction')
      }
      
      // Refresh messages
      mutate([`${API_URL}/api/chat/${chatId}/messages?limit=50`, getToken])
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [chatId, messageId, getToken])
  
  return {
    addReaction,
    isLoading,
    error,
  }
}

// Hook to remove a reaction
export function useRemoveReaction(chatId: string, messageId: string) {
  const { getToken } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const removeReaction = useCallback(async (emoji: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const token = await getToken()
      if (!token) throw new Error('No auth token')
      
      const res = await fetch(`${API_URL}/api/chat/${chatId}/messages/${messageId}/reactions/${emoji}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!res.ok) {
        throw new Error('Failed to remove reaction')
      }
      
      // Refresh messages
      mutate([`${API_URL}/api/chat/${chatId}/messages?limit=50`, getToken])
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [chatId, messageId, getToken])
  
  return {
    removeReaction,
    isLoading,
    error,
  }
}

// Hook to mark messages as read
export function useMarkAsRead(chatId: string) {
  const { getToken } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  const markAsRead = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const token = await getToken()
      if (!token) throw new Error('No auth token')
      
      const res = await fetch(`${API_URL}/api/chat/${chatId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (!res.ok) {
        throw new Error('Failed to mark as read')
      }
      
      // Refresh chats list to update unread counts
      mutate([`${API_URL}/api/chat`, getToken])
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [chatId, getToken])
  
  return {
    markAsRead,
    isLoading,
    error,
  }
}