import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import type { RuntimeContext } from '@mastra/core/di';

/**
 * Create a model instance based on runtime context
 * Supports multiple AI providers (Google, OpenAI, Anthropic, OpenRouter)
 */
export function createModelFromContext({
  runtimeContext,
}: {
  runtimeContext?: RuntimeContext<any>;
}) {
  // Default to Google Gemini if no specific model is requested
  const modelName = runtimeContext?.['chat-model'] || 'google:gemini-1.5-pro';
  
  // Parse provider and model from the model name
  const [provider, model] = modelName.includes(':')
    ? modelName.split(':')
    : ['google', modelName];

  switch (provider.toLowerCase()) {
    case 'google':
    case 'gemini':
      const googleApiKey = runtimeContext?.['google-api-key'] || process.env.GOOGLE_API_KEY;
      if (!googleApiKey) {
        throw new Error('Google API key not found in runtime context or environment');
      }
      return google({
        apiKey: googleApiKey,
      })(model || 'gemini-1.5-pro');

    case 'openai':
    case 'gpt':
      const openaiApiKey = runtimeContext?.['openai-api-key'] || process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        throw new Error('OpenAI API key not found in runtime context or environment');
      }
      return openai({
        apiKey: openaiApiKey,
      })(model || 'gpt-4-turbo');

    case 'anthropic':
    case 'claude':
      const anthropicApiKey = runtimeContext?.['anthropic-api-key'] || process.env.ANTHROPIC_API_KEY;
      if (!anthropicApiKey) {
        throw new Error('Anthropic API key not found in runtime context or environment');
      }
      return anthropic({
        apiKey: anthropicApiKey,
      })(model || 'claude-3-5-sonnet-20241022');

    case 'openrouter':
      const openrouterApiKey = runtimeContext?.['openrouter-api-key'] || process.env.OPENROUTER_API_KEY;
      if (!openrouterApiKey) {
        throw new Error('OpenRouter API key not found in runtime context or environment');
      }
      // OpenRouter uses OpenAI-compatible API
      return openai({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: openrouterApiKey,
      })(model || 'anthropic/claude-3.5-sonnet');

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}