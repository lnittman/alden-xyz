import { streamText, convertToCoreMessages } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

/**
 * Streaming support for AI responses
 * Provides real-time streaming capabilities for AI interactions
 */

// Initialize AI providers
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Stream configuration options
 */
export interface StreamConfig {
  model?: 'gemini-pro' | 'gpt-4-turbo' | 'gpt-3.5-turbo';
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  tools?: Record<string, any>;
  onToolCall?: (toolName: string, args: any) => Promise<any>;
}

/**
 * Stream handler for Mastra tools
 * Enables streaming responses from AI tools
 */
export class AIStreamHandler {
  private activeStreams = new Map<string, AbortController>();

  /**
   * Create a streaming response for tool execution
   */
  async streamToolResponse(
    toolId: string,
    prompt: string,
    context: any,
    config: StreamConfig = {}
  ) {
    // Create abort controller for this stream
    const abortController = new AbortController();
    const streamId = `${toolId}-${Date.now()}`;
    this.activeStreams.set(streamId, abortController);

    try {
      // Select model based on configuration
      const model = config.model?.startsWith('gpt') 
        ? openai(config.model)
        : google('gemini-1.5-pro');

      // Build messages with context
      const messages = [
        {
          role: 'system' as const,
          content: config.systemPrompt || this.getDefaultSystemPrompt(toolId),
        },
        {
          role: 'user' as const,
          content: this.buildContextualPrompt(prompt, context),
        },
      ];

      // Stream the response
      const result = await streamText({
        model,
        messages: convertToCoreMessages(messages),
        temperature: config.temperature || 0.7,
        maxTokens: config.maxTokens || 2000,
        abortSignal: abortController.signal,
        tools: config.tools,
        onToolCall: config.onToolCall,
      });

      // Return streaming response
      return {
        streamId,
        stream: result.toDataStream(),
        textStream: result.textStream,
        fullStream: result.fullStream,
        abort: () => this.abortStream(streamId),
      };
    } catch (error) {
      this.activeStreams.delete(streamId);
      throw error;
    }
  }

  /**
   * Stream search results with progressive enhancement
   */
  async streamSearchResults(
    query: string,
    searchType: 'boards' | 'assets' | 'users',
    onResult: (result: any) => void
  ) {
    const streamId = `search-${Date.now()}`;
    const abortController = new AbortController();
    this.activeStreams.set(streamId, abortController);

    try {
      // Phase 1: Quick keyword search
      const quickResults = await this.performQuickSearch(query, searchType);
      for (const result of quickResults) {
        if (abortController.signal.aborted) break;
        onResult({ type: 'quick', data: result });
      }

      // Phase 2: Semantic search
      const semanticResults = await this.performSemanticSearch(query, searchType);
      for (const result of semanticResults) {
        if (abortController.signal.aborted) break;
        onResult({ type: 'semantic', data: result });
      }

      // Phase 3: AI-enhanced results
      const aiResults = await this.enhanceWithAI(query, [...quickResults, ...semanticResults]);
      for (const result of aiResults) {
        if (abortController.signal.aborted) break;
        onResult({ type: 'enhanced', data: result });
      }

      return {
        streamId,
        abort: () => this.abortStream(streamId),
      };
    } finally {
      this.activeStreams.delete(streamId);
    }
  }

  /**
   * Stream collaborative suggestions progressively
   */
  async streamCollaborationSuggestions(
    boardId: string,
    userId: string,
    onSuggestion: (suggestion: any) => void
  ) {
    const streamId = `collab-${Date.now()}`;
    const abortController = new AbortController();
    this.activeStreams.set(streamId, abortController);

    try {
      // Stream suggestions in order of relevance
      const stages = [
        { type: 'direct_connections', weight: 1.0 },
        { type: 'similar_interests', weight: 0.8 },
        { type: 'complementary_skills', weight: 0.7 },
        { type: 'network_recommendations', weight: 0.5 },
      ];

      for (const stage of stages) {
        if (abortController.signal.aborted) break;
        
        const suggestions = await this.getCollaboratorsByType(
          boardId,
          userId,
          stage.type
        );
        
        for (const suggestion of suggestions) {
          if (abortController.signal.aborted) break;
          onSuggestion({
            ...suggestion,
            relevance: stage.weight,
            source: stage.type,
          });
        }
      }

      return {
        streamId,
        abort: () => this.abortStream(streamId),
      };
    } finally {
      this.activeStreams.delete(streamId);
    }
  }

