import crypto from "crypto"

import { api } from "@/lib/api/client"
import { VertexAI } from "@google-cloud/vertexai"

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

export class EmbeddingService {
  // Generate embedding for text content
  private static hashContent(text: string, imageUrl?: string): string {
    return crypto
      .createHash('sha256')
      .update(text + (imageUrl || ''))
      .digest('hex')
  }

  private static async cacheEmbedding(hash: string, embedding: number[], token?: string) {
    await api.post('/ai/embeddings/cache', {
      content_hash: hash,
      embedding
    }, { token })
  }

  static async generateEmbedding(text: string, options: { token?: string } = {}): Promise<number[]> {
    const response = await api.post('/ai/generate-embedding', {
      text
    }, { token: options.token })
    
    const data = await response.json()
    return (data?.embedding as number[]) || []
  }

  // Get cached embedding if available
  static async getCachedEmbedding(
    contentHash: string,
    options: { token?: string } = {}
  ): Promise<number[] | null> {
    try {
      const response = await api.get(`/ai/embeddings/cache/${encodeURIComponent(contentHash)}`, { token: options.token })
      const data = await response.json()
      return data?.embedding as number[] || null
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
    const { token, ...searchOptions } = options
    
    const response = await api.post("/ai/embeddings/similar", {
      query_embedding: embedding,
      match_threshold: searchOptions.threshold || 0.7,
      match_count: searchOptions.limit || 10,
      context_type: searchOptions.type,
      chat_id: searchOptions.chatId
    }, { token })

    const data = await response.json()
    return data as SimilarityMatch[]
  }

  // Batch process multiple texts
  static async batchGenerateEmbeddings(texts: string[], options: { token?: string } = {}): Promise<number[][]> {
    const response = await api.post('/ai/embeddings/batch', {
      texts
    }, { token: options.token })

    const data = await response.json()
    return data.embeddings as number[][]
  }


  // Queue content for embedding generation
  static async queueForEmbedding(
    contentId: string,
    contentType: 'message' | 'file' | 'context',
    options: { token?: string } = {}
  ): Promise<string> {
    const response = await api.post('/ai/embeddings/queue', {
      content_id: contentId,
      content_type: contentType
    }, { token: options.token })

    const data = await response.json()
    return data.job_id as string
  }

  // Check embedding queue status
  static async checkEmbeddingStatus(jobId: string, options: { token?: string } = {}): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed'
    error?: string
  }> {
    const response = await api.get(`/ai/embeddings/queue/${encodeURIComponent(jobId)}`, { token: options.token })
    const data = await response.json()

    return {
      status: (data?.status as 'pending' | 'processing' | 'completed' | 'failed') || 'failed',
      error: data?.last_error as string | undefined
    }
  }

  static async generateAndStore(content: string, options: { messageId: string; chatId: string; token?: string }) {
    const embedding = await this.generateEmbedding(content, { token: options.token })
    
    await api.patch(`/messages/${options.messageId}`, {
      embedding
    }, { token: options.token })

    return embedding
  }
}
