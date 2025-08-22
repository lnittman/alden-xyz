import { OpenAPIGenerator } from '@orpc/openapi';
import { ZodToJsonSchemaConverter } from '@orpc/zod';
import type { AppRouter } from '../router';

export async function getOpenAPIDocument(router: AppRouter) {
  const generator = new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
  });

  return generator.generate(router, {
    info: {
      title: 'Squish API',
      version: '1.0.0',
      description:
        'API for Squish - collaborative workspace with AI-enhanced search',
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787',
        description:
          process.env.NODE_ENV === 'production'
            ? 'Production server'
            : 'Development server',
      },
    ],
  });
}
