import { OpenAPIHandler as ORPCOpenAPIHandler } from '@orpc/openapi/fetch';
import type { AppRouter } from './router';
export declare function createOpenAPIHandler(options: {
    router: AppRouter;
    path?: string;
}): ORPCOpenAPIHandler<import("@orpc/server").MergedInitialContext<import("./context").Context & Record<never, never>, import("./context").Context & Record<never, never> & Omit<import("./context").Context & Record<never, never> & Omit<import("./context").Context & Record<never, never> & Omit<import("./context").Context, keyof import("./context").Context>, keyof import("./context").Context>, keyof import("./context").Context>, import("./context").Context>>;
export type OpenAPIHandler = ReturnType<typeof createOpenAPIHandler>;
//# sourceMappingURL=openapi.d.ts.map