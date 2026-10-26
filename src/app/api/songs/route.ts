import { NextResponse } from 'next/server';
import { db, isTursoConfigured, ensureSchema } from '@/lib/db';
import { songsTable } from '@/lib/schema';
import { INITIAL_SONGS } from '@/lib/defaultSongs';
import { eq } from 'drizzle-orm';

export async function GET() {
  if (!isTursoConfigured()) {
    return NextResponse.json({ status: 'local_mode', songs: [] });
  }

  await ensureSchema();

  try {
    let songs = await db.select().from(songsTable);

    // If database is brand new and empty, seed default songs
    if (songs.length === 0) {
      const now = new Date().toISOString();
      for (const song of INITIAL_SONGS) {
        await db
          .insert(songsTable)
          .values({
            id: song.id,
            creatorId: 'system_default',
            title: song.title,
            artist: song.artist || '',
            bpm: song.bpm || 100,
            keySignature: song.keySignature || 'C Major',
            instrument: song.instrument || 'acoustic_guitar',
            padCount: song.padCount || 15,
            playbackStyle: song.playbackStyle || 'strum_down',
            strumSpeedMs: song.strumSpeedMs || 25,
            fadeDuration: song.fadeDuration || 2.5,
            sectionsJson: JSON.stringify(song.sections || []),
            createdAt: now,
            updatedAt: now,
          })
          .catch(() => {});
      }
      songs = await db.select().from(songsTable);
    }

    const parsed = songs.map((s) => {
      let sections = [];
      try {
        sections = JSON.parse(s.sectionsJson);
      } catch {
        sections = [];
      }
      return {
        ...s,
        activeSectionId: sections[0]?.id || 'sec-1',
        sections,
      };
    });

    return NextResponse.json({ status: 'ok', songs: parsed });
  } catch (error) {
    console.error('Error fetching songs from Turso:', error);
    return NextResponse.json({ error: 'Failed to fetch songs', details: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isTursoConfigured()) {
    return NextResponse.json({ status: 'local_saved' });
  }

  await ensureSchema();

  try {
    const body = await req.json();
    const { id, title, artist, bpm, keySignature, instrument, padCount, playbackStyle, strumSpeedMs, fadeDuration, sections } = body;

    const now = new Date().toISOString();

    await db
      .insert(songsTable)
      .values({
        id,
        creatorId: 'user_anonymous',
        title,
        artist: artist || '',
        bpm: bpm || 100,
        keySignature: keySignature || 'C Major',
        instrument: instrument || 'acoustic_guitar',
        padCount: padCount || 15,
        playbackStyle: playbackStyle || 'strum_down',
        strumSpeedMs: strumSpeedMs || 25,
        fadeDuration: fadeDuration || 2.5,
        sectionsJson: JSON.stringify(sections || []),
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: songsTable.id,
        set: {
          title,
          artist: artist || '',
          bpm: bpm || 100,
          keySignature: keySignature || 'C Major',
          instrument: instrument || 'acoustic_guitar',
          padCount: padCount || 15,
          playbackStyle: playbackStyle || 'strum_down',
          strumSpeedMs: strumSpeedMs || 25,
          fadeDuration: fadeDuration || 2.5,
          sectionsJson: JSON.stringify(sections || []),
          updatedAt: now,
        },
      });

    return NextResponse.json({ status: 'ok', id });
  } catch (error) {
    console.error('Error saving song to Turso:', error);
    return NextResponse.json({ error: 'Failed to save song', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isTursoConfigured()) {
    return NextResponse.json({ status: 'local_deleted' });
  }

  await ensureSchema();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing song id' }, { status: 400 });
    }

    await db.delete(songsTable).where(eq(songsTable.id, id));
    return NextResponse.json({ status: 'ok', id });
  } catch (error) {
    console.error('Error deleting song from Turso:', error);
    return NextResponse.json({ error: 'Failed to delete song', details: String(error) }, { status: 500 });
  }
}
