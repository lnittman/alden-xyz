import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () => createEnv({
  server: {
    KNOCK_SECRET_API_KEY: z.string().min(1),
  },
  experimental__runtimeEnv: {},
  skipValidation: process.env.SKIP_ENV_CHECK === 'true' || process.env.npm_lifecycle_event === 'lint',
});