import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type DatabaseClient = ReturnType<typeof drizzle>;

// Factory function for creating database clients
export function createDatabaseClient(connectionString: string) {
  const queryClient = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  
  return drizzle(queryClient, { schema });
}

// For migrations (if in Node.js environment)
export function createMigrationClient(connectionString: string) {
  const migrationClient = postgres(connectionString, { max: 1 });
  return drizzle(migrationClient, { schema });
}