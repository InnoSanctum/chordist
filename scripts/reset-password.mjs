// Reset a user's password (there is no email-based recovery).
// Usage: node --env-file=.env scripts/reset-password.mjs friend@example.com NewPassword123
import { createClient } from '@libsql/client';
import { randomBytes, scryptSync } from 'node:crypto';

const [email, password] = process.argv.slice(2);
if (!email || !password || password.length < 6) {
  console.error('Usage: node --env-file=.env scripts/reset-password.mjs <email> <new-password (6+ chars)>');
  process.exit(1);
}

const url = process.env.TURSO_URL || process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_TOKEN || process.env.TURSO_AUTH_TOKEN;
const client = createClient({ url, authToken });

// Same format as hashPassword() in src/lib/auth.ts
const salt = randomBytes(16);
const hash = `scrypt$${salt.toString('hex')}$${scryptSync(password, salt, 64).toString('hex')}`;

const result = await client.execute({
  sql: 'UPDATE users SET password_hash = ? WHERE email = ?',
  args: [hash, email.trim().toLowerCase()],
});
if (result.rowsAffected === 0) {
  console.error(`No user with email ${email}`);
  process.exit(1);
}

// Log out every device so the old password stops working everywhere
await client.execute({
  sql: 'DELETE FROM sessions WHERE user_id = (SELECT id FROM users WHERE email = ?)',
  args: [email.trim().toLowerCase()],
});
console.log(`Password reset for ${email}`);
