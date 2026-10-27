import { NextResponse } from 'next/server';
import { db, ensureSchema } from '@/lib/db';
import { sharedSongsTable, songsTable } from '@/lib/schema';
import { and, eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  await ensureSchema();

  try {
    const result = await db
      .select()
      .from(sharedSongsTable)
      .where(eq(sharedSongsTable.shareCode, code))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const songData = JSON.parse(result[0].songDataJson);
    return NextResponse.json({ status: 'ok', song: songData });
  } catch (error) {
    console.error('Error retrieving shared song:', error);
    return NextResponse.json({ error: 'Failed to retrieve shared song' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Only the song's owner may publish (or refresh) its share snapshot
    const owned = await db
      .select({ id: songsTable.id })
      .from(songsTable)
      .where(and(eq(songsTable.id, body.id), eq(songsTable.creatorId, user.id)))
      .limit(1);
    if (owned.length === 0 || code !== body.id) {
      return NextResponse.json({ error: 'You can only share your own songs' }, { status: 403 });
    }

    const songDataJson = JSON.stringify(body);
    await db
      .insert(sharedSongsTable)
      .values({
        shareCode: code,
        songId: body.id,
        songDataJson,
        viewsCount: 0,
        createdAt: new Date().toISOString(),
      })
      .onConflictDoUpdate({ target: sharedSongsTable.shareCode, set: { songDataJson } });

    return NextResponse.json({ status: 'ok', code });
  } catch (error) {
    console.error('Error sharing song:', error);
    return NextResponse.json({ error: 'Failed to share song' }, { status: 500 });
  }
}
