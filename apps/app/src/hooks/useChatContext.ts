"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api/client"
import { AIService } from "@/lib/ai/services"

interface ChatContext {
  summary: {
    title: string
    description: string
    keyPhrases: string[]
  }
  topics: Array<{
    id: string
    title: string
    count: number
    relevance: number
  }>
  files: Array<{
    id: string
    name: string
    type: string
    lastModified: string
    relevance: number
  }>
  participants: Array<{
    id: string
    name: string
    email: string
    avatar?: string
    lastActive?: string
    contributions?: number
  }>
  isLoading: boolean
  error: Error | null
}

export function useChatContext(chatId: string): ChatContext {
  const [context, setContext] = useState<ChatContext>({
    summary: {
      title: "",
      description: "",
      keyPhrases: []
    },
    topics: [],
    files: [],
    participants: [],
    isLoading: true,
    error: null
  })

  useEffect(() => {
    let isMounted = true

    const fetchContext = async () => {
      try {
        // Get chat data with messages and participants
        const chatResponse = await api.get(`/chats/${chatId}`)
        const chat = await chatResponse.json()
        
        // Get messages for the chat
        const messagesResponse = await api.get(`/chats/${chatId}/messages`)
        const messages = await messagesResponse.json()

        // Get messages content for analysis
        const messagesContent = (messages || []).map((m: any) => m.content).join('\n')

        // Analyze chat context
        const analysis = await AIService.analyzeMessage(messagesContent, {
          recentMessages: [],
          threadContext: chatId
        })

        // Get files
        const filesResponse = await api.get(`/chats/${chatId}/files`)
        const files = await filesResponse.json()

        if (isMounted) {
          setContext(prev => ({
            ...prev,
            summary: {
              title: chat?.title as string || '',
              description: analysis?.summary || '',
              keyPhrases: analysis?.topics || []
            },
            topics: analysis?.topics?.map((topic, i) => ({
              id: `topic-${i}`,
              title: topic,
              count: 0,
              relevance: 0.8
            })) || [],
            files: (files || []).map(file => ({
              id: String(file.id),
              name: String(file.name),
              type: String(file.type),
              lastModified: String(file.updated_at),
              relevance: Number(file.relevance) || 0
            })),
            participants: (chat?.participants || []).map((p: any) => ({
              id: p.userId,
              name: p.user?.fullName || p.user?.email?.split('@')[0] || 'Unknown',
              email: p.user?.email || '',
              avatar: p.user?.avatarUrl,
              lastActive: p.lastReadAt,
              contributions: 0
            })),
            isLoading: false,
            error: null
          }))
        }
      } catch (error) {
        console.error('Error fetching chat context:', error)
        if (isMounted) {
          setContext(prev => ({
            ...prev,
            isLoading: false,
            error: error as Error
          }))
        }
      }
    }

    fetchContext()

    return () => {
      isMounted = false
    }
  }, [chatId])

  return context
} 