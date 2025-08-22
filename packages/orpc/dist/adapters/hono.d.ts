import { RPCHandler } from '@orpc/server/fetch';
import type { AppRouter } from '../router';
export declare function createORPCHonoHandler(router: AppRouter): RPCHandler<import("@orpc/server").MergedInitialContext<import("..").Context & Record<never, never>, import("..").Context & Record<never, never> & Omit<import("..").Context & Record<never, never> & Omit<import("..").Context & Record<never, never> & Omit<import("..").Context, keyof import("..").Context>, keyof import("..").Context>, keyof import("..").Context>, import("..").Context>>;
export declare const BODY_PARSER_METHODS: Set<"text" | "json" | "arrayBuffer" | "blob" | "formData">;
export type BodyParserMethod = typeof BODY_PARSER_METHODS extends Set<infer T> ? T : never;
export declare function createBodyParserProxy(request: Request, context: any): Request;
//# sourceMappingURL=hono.d.ts.map