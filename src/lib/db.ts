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

let schemaInitialized = false;

/**
 * Automatically creates required database tables in Turso if they do not exist
 */
export async function ensureSchema(): Promise<void> {
  if (schemaInitialized) return;
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS songs (
        id TEXT PRIMARY KEY,
        creator_id TEXT NOT NULL,
        title TEXT NOT NULL,
        artist TEXT DEFAULT '',
        bpm INTEGER DEFAULT 100,
        key_signature TEXT DEFAULT 'C Major',
        instrument TEXT DEFAULT 'acoustic_guitar',
        pad_count INTEGER DEFAULT 15,
        playback_style TEXT DEFAULT 'strum_down',
        strum_speed_ms INTEGER DEFAULT 25,
        fade_duration REAL DEFAULT 2.5,
        is_public INTEGER DEFAULT 0,
        share_code TEXT,
        sections_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS shared_songs (
        share_code TEXT PRIMARY KEY,
        song_id TEXT NOT NULL,
        song_data_json TEXT NOT NULL,
        views_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    await client.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    await client.execute(`CREATE INDEX IF NOT EXISTS idx_songs_creator ON songs (creator_id);`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);`);

    schemaInitialized = true;
  } catch (err) {
    console.error('Failed to initialize database schema in Turso:', err);
  }
}
