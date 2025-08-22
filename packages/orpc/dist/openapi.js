import { OpenAPIHandler as ORPCOpenAPIHandler } from '@orpc/openapi/fetch';
export function createOpenAPIHandler(options) {
    return new ORPCOpenAPIHandler(options.router, {
    // basePath is not available in this version
    });
}
