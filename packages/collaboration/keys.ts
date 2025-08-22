import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      PUSHER_APP_ID: z.string(),
      PUSHER_KEY: z.string(),
      PUSHER_SECRET: z.string(),
      PUSHER_CLUSTER: z.string().default('us2'),
    },
    client: {
      NEXT_PUBLIC_PUSHER_KEY: z.string(),
      NEXT_PUBLIC_PUSHER_CLUSTER: z.string().default('us2'),
    },
    runtimeEnv: {
      PUSHER_APP_ID: process.env.PUSHER_APP_ID,
      PUSHER_KEY: process.env.PUSHER_KEY,
      PUSHER_SECRET: process.env.PUSHER_SECRET,
      PUSHER_CLUSTER: process.env.PUSHER_CLUSTER,
      NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
      NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    },
  });
