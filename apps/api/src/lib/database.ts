import * as schema from '@repo/database/schema';
import { type PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import type { Env } from '../index';

let db: PostgresJsDatabase<typeof schema> | null = null;

/**
 * Get database connection using Hyperdrive when available (in production)
 * or direct connection in development
 */
export function getDatabase(env: Env): PostgresJsDatabase<typeof schema> {
  if (db) {
    return db;
  }

  // In production with Hyperdrive
  if (env.HYPERDRIVE?.connectionString) {
    const sql = postgres(env.HYPERDRIVE.connectionString, {
      max: 5, // Limit connections for Workers
      fetch_types: false, // Disable if not using array types for better performance
    });
    db = drizzle(sql, { schema });
    return db;
  }

  // Fallback to direct connection (development or when Hyperdrive not configured)
  if (env.DATABASE_URL) {
    const sql = postgres(env.DATABASE_URL, {
      max: 10, // Can use more connections when not in Workers environment
    });
    db = drizzle(sql, { schema });
    return db;
  }

  throw new Error('No database connection available');
}

/**
 * Close database connection
 * Important: Call this in ctx.waitUntil() to ensure cleanup
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    const sql = (db as any).sql;
    if (sql && typeof sql.end === 'function') {
      await sql.end();
    }
    db = null;
  }
}
