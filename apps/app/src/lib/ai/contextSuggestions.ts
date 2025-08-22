import { AIService } from './services'
import { api } from '../api/client'
import type { Context } from "@/types/ai/context"

export interface SuggestionResult {
  contexts: Context[]
  loading: boolean
  error: string | null
}

export class ContextSuggestionService {
  private static debounceTimeout: NodeJS.Timeout | null = null
  private static currentQuery: string | null = null

  static async getSuggestions(
    text: string,
    options: {
      types?: string[]
      limit?: number
      debounceMs?: number
      token?: string
    } = {}
  ): Promise<SuggestionResult> {
    // Don't search for very short queries
    if (text.length < 3) {
      return { contexts: [], loading: false, error: null }
    }

    // Debounce requests
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout)
    }

    return new Promise((resolve) => {
      this.debounceTimeout = setTimeout(async () => {
        try {
          // Generate embedding for search
          const embedding = await AIService.generateEmbedding(text, { token: options.token })
          
          // Search for similar content
          const contextsResponse = await api.post('/ai/contexts/search', {
            query_embedding: embedding,
            match_threshold: 0.7,
            match_count: options.limit || 5,
            filter_types: options.types
          }, { token: options.token })

          const contexts = await contextsResponse.json()

          // Fetch media suggestions (images, videos, etc)
          const mediaResponse = await api.post('/ai/references/search', {
            query: text,
            type: 'media'
          }, { token: options.token })

          const media = await mediaResponse.json()

          // Combine and format results
          const contextsArray = Array.isArray(contexts) ? contexts : []
          const suggestions: Context[] = [
            ...contextsArray.map((ctx: any) => ({
              id: ctx.id,
              type: ctx.type,
              title: ctx.title,
              subtitle: ctx.description,
              preview: ctx.preview,
              metadata: {
                author: ctx.author,
                date: ctx.created_at,
                source: ctx.source
              }
            })),
            ...(media?.references || []).map((ref: any) => ({
              id: ref.id,
              type: 'media',
              title: ref.title,
              preview: ref.url,
              metadata: {
                type: ref.media_type,
                source: ref.source
              }
            }))
          ]

          resolve({
            contexts: suggestions,
            loading: false,
            error: null
          })

        } catch (error) {
          console.error('Error getting suggestions:', error)
          resolve({
            contexts: [],
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to get suggestions'
          })
        }
      }, options.debounceMs || 300)
    })
  }

  static cancelPending() {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout)
      this.debounceTimeout = null
    }
    this.currentQuery = null
  }
}
