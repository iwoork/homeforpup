import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// ---------------------------------------------------------------------------
// Next.js / long-running process singleton
// ---------------------------------------------------------------------------

const globalForDb = globalThis as unknown as {
  _pgClient: ReturnType<typeof postgres> | undefined;
};

function getConnectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL environment variable is not set');
  return url;
}

/**
 * Singleton Drizzle client for Next.js apps.
 * Re-uses the same postgres connection across hot-reloads in development.
 * Lazy: connection is only established on first use (not at import time),
 * so Next.js builds succeed without DATABASE_URL.
 */
function getDb() {
  const client = globalForDb._pgClient ?? postgres(getConnectionString(), { max: 10 });
  if (process.env.NODE_ENV !== 'production') {
    globalForDb._pgClient = client;
  }
  return drizzle(client, { schema });
}

type DrizzleDb = ReturnType<typeof getDb>;

export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    const realDb = getDb();
    const value = Reflect.get(realDb, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(realDb);
    }
    return value;
  },
});

// ---------------------------------------------------------------------------
// Lambda per-invocation client
// ---------------------------------------------------------------------------

/**
 * Creates a per-invocation Drizzle client for Lambda handlers.
 * Uses max 1 connection via Supabase pooler.
 */
export function createLambdaDb() {
  const client = postgres(getConnectionString(), {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return drizzle(client, { schema });
}

export type Database = typeof db;
