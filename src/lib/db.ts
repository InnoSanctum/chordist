import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const url =
  process.env.TURSO_URL ||
  process.env.TURSO_DATABASE_URL ||
  'file:local.db';

const authToken =
  process.env.TURSO_TOKEN ||
  process.env.TURSO_AUTH_TOKEN ||
  undefined;

export const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });

/**
 * Helper to check if cloud Turso database is configured
 */
export function isTursoConfigured(): boolean {
  const hasUrl = Boolean(process.env.TURSO_URL || process.env.TURSO_DATABASE_URL);
  const hasToken = Boolean(process.env.TURSO_TOKEN || process.env.TURSO_AUTH_TOKEN);
  return hasUrl && hasToken;
}
