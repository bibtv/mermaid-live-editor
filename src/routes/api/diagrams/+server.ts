import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { db } from '$lib/server/db/index.js';
import { diagrams } from '$lib/server/db/schema.js';
import { getUserFromRequest } from '$lib/server/auth.js';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ request }) => {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userDiagrams = await db.select().from(diagrams).where(eq(diagrams.userId, user.id));

    return json(userDiagrams);
  } catch (error) {
    console.error('Get diagrams error:', error);
    return json({ error: 'Failed to fetch diagrams' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content } = await request.json();

    if (!title || !content) {
      return json({ error: 'Title and content are required' }, { status: 400 });
    }

    const [result] = await db
      .insert(diagrams)
      .values({
        userId: user.id,
        title,
        content
      })
      .returning();

    return json(result, { status: 201 });
  } catch (error) {
    console.error('Create diagram error:', error);
    return json({ error: 'Failed to create diagram' }, { status: 500 });
  }
};
