import { ConvexClient } from "convex/browser"
import { api } from "@repo/backend/convex/_generated/api"
import { ContextAnalysis } from '@/types'

// Create a client for non-hook contexts
const convexClient = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

interface MessageContext {
  recentMessages: string[]
  attachedFiles?: File[]
  threadContext?: string
  totalTokens?: number
}

interface ContentAnalysis {
  embedding: number[]
  topics: string[]
  entities: string[]
  sentiment: string
  references?: {
    threads: string[]
    files: string[]
    urls: string[]
  }
  summary?: string
}

export class AIService {
  static async analyzeMessage(content: string, context: MessageContext, options: { token?: string } = {}): Promise<ContentAnalysis> {
    const result = await convexClient.mutation(api.ai.analyzeMessage, {
      content,
      chatId: context.threadContext || '',
      mode: 'standard'
    })

    return result as ContentAnalysis
  }

  static async findSimilarMessages(content: string, chatId: string) {
    const result = await convexClient.mutation(api.ai.findSimilarMessages, {
      content, 
      chatId
    })
    
    return result || []
  }

  static async generateResponse(content: string, context: string) {
    const result = await convexClient.mutation(api.ai.generateResponse, {
      content, 
      context
    })
    
    return result
  }

  static async findSimilarContent(embedding: number[], options: {
    threshold?: number
    limit?: number
    includeFiles?: boolean
    includedChats?: string[]
    token?: string
  } = {}) {
    const result = await convexClient.mutation(api.ai.findSimilar, {
      embedding,
      threshold: options.threshold || 0.7,
      limit: options.limit || 10,
      type: options.includeFiles ? 'file' : undefined,
      chatId: options.includedChats?.[0]
    })

    return { messages: result || [] }
  }

  static async getSmartSuggestions(content: string, context: MessageContext) {
    const result = await convexClient.mutation(api.ai.getSuggestions, {
      content,
      chatId: context.threadContext || ''
    })

    return result
  }

  static async processFile(file: File) {
    // Convert file to base64
    const base64 = await this.fileToBase64(file)
    
    const result = await convexClient.mutation(api.ai.processFile, {
      content: base64,
      type: file.type,
      name: file.name
    })

    return result
  }

  private static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64 = reader.result as string
        resolve(base64.split(",")[1])
      }
      reader.onerror = error => reject(error)
    })
  }

  static async generateEmbedding(text: string) {
    const result = await convexClient.mutation(api.ai.generateEmbedding, {
      text
    })
    
    return result.embedding
  }
}