import crypto from "crypto"
import { ConvexClient } from "convex/browser"
import { api } from "@repo/backend/convex/_generated/api"

export interface EmbeddingResponse {
  embedding: number[]
  dimension: number
  model: string
}

export interface EmbeddingOptions {
  threshold?: number
  limit?: number
  type?: string
  chatId?: string
  token?: string
}

export interface SimilarityMatch {
  id: string
  type: string
  content: string
  metadata: any
  similarity: number
}

// Create a client for non-hook contexts
const convexClient = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export class EmbeddingService {
  // Generate embedding for text content
  private static hashContent(text: string, imageUrl?: string): string {
    return crypto
      .createHash('sha256')
      .update(text + (imageUrl || ''))
      .digest('hex')
  }

  private static async cacheEmbedding(hash: string, embedding: number[]) {
    await convexClient.mutation(api.ai.cacheEmbedding, {
      contentHash: hash,
      embedding
    })
  }

  static async generateEmbedding(text: string): Promise<number[]> {
    const result = await convexClient.mutation(api.ai.generateEmbedding, {
      text
    })
    
    return result?.embedding || []
  }

  // Get cached embedding if available
  static async getCachedEmbedding(
    contentHash: string
  ): Promise<number[] | null> {
    try {
      const result = await convexClient.query(api.ai.getCachedEmbedding, {
        contentHash
      })
      return result?.embedding || null
    } catch (error) {
      // If not found, return null
      return null
    }
  }

  // Find similar content using vector similarity
  static async findSimilarContent(
    embedding: number[],
    options: EmbeddingOptions = {}
  ): Promise<SimilarityMatch[]> {
    const result = await convexClient.mutation(api.ai.findSimilar, {
      embedding,
      threshold: options.threshold || 0.7,
      limit: options.limit || 10,
      type: options.type,
      chatId: options.chatId
    })

    return result as SimilarityMatch[]
  }

  // Batch process multiple texts
  static async batchGenerateEmbeddings(texts: string[]): Promise<number[][]> {
    const result = await convexClient.mutation(api.ai.batchGenerateEmbeddings, {
      texts
    })

    return result.embeddings as number[][]
  }

  // Queue content for embedding generation
  static async queueForEmbedding(
    contentId: string,
    contentType: 'message' | 'file' | 'context'
  ): Promise<string> {
    const result = await convexClient.mutation(api.ai.queueEmbedding, {
      contentId,
      contentType
    })

    return result.jobId as string
  }

  // Check embedding queue status
  static async checkEmbeddingStatus(jobId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed'
    error?: string
  }> {
    const result = await convexClient.query(api.ai.getEmbeddingStatus, {
      jobId
    })

    return {
      status: result?.status || 'failed',
      error: result?.error
    }
  }

  static async generateAndStore(content: string, options: { messageId: string; chatId: string }) {
    const embedding = await this.generateEmbedding(content)
    
    await convexClient.mutation(api.messages.updateEmbedding, {
      messageId: options.messageId,
      embedding
    })

    return embedding
  }
}