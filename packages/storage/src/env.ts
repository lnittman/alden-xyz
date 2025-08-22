import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const storage = () =>
  createEnv({
    server: {
      STORAGE_PROVIDER: z.enum(['vercel-blob', 's3', 'r2', 'gcs']),
      // S3/R2 config
      AWS_REGION: z.string().optional(),
      AWS_ACCESS_KEY_ID: z.string().optional(),
      AWS_SECRET_ACCESS_KEY: z.string().optional(),
      AWS_BUCKET: z.string().optional(),
      AWS_PUBLIC_URL: z.string().optional(),
      // R2 specific
      R2_ACCOUNT_ID: z.string().optional(),
      R2_ACCESS_KEY_ID: z.string().optional(),
      R2_SECRET_ACCESS_KEY: z.string().optional(),
      R2_BUCKET: z.string().optional(),
      R2_PUBLIC_URL: z.string().optional(),
      // Vercel Blob
      BLOB_READ_WRITE_TOKEN: z.string().optional(),
      // Google Cloud Storage
      GCP_PROJECT_ID: z.string().optional(),
      GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
      GCS_BUCKET: z.string().optional(),
      GCS_PUBLIC_URL: z.string().optional(),
    },
    runtimeEnv: process.env,
  });
