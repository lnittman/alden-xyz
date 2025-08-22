import { AIService } from "./services"
import { api } from "../api/client"

interface ProcessOptions {
  chatId: string
  content: string
  files?: File[]
  references?: Array<{
    type: string
    id: string
    metadata?: any
  }>
  contexts?: Array<{
    id: string
    type: string
    metadata?: any
  }>
  token?: string
}

export class MessageProcessor {
  async processMessage(options: ProcessOptions) {
    const { chatId, content, files = [], references = [], contexts = [], token } = options

    try {
      // 1. Process any attached files
      const fileResults = await Promise.all(
        files.map(async (file) => {
          const result = await AIService.processFile(file, { token })
          return result
        })
      )

      // 2. Analyze message content
      const analysis = await AIService.analyzeMessage(content, {
        recentMessages: [], // TODO: Get from chat history
        attachedFiles: files,
        threadContext: contexts.map(c => c.id).join(",")
      }, { token })

      // 3. Find similar content
      const similar = await AIService.findSimilarContent(analysis.embedding, {
        includedChats: [chatId],
        token
      })

      // 4. Store message with all metadata
      const response = await api.post(`/chats/${chatId}/messages`, {
        content,
        embedding: analysis.embedding,
        metadata: {
          analysis,
          files: fileResults,
          references,
          contexts,
          similar: similar.messages?.map(m => m.id) || []
        }
      }, { token })

      const message = await response.json()

      return {
        message,
        analysis,
        similar,
        files: fileResults
      }
    } catch (error) {
      console.error('Error processing message:', error)
      throw error
    }
  }
} 
