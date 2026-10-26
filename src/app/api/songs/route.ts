import { NextResponse } from 'next/server';
import { db, isTursoConfigured } from '@/lib/db';
import { songsTable } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  if (!isTursoConfigured()) {
    return NextResponse.json({ status: 'local_mode', songs: [] });
  }

  try {
    const songs = await db.select().from(songsTable);
    const parsed = songs.map((s) => ({
      ...s,
      sections: JSON.parse(s.sectionsJson),
    }));
    return NextResponse.json({ status: 'ok', songs: parsed });
  } catch (error) {
    console.error('Error fetching songs from Turso:', error);
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isTursoConfigured()) {
    return NextResponse.json({ status: 'local_saved' });
  }

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
    return NextResponse.json({ error: 'Failed to save song' }, { status: 500 });
  }
}
