export function createContext(options) {
    return {
        user: options.user,
        env: options.env,
        requestId: options.requestId || crypto.randomUUID(),
        headers: options.headers,
        services: options.services,
    };
}
export function isAuthenticated(ctx) {
    return ctx.user !== null;
}
