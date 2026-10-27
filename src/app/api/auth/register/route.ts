import { NextResponse } from 'next/server';
import {
  normalizeEmail,
  isValidEmail,
  findUserByEmail,
  createUser,
  startSession,
  claimLegacySongs,
} from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (password.length < 6 || password.length > 200) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }
    if (await findUserByEmail(email)) {
      return NextResponse.json({ error: 'An account with this email already exists. Try logging in.' }, { status: 409 });
    }

    const user = await createUser(email, password);
    await claimLegacySongs(user);
    await startSession(user.id);

    return NextResponse.json({ status: 'ok', user });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