  /**
   * Abort an active stream
   */
  abortStream(streamId: string): boolean {
    const controller = this.activeStreams.get(streamId);
    if (controller) {
      controller.abort();
      this.activeStreams.delete(streamId);
      return true;
    }
    return false;
  }

  /**
   * Abort all active streams
   */
  abortAllStreams(): number {
    let count = 0;
    for (const [streamId, controller] of this.activeStreams) {
      controller.abort();
      count++;
    }
    this.activeStreams.clear();
    return count;
  }

  // Helper methods
  private getDefaultSystemPrompt(toolId: string): string {
    const prompts: Record<string, string> = {
      'search-boards': 'You are a search assistant helping users find relevant boards.',
      'analyze-board': 'You are an analytics expert providing insights about boards.',
      'suggest-collaborators': 'You are a collaboration expert matching users with potential partners.',
      'organize-assets': 'You are an organization specialist helping arrange content effectively.',
    };
    
    return prompts[toolId] || 'You are an AI assistant helping with content management.';
  }

  private buildContextualPrompt(prompt: string, context: any): string {
    const contextInfo = Object.entries(context)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join('\n');
    
    return `${prompt}\n\nContext:\n${contextInfo}`;
  }

  private async performQuickSearch(query: string, type: string): Promise<any[]> {
    // Quick keyword-based search
    // This would call your actual search service
    return [];
  }

  private async performSemanticSearch(query: string, type: string): Promise<any[]> {
    // Semantic search using embeddings
    // This would call your vector search service
    return [];
  }

  private async enhanceWithAI(query: string, results: any[]): Promise<any[]> {
    // Enhance results with AI analysis
    // This would use AI to re-rank and annotate results
    return results;
  }

  private async getCollaboratorsByType(
    boardId: string,
    userId: string,
    type: string
  ): Promise<any[]> {
    // Get collaborators based on different criteria
    // This would call your recommendation service
    return [];
  }
}

/**
 * Server-Sent Events (SSE) handler for real-time updates
 */
export class SSEHandler {
  private clients = new Map<string, WritableStreamDefaultWriter>();

  /**
   * Create an SSE connection for a client
   */
  createConnection(clientId: string): ReadableStream {
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    this.clients.set(clientId, writer);

    // Send initial connection message
    this.sendEvent(clientId, 'connected', { clientId, timestamp: Date.now() });

    return readable;
  }

  /**
   * Send an event to a specific client
   */
  async sendEvent(clientId: string, eventType: string, data: any) {
    const writer = this.clients.get(clientId);
    if (!writer) return false;

    try {
      const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
      await writer.write(new TextEncoder().encode(message));
      return true;
    } catch (error) {
      // Client disconnected
      this.closeConnection(clientId);
      return false;
    }
  }

  /**
   * Broadcast an event to all connected clients
   */
  async broadcast(eventType: string, data: any) {
    const promises = Array.from(this.clients.keys()).map(clientId =>
      this.sendEvent(clientId, eventType, data)
    );
    await Promise.all(promises);
  }

  /**
   * Close a client connection
   */
  closeConnection(clientId: string) {
    const writer = this.clients.get(clientId);
    if (writer) {
      writer.close();
      this.clients.delete(clientId);
    }
  }

  /**
   * Get number of active connections
   */
  getActiveConnections(): number {
    return this.clients.size;
  }
}

// Export singleton instances
export const streamHandler = new AIStreamHandler();
export const sseHandler = new SSEHandler();