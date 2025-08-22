import { RPCHandler } from '@orpc/server/fetch';
export function createORPCHonoHandler(router) {
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
]);
export function createBodyParserProxy(request, context) {
    return new Proxy(request, {
        get(target, prop) {
            if (BODY_PARSER_METHODS.has(prop)) {
                return () => context.req[prop]();
            }
            return Reflect.get(target, prop, target);
        },
    });
}
