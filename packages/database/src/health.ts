import { postgresClient } from './index';

export async function checkDatabaseHealth() {
  if (!postgresClient) {
    return { healthy: false, error: 'Database client not initialized' };
  }
  
  try {
    // Test basic connectivity
    await postgresClient`SELECT 1`;

    // Test vector extension
    const vectorTest = await postgresClient<Array<{ vector_enabled: boolean }>>`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'vector'
      ) as vector_enabled
    `;

    if (!vectorTest[0]?.vector_enabled) {
      throw new Error('pgvector extension not enabled');
    }

    return { healthy: true };
  } catch (error) {
    return { healthy: false, error: (error as Error).message };
  }
}

// Connection pool monitoring
export async function getPoolStats() {
  if (!postgresClient) {
    return {
      connected: false,
      error: 'Database client not initialized',
    };
  }
  
  // Note: Prisma doesn't expose pool metrics directly
  // This would need to be implemented using the database provider's metrics
  try {
    // Simple connectivity check
    const start = Date.now();
    await postgresClient`SELECT 1`;
    const latency = Date.now() - start;

    return {
      connected: true,
      latency,
    };
  } catch (error) {
    return {
      connected: false,
      error: (error as Error).message,
    };
  }
}
