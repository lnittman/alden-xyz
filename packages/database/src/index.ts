import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Legacy export for backward compatibility - will be undefined in Workers
const databaseUrl = typeof process !== 'undefined' ? process.env?.DATABASE_URL : undefined;

// Create the connection only if we have a URL (Node.js environments)
const sql = databaseUrl ? postgres(databaseUrl, {
  max: 1, // Minimal connections for edge runtime
  idle_timeout: 20,
  connect_timeout: 10,
}) : null;

// Create the Drizzle instance - will be null in Workers
export const db = sql ? drizzle(sql, { schema }) : null as any;

// Export the factory function for Workers
export { createDatabaseClient } from './client';
export type { DatabaseClient } from './client';

// Export schema and all types
export * from './schema';
export { schema };

// Export Drizzle operators
export {
  eq,
  and,
  or,
  not,
  inArray,
  notInArray,
  isNull,
  isNotNull,
  sql,
  desc,
  asc,
  count,
  gte,
  lte,
  gt,
  lt,
  ne,
  like,
  ilike,
  notLike,
  between,
  notBetween,
  exists,
  notExists,
} from 'drizzle-orm';

// Export generated types and schemas from drizzle-zod
export * from './generated-zod';
export { checkDatabaseHealth } from './health';

// Export postgres instance for raw queries if needed
export { sql as postgresClient };

// Hyperdrive support for Cloudflare Workers
export function getDb(hyperdrive?: any) {
  if (hyperdrive) {
    const sql = postgres(hyperdrive.connectionString);
    return drizzle(sql, { schema });
  }
  return db;
}
