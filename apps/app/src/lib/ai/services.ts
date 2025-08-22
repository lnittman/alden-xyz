import { api } from "../api/client"
import { ContextAnalysis } from '@/types'

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
    const response = await api.post("/ai/analyze-message", {
      content,
      context: {
        ...context,
        attachedFiles: undefined // Don't send file data directly
      }
    }, { token: options.token })

    return await response.json()
  }

  static async findSimilarMessages(content: string, chatId: string, options: { token?: string } = {}) {
    const response = await api.post("/ai/find-similar-messages", {
      content, 
      chatId
    }, { token: options.token })
    
    const data = await response.json()
    return data || []
  }

  static async generateResponse(content: string, context: string, options: { token?: string } = {}) {
    const response = await api.post("/ai/generate-response", {
      content, 
      context
    }, { token: options.token })
    
    return await response.json()
  }

  static async findSimilarContent(embedding: number[], options: {
    threshold?: number
    limit?: number
    includeFiles?: boolean
    includedChats?: string[]
    token?: string
  } = {}) {
    const { token, ...searchOptions } = options
    
    const response = await api.post("/ai/find-similar", {
      embedding,
      options: searchOptions
    }, { token })

    return await response.json()
  }

  static async getSmartSuggestions(content: string, context: MessageContext, options: { token?: string } = {}) {
    const response = await api.post("/ai/get-suggestions", {
      content,
      context: {
        ...context,
        attachedFiles: undefined
      }
    }, { token: options.token })

    return await response.json()
  }

  static async processFile(file: File, options: { token?: string } = {}) {
    // Convert file to base64
    const base64 = await this.fileToBase64(file)
    
    const response = await api.post("/ai/process-file", {
      content: base64,
      type: file.type,
      name: file.name
    }, { token: options.token })

    return await response.json()
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

  static async generateEmbedding(text: string, options: { token?: string } = {}) {
    const response = await api.post('/ai/generate-embedding', {
      text
    }, { token: options.token })
    
    const data = await response.json()
    return data.embedding
  }
}
