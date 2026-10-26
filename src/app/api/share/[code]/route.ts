import { NextResponse } from 'next/server';
import { db, isTursoConfigured, ensureSchema } from '@/lib/db';
import { sharedSongsTable } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  if (!isTursoConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 404 });
  }

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

  if (!isTursoConfigured()) {
    return NextResponse.json({ status: 'mock_shared', code });
  }

  await ensureSchema();

  try {
    const body = await req.json();
    const now = new Date().toISOString();

    await db.insert(sharedSongsTable).values({
      shareCode: code,
      songId: body.id,
      songDataJson: JSON.stringify(body),
      viewsCount: 0,
      createdAt: now,
    });

    return NextResponse.json({ status: 'ok', code });
  } catch (error) {
    console.error('Error sharing song:', error);
    return NextResponse.json({ error: 'Failed to share song' }, { status: 500 });
  }
}
