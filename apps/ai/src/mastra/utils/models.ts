// File: src/mastra/utils/models.ts

import { createVertex } from '@ai-sdk/google-vertex';
import type { LanguageModelV1 } from 'ai';
import { normalizeRuntimeContext } from './runtime-context-builder';

// Parse Google credentials from environment
function getGoogleAuthFromEnv() {
  const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (credentialsJson?.startsWith('{')) {
    // If GOOGLE_APPLICATION_CREDENTIALS contains JSON, we need to temporarily
    // unset it to prevent Google's auth library from treating it as a file path
    process.env.GOOGLE_APPLICATION_CREDENTIALS = undefined;

    try {
      const serviceAccount = JSON.parse(credentialsJson);
      return {
        googleAuthOptions: {
          credentials: {
            client_email: serviceAccount.client_email,
            private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
            private_key_id: serviceAccount.private_key_id,
          },
        },
      };
    } catch (_error) {}
  }

  return {};
}

// Streamlined to use only Vertex AI with Gemini models
export function createModelFromContext({
  runtimeContext,
  defaultModelId = 'gemini-2.0-flash-exp',
}: {
  runtimeContext: any;
  defaultModelId?: string;
}): LanguageModelV1 {
  const normalizedContext = normalizeRuntimeContext(runtimeContext);
  const modelId = normalizedContext.get('chat-model') || defaultModelId;

  // Get credentials and config
  const googleAuth = getGoogleAuthFromEnv();
  const project =
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GOOGLE_VERTEX_PROJECT ||
    'squish-441207';
  const location =
    process.env.GOOGLE_CLOUD_LOCATION ||
    process.env.GOOGLE_VERTEX_LOCATION ||
    'us-central1';

  // Create vertex provider with auth
  const vertexProvider = createVertex({
    project,
    location,
    ...googleAuth,
  });

  // Ensure we're using a Gemini model
  if (!modelId.startsWith('gemini-')) {
    return vertexProvider(defaultModelId);
  }

  return vertexProvider(modelId);
}
