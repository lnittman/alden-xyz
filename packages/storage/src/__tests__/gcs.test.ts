import { resolve } from 'node:path';
import { config } from 'dotenv';
import { beforeAll, describe, expect, it } from 'vitest';
import { GCSStorageProvider } from '../providers/gcs';

// Load environment variables
config({ path: resolve(__dirname, '../../../../apps/app/.env.local') });

describe('GCS Storage Provider', () => {
  let provider: GCSStorageProvider;

  beforeAll(() => {
    // Skip tests if GCS is not configured
    if (
      !process.env.GCS_BUCKET ||
      !process.env.GOOGLE_APPLICATION_CREDENTIALS
    ) {
      return;
    }

    provider = new GCSStorageProvider({
      projectId: process.env.GCP_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      bucket: process.env.GCS_BUCKET!,
      publicUrl: process.env.GCS_PUBLIC_URL,
    });
  });

  it('should upload a file', async () => {
    if (!provider) {
      return;
    }

    const testBuffer = Buffer.from('Hello from GCS test');
    const key = `test/gcs-test-${Date.now()}.txt`;

    const result = await provider.upload(key, testBuffer, {
      contentType: 'text/plain',
      metadata: { test: 'true' },
    });

    expect(result.key).toBe(key);
    expect(result.size).toBe(testBuffer.length);
    expect(result.contentType).toBe('text/plain');
    expect(result.url).toContain(key);
  });

  it('should get a file', async () => {
    if (!provider) {
      return;
    }

    const testBuffer = Buffer.from('Test file for get operation');
    const key = `test/gcs-get-test-${Date.now()}.txt`;

    // First upload
    await provider.upload(key, testBuffer);

    // Then get
    const file = await provider.get(key);

    expect(file).not.toBeNull();
    expect(file?.key).toBe(key);
    expect(file?.size).toBe(testBuffer.length);
  });

  it('should list files', async () => {
    if (!provider) {
      return;
    }

    const prefix = `test/list-${Date.now()}/`;
    const keys = [`${prefix}file1.txt`, `${prefix}file2.txt`];

    // Upload test files
    for (const key of keys) {
      await provider.upload(key, Buffer.from(`Content of ${key}`));
    }

    // List files
    const files = await provider.list(prefix);

    expect(files.length).toBeGreaterThanOrEqual(2);
    expect(files.map((f) => f.key)).toEqual(expect.arrayContaining(keys));
  });

  it('should create presigned URLs', async () => {
    if (!provider) {
      return;
    }

    const key = `test/presigned-${Date.now()}.txt`;

    // Get presigned URL for upload
    const uploadUrl = await provider.createPresignedUrl(key, 'put', 3600);
    expect(uploadUrl).toContain('X-Goog-Signature');
    expect(uploadUrl).toContain(key);

    // Upload a file first
    await provider.upload(key, Buffer.from('Test presigned URL'));

    // Get presigned URL for download
    const downloadUrl = await provider.createPresignedUrl(key, 'get', 3600);
    expect(downloadUrl).toContain('X-Goog-Signature');
    expect(downloadUrl).toContain(key);
  });

  it('should delete a file', async () => {
    if (!provider) {
      return;
    }

    const key = `test/delete-test-${Date.now()}.txt`;

    // Upload a file
    await provider.upload(key, Buffer.from('File to be deleted'));

    // Verify it exists
    const beforeDelete = await provider.get(key);
    expect(beforeDelete).not.toBeNull();

    // Delete it
    await provider.delete(key);

    // Verify it's gone
    const afterDelete = await provider.get(key);
    expect(afterDelete).toBeNull();
  });
});
