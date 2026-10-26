import { createClient } from '@libsql/client';

const url = process.env.TURSO_URL || process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_TOKEN || process.env.TURSO_AUTH_TOKEN;

console.log('Connecting to Turso DB at:', url || 'None');

if (!url || !authToken) {
  console.error('Missing TURSO_URL or TURSO_TOKEN in environment');
  process.exit(1);
}

const client = createClient({
  url,
  authToken,
});

async function main() {
  console.log('Initializing database schema on Turso...');

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

  console.log('Database tables verified successfully!');

  // Check tables
  const res = await client.execute("SELECT name FROM sqlite_master WHERE type='table';");
  console.log('Active tables in Turso:');
  for (const row of res.rows) {
    console.log(' -', row.name);
  }
}

main().catch((err) => {
  console.error('Turso setup error:', err);
  process.exit(1);
});

