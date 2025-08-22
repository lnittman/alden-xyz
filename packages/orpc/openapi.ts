import { OpenAPIHandler as ORPCOpenAPIHandler } from '@orpc/openapi/fetch';
import type { AppRouter } from './router';

export function createOpenAPIHandler(options: {
  router: AppRouter;
  path?: string;
}) {
  return new ORPCOpenAPIHandler(options.router, {
    // basePath is not available in this version
  } as any);
}

export type OpenAPIHandler = ReturnType<typeof createOpenAPIHandler>;
