import { api } from "@/lib/api/client"
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
    
    const response = await api.post('/ai/find-similar', {
      embedding,
      options: {
        threshold: options.threshold || 0.7,
        limit: options.limit || 5,
        type: options.type,
        chatId: options.chatId
      }
    })

    const data = await response.json()
    return data as Context[]
  }

  static async createContext(
    content: string,
    type: Context["type"],
    metadata: ContextMetadata = {}
  ) {
    const embedding = await EmbeddingService.generateEmbedding(content)

    const response = await api.post('/contexts', {
      type,
      metadata,
      embedding
    })

    return await response.json()
  }

  static async linkContextToMessage(
    contextId: string,
    messageId: string,
    metadata: Record<string, any> = {}
  ) {
    await api.post('/message-contexts', {
      contextId,
      messageId,
      metadata
    })
  }

  static async getMessageContexts(messageId: string) {
    const response = await api.get(`/messages/${messageId}/contexts`)
    const data = await response.json()
    
    return data?.map((row: any) => ({
      ...row.context,
      linkMetadata: row.metadata
    })) || []
  }
} 