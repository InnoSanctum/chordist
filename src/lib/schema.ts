import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const songsTable = sqliteTable('songs', {
  id: text('id').primaryKey(),
  creatorId: text('creator_id').notNull(),
  title: text('title').notNull(),
  artist: text('artist').default(''),
  bpm: integer('bpm').default(100),
  keySignature: text('key_signature').default('C Major'),
  instrument: text('instrument').default('acoustic_guitar'),
  padCount: integer('pad_count').default(15),
  playbackStyle: text('playback_style').default('strum_down'),
  strumSpeedMs: integer('strum_speed_ms').default(25),
  fadeDuration: real('fade_duration').default(2.5),
  sustain: real('sustain').default(0),
  isPublic: integer('is_public', { mode: 'boolean' }).default(false),
  shareCode: text('share_code'),
  sectionsJson: text('sections_json').notNull(), // JSON stringified sections & chords
  sourceText: text('source_text'), // raw chord sheet pasted on import, kept for re-parsing / lyrics
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const sharedSongsTable = sqliteTable('shared_songs', {
  shareCode: text('share_code').primaryKey(),
  songId: text('song_id').notNull(),
  songDataJson: text('song_data_json').notNull(),
  viewsCount: integer('views_count').default(0),
  createdAt: text('created_at').notNull(),
});

export const usersTable = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
});

export const sessionsTable = sqliteTable('sessions', {
  tokenHash: text('token_hash').primaryKey(),
  userId: text('user_id').notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
});
