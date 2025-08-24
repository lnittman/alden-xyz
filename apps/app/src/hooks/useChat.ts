"use client"

import { useQuery, useMutation } from 'convex/react'
import { api } from '@repo/backend/convex/_generated/api'
import { Id } from '@repo/backend/convex/_generated/dataModel'

// Hook to list user's chats
export function useChats() {
  const chats = useQuery(api.chats.list)
  
  return {
    chats: chats || [],
    isLoading: chats === undefined,
    error: null,
  }
}

// Hook to get chat details
export function useChatDetails(chatId: string) {
  const chat = useQuery(
    api.chats.get,
    chatId ? { id: chatId as Id<"chats"> } : "skip"
  )
  
  return {
    chat,
    isLoading: chat === undefined,
    error: null,
  }
}

// Hook to get chat messages
export function useChatMessages(chatId: string) {
  const messages = useQuery(
    api.messages.list,
    chatId ? { chatId: chatId as Id<"chats"> } : "skip"
  )
  
  return {
    messages: messages || [],
    isLoading: messages === undefined,
    error: null,
  }
}

// Hook to send a message
export function useSendMessage(chatId: string) {
  const sendMessage = useMutation(api.messages.send)
  
  return {
    sendMessage: async (content: string, options?: {
      type?: 'text' | 'image' | 'file' | 'system'
      metadata?: Record<string, any>
      attachments?: Array<{
        storageId: Id<"_storage">
        name?: string
        size?: number
        mimeType?: string
      }>
    }) => {
      return sendMessage({
        chatId: chatId as Id<"chats">,
        content,
        type: options?.type || 'text',
        metadata: options?.metadata,
        attachments: options?.attachments?.map(a => ({
          storageId: a.storageId,
          name: a.name,
          size: a.size,
          mimeType: a.mimeType,
        })),
      })
    },
    isLoading: false,
    error: null,
  }
}

// Hook to create a new chat
export function useCreateChat() {
  const createChat = useMutation(api.chats.create)
  
  return {
    createChat: async (
      memberIds: string[],
      options?: {
        name?: string
        type?: 'direct' | 'group'
      }
    ) => {
      return createChat({
        memberIds: memberIds as Id<"users">[],
        name: options?.name,
        type: options?.type || (memberIds.length === 1 ? 'direct' : 'group'),
      })
    },
    isLoading: false,
    error: null,
  }
}

// Hook to edit a message
export function useEditMessage(messageId: string) {
  const editMessage = useMutation(api.messages.edit)
  
  return {
    editMessage: async (content: string) => {
      return editMessage({
        id: messageId as Id<"messages">,
        content,
      })
    },
    isLoading: false,
    error: null,
  }
}

// Hook to delete a message
export function useDeleteMessage(messageId: string) {
  const deleteMessage = useMutation(api.messages.delete)
  
  return {
    deleteMessage: async () => {
      return deleteMessage({
        id: messageId as Id<"messages">,
      })
    },
    isLoading: false,
    error: null,
  }
}

// Hook to add a reaction
export function useAddReaction(messageId: string) {
  const addReaction = useMutation(api.messages.addReaction)
  
  return {
    addReaction: async (emoji: string) => {
      return addReaction({
        messageId: messageId as Id<"messages">,
        emoji,
      })
    },
    isLoading: false,
    error: null,
  }
}

// Hook to remove a reaction
export function useRemoveReaction(messageId: string) {
  const removeReaction = useMutation(api.messages.removeReaction)
  
  return {
    removeReaction: async (reactionId: string) => {
      return removeReaction({
        id: reactionId as Id<"reactions">,
      })
    },
    isLoading: false,
    error: null,
  }
}

// Hook to mark messages as read
export function useMarkAsRead(chatId: string) {
  const markAsRead = useMutation(api.chats.markAsRead)
  
  return {
    markAsRead: async () => {
      return markAsRead({
        chatId: chatId as Id<"chats">,
      })
    },
    isLoading: false,
    error: null,
  }
}