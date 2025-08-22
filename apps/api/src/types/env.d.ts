export interface Env {
    DATABASE_URL: string;
    HYPERDRIVE?: {
        connectionString: string;
    };
    CLERK_SECRET_KEY: string;
    CLERK_PUBLISHABLE_KEY?: string;
    AI_SERVICE_URL?: string;
    RESEND_API_KEY?: string;
    PUSHER_APP_ID?: string;
    PUSHER_KEY?: string;
    PUSHER_SECRET?: string;
    PUSHER_CLUSTER?: string;
    R2_ACCOUNT_ID?: string;
    R2_ACCESS_KEY_ID?: string;
    R2_SECRET_ACCESS_KEY?: string;
    R2_BUCKET_NAME?: string;
    VERTEX_AI_PROJECT?: string;
    VERTEX_AI_LOCATION?: string;
    GOOGLE_APPLICATION_CREDENTIALS?: string;
    SENTRY_DSN?: string;
    REDIS_URL?: string;
    NODE_ENV?: string;
    NEXT_PUBLIC_APP_URL?: string;
}
//# sourceMappingURL=env.d.ts.map