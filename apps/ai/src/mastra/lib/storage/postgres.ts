import { PostgresStore } from '@mastra/pg';

/**
 * Create PostgreSQL storage and vector database for Mastra
 * Uses the DATABASE_URL from environment
 */
export const createPostgresStorage = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return { storage: undefined, vectorDB: undefined };
  }

  try {
    const storage = new PostgresStore({
      connectionString,
    });

    // TODO: Add vector DB when available
    const vectorDB = null;

    return { storage, vectorDB };
  } catch (_error) {
    return { storage: undefined, vectorDB: undefined };
  }
};
