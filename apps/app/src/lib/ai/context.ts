import { ConvexClient } from "convex/browser"
import { api } from "@repo/backend/convex/_generated/api"
import { EmbeddingService } from "./embeddings"

export interface ContextMetadata {
  title?: string
  description?: string
  url?: string
  name?: string
  email?: string
  full_name?: string
  type?: string
  size?: string
  preview?: string
  [key: string]: any
}

export interface Context {
  id: string
  type: "thread" | "user" | "url" | "file"
  metadata: ContextMetadata
  embedding?: number[]
}

// Create a client for non-hook contexts
const convexClient = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export class ContextService {
  static async findSimilarContexts(
    text: string,
    options: {
      type?: string
      limit?: number
      threshold?: number
      chatId?: string
    } = {}
  ) {
    const embedding = await EmbeddingService.generateEmbedding(text)
    
    const result = await convexClient.mutation(api.ai.findSimilar, {
      embedding,
      threshold: options.threshold || 0.7,
      limit: options.limit || 5,
      type: options.type,
      chatId: options.chatId
    })

    return result as Context[]
  }

  static async createContext(
    content: string,
    type: Context["type"],
    metadata: ContextMetadata = {}
  ) {
    const embedding = await EmbeddingService.generateEmbedding(content)

    const result = await convexClient.mutation(api.contexts.create, {
      type,
      metadata,
      embedding
    })

    return result
  }

  static async linkContextToMessage(
    contextId: string,
    messageId: string,
    metadata: Record<string, any> = {}
  ) {
    await convexClient.mutation(api.contexts.linkToMessage, {
      contextId,
      messageId,
      metadata
    })
  }

  static async getMessageContexts(messageId: string) {
    const result = await convexClient.query(api.contexts.getMessageContexts, {
      messageId
    })
    
    return result?.map((row: any) => ({
      ...row.context,
      linkMetadata: row.metadata
    })) || []
  }
}