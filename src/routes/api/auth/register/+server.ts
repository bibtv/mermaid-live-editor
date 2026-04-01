import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { db } from '$lib/server/db/index.js';
import { users } from '$lib/server/db/schema.js';
import { hashPassword, createToken } from '$lib/server/auth.js';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
      return json({ error: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const [result] = await db.insert(users).values({ email, passwordHash }).returning();

    const token = createToken(result);

    return json(
      {
        user: { id: result.id, email: result.email },
        token
      },
      {
        headers: {
          'Set-Cookie': `auth_token=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`
        }
      }
    );
  } catch (error) {
    console.error('Register error:', error);
    return json({ error: 'Registration failed' }, { status: 500 });
  }
};
