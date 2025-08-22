export interface Env {
  // Database
  DATABASE_URL: string;
  HYPERDRIVE?: {
    connectionString: string;
  };
  
  // Authentication
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY?: string;
  CLERK_WEBHOOK_SECRET?: string;
  
  // External services
  AI_SERVICE_URL?: string;
  RESEND_API_KEY?: string;
  PUSHER_APP_ID?: string;
  PUSHER_KEY?: string;
  PUSHER_SECRET?: string;
  PUSHER_CLUSTER?: string;
  
  // Storage
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
  
  // AI services
  VERTEX_AI_PROJECT?: string;
  VERTEX_AI_LOCATION?: string;
  GOOGLE_APPLICATION_CREDENTIALS?: string;
  
  // Monitoring
  SENTRY_DSN?: string;
  REDIS_URL?: string;
  
  // Environment
  NODE_ENV?: string;
  NEXT_PUBLIC_APP_URL?: string;
}