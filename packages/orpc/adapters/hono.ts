import { RPCHandler } from '@orpc/server/fetch';
import type { AppRouter } from '../router';

export function createORPCHonoHandler(router: AppRouter) {
  // Use RPCHandler for Hono compatibility
  return new RPCHandler(router);
}

// Body parser proxy to prevent "Body Already Used" error
export const BODY_PARSER_METHODS = new Set([
  'arrayBuffer',
  'blob',
  'formData',
  'json',
  'text',
] as const);
export type BodyParserMethod = typeof BODY_PARSER_METHODS extends Set<infer T>
  ? T
  : never;

export function createBodyParserProxy(request: Request, context: any) {
  return new Proxy(request, {
    get(target, prop) {
      if (BODY_PARSER_METHODS.has(prop as BodyParserMethod)) {
        return () => context.req[prop as BodyParserMethod]();
      }
      return Reflect.get(target, prop, target);
    },
  });
}
