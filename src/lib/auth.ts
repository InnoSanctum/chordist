import 'server-only';
import { randomBytes, scrypt, timingSafeEqual, createHash, randomUUID } from 'node:crypto';
import { promisify } from 'node:util';
import { cookies } from 'next/headers';
import { and, eq, gt, inArray } from 'drizzle-orm';
import { db, ensureSchema } from './db';
import { usersTable, sessionsTable, songsTable } from './schema';

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, keylen: number) => Promise<Buffer>;

export const SESSION_COOKIE = 'chordist_session';
const SESSION_DAYS = 365; // long-lived so the installed PWA stays logged in

// Songs created before user accounts existed; they are handed to ADMIN_EMAIL on login
const LEGACY_CREATOR_IDS = ['user_anonymous', 'system_default'];

export interface AuthUser {
  id: string;
  email: string;
}

export function normalizeEmail(email: unknown): string {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, keyHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !keyHex) return false;
  const expected = Buffer.from(keyHex, 'hex');
  const actual = await scryptAsync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return timingSafeEqual(actual, expected);
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createUser(email: string, password: string): Promise<AuthUser> {
  await ensureSchema();
  const user = { id: randomUUID(), email };
  await db.insert(usersTable).values({
    ...user,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  });
  return user;
}

export async function findUserByEmail(email: string) {
  await ensureSchema();
  const rows = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  return rows[0] ?? null;
}

/** Creates a session row and sets the session cookie on the response. */
export async function startSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessionsTable).values({
    tokenHash: hashToken(token),
    userId,
    expiresAt: expires.toISOString(),
    createdAt: now.toISOString(),
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires,
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await ensureSchema();
    await db.delete(sessionsTable).where(eq(sessionsTable.tokenHash, hashToken(token)));
  }
  jar.delete(SESSION_COOKIE);
}

/** Returns the logged-in user for the current request, or null. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  await ensureSchema();
  const rows = await db
    .select({ id: usersTable.id, email: usersTable.email })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(
      and(
        eq(sessionsTable.tokenHash, hashToken(token)),
        gt(sessionsTable.expiresAt, new Date().toISOString())
      )
    )
    .limit(1);

  return rows[0] ?? null;
}

/** If this user is the configured admin, take ownership of songs from the pre-accounts era. */
export async function claimLegacySongs(user: AuthUser): Promise<void> {
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
  if (!adminEmail || user.email !== adminEmail) return;

  await db
    .update(songsTable)
    .set({ creatorId: user.id })
    .where(inArray(songsTable.creatorId, LEGACY_CREATOR_IDS));
}
