import { NextResponse } from 'next/server';
import { normalizeEmail, findUserByEmail, verifyPassword, startSession, claimLegacySongs } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';

    const row = email ? await findUserByEmail(email) : null;
    if (!row || !(await verifyPassword(password, row.passwordHash))) {
      return NextResponse.json({ error: 'Wrong email or password.' }, { status: 401 });
    }

    const user = { id: row.id, email: row.email };
    await claimLegacySongs(user);
    await startSession(user.id);

    return NextResponse.json({ status: 'ok', user });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
