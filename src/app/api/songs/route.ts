import { NextResponse } from 'next/server';
import { db, isTursoConfigured } from '@/lib/db';
import { songsTable } from '@/lib/schema';
import { INITIAL_SONGS } from '@/lib/defaultSongs';
import { getCurrentUser } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';

const unauthorized = () => NextResponse.json({ error: 'Not logged in' }, { status: 401 });

function toSongRow(song: any, creatorId: string, now: string) {
  return {
    id: song.id,
    creatorId,
    title: song.title || 'Untitled',
    artist: song.artist || '',
    bpm: song.bpm || 100,
    keySignature: song.keySignature || 'C Major',
    instrument: song.instrument || 'acoustic_guitar',
    padCount: song.padCount || 15,
    playbackStyle: song.playbackStyle || 'strum_down',
    strumSpeedMs: song.strumSpeedMs ?? 25,
    fadeDuration: song.fadeDuration || 2.5,
    sectionsJson: JSON.stringify(song.sections || []),
    createdAt: now,
    updatedAt: now,
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    let songs = await db.select().from(songsTable).where(eq(songsTable.creatorId, user.id));

    // New account (or everything deleted): give the user their own copy of the starter songs
    if (songs.length === 0) {
      const now = new Date().toISOString();
      const suffix = user.id.slice(0, 8);
      for (const song of INITIAL_SONGS) {
        await db
          .insert(songsTable)
          .values(toSongRow({ ...song, id: `${song.id}-${suffix}` }, user.id, now))
          .onConflictDoNothing();
      }
      songs = await db.select().from(songsTable).where(eq(songsTable.creatorId, user.id));
    }

    const parsed = songs.map(({ creatorId, sectionsJson, ...s }) => {
      let sections = [];
      try {
        sections = JSON.parse(sectionsJson);
      } catch {
        sections = [];
      }
      return {
        ...s,
        activeSectionId: sections[0]?.id || 'sec-1',
        sections,
      };
    });

    return NextResponse.json({ status: 'ok', cloud: isTursoConfigured(), songs: parsed });
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json({ error: 'Failed to fetch songs', details: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    if (!body?.id || typeof body.id !== 'string') {
      return NextResponse.json({ error: 'Missing song id' }, { status: 400 });
    }

    // Song ids are generated client-side, so refuse to overwrite someone else's song
    const existing = await db
      .select({ creatorId: songsTable.creatorId })
      .from(songsTable)
      .where(eq(songsTable.id, body.id))
      .limit(1);
    if (existing[0] && existing[0].creatorId !== user.id) {
      return NextResponse.json({ error: 'Song belongs to another user' }, { status: 403 });
    }

    const now = new Date().toISOString();
    const { id, creatorId, createdAt, ...updatable } = toSongRow(body, user.id, now);

    await db
      .insert(songsTable)
      .values({ id, creatorId, createdAt, ...updatable })
      .onConflictDoUpdate({ target: songsTable.id, set: updatable });

    return NextResponse.json({ status: 'ok', id });
  } catch (error) {
    console.error('Error saving song:', error);
    return NextResponse.json({ error: 'Failed to save song', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing song id' }, { status: 400 });
    }

    await db.delete(songsTable).where(and(eq(songsTable.id, id), eq(songsTable.creatorId, user.id)));
    return NextResponse.json({ status: 'ok', id });
  } catch (error) {
    console.error('Error deleting song:', error);
    return NextResponse.json({ error: 'Failed to delete song', details: String(error) }, { status: 500 });
  }
}
