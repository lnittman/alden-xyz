"use client"

import { useState, useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "@repo/backend/convex/_generated/api"
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
  // Query chat data
  const chat = useQuery(api.chats.get, { chatId })
  const messages = useQuery(api.messages.list, { chatId })
  const participants = useQuery(api.chats.getParticipants, { chatId })
  
  const [analysis, setAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Analyze messages when they change
  useEffect(() => {
    if (!messages || messages.length === 0) return

    let isMounted = true
    setIsAnalyzing(true)

    const analyzeMessages = async () => {
      try {
        const messagesContent = messages.map((m: any) => m.content).join('\n')
        const result = await AIService.analyzeMessage(messagesContent, {
          recentMessages: [],
          threadContext: chatId
        })
        
        if (isMounted) {
          setAnalysis(result)
          setIsAnalyzing(false)
        }
      } catch (error) {
        console.error('Error analyzing messages:', error)
        if (isMounted) {
          setIsAnalyzing(false)
        }
      }
    }

    analyzeMessages()

    return () => {
      isMounted = false
    }
  }, [messages, chatId])

  // Build context from queries
  const context: ChatContext = {
    summary: {
      title: chat?.title || '',
      description: analysis?.summary || '',
      keyPhrases: analysis?.topics || []
    },
    topics: analysis?.topics?.map((topic: string, i: number) => ({
      id: `topic-${i}`,
      title: topic,
      count: 0,
      relevance: 0.8
    })) || [],
    files: [], // TODO: Implement files when needed
    participants: participants?.map((p: any) => ({
      id: p.userId,
      name: p.user?.fullName || p.user?.email?.split('@')[0] || 'Unknown',
      email: p.user?.email || '',
      avatar: p.user?.avatarUrl,
      lastActive: p.lastReadAt,
      contributions: 0
    })) || [],
    isLoading: chat === undefined || messages === undefined || isAnalyzing,
    error: null
  }

  return context
} 