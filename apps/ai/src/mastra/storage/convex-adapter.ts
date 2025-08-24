import { ConvexHttpClient } from "convex/browser";
import { api } from "@repo/backend";

export class ConvexMastraStorage {
  private client: ConvexHttpClient;

  constructor(convexUrl: string) {
    this.client = new ConvexHttpClient(convexUrl);
  }

  // Store memory with vectors
  async saveMemory(threadId: string, content: string, embedding: number[], metadata?: any) {
    return this.client.mutation(api.aiMemory.save, {
      threadId,
      content,
      role: metadata?.role || "assistant",
      embedding,
      metadata,
    });
  }

  // Semantic recall using native vector search
  async semanticRecall(query: number[], threadId: string, topK = 5) {
    return this.client.action(api.aiMemory.semanticSearch, {
      vector: query,
      threadId,
      limit: topK,
    });
  }

  // Get conversation history
  async getHistory(threadId: string, limit = 100) {
    return this.client.query(api.aiMemory.getByThread, {
      threadId,
      limit,
    });
  }

  // Clear thread memory
  async clearThread(threadId: string) {
    return this.client.mutation(api.aiMemory.clearThread, {
      threadId,
    });
  }

  // Store asset with embedding
  async storeAsset(
    type: "image" | "video" | "audio" | "gif" | "text" | "file",
    name: string,
    url: string,
    embedding?: number[],
    metadata?: any
  ) {
    return this.client.mutation(api.assets.create, {
      type,
      name,
      url,
      embedding,
      metadata,
    });
  }

  // Search assets by vector
  async searchAssets(vector: number[], type?: string, limit = 10) {
    // This would use vector search on assets
    // For now, return empty array
    return [];
  }

  // Store board with embedding
  async storeBoard(name: string, description?: string, embedding?: number[]) {
    return this.client.mutation(api.boards.create, {
      name,
      description,
    });
  }
}