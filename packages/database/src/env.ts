import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const database = () =>
  createEnv({
    server: {
      DATABASE_URL: z.string().url(),
      DATABASE_POOL_URL: z.string().url().optional(),
    },
    runtimeEnv: {
      DATABASE_URL: process.env.DATABASE_URL,
      DATABASE_POOL_URL: process.env.DATABASE_POOL_URL,
    },
  });
