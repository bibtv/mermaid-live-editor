import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { db } from '$lib/server/db/index.js';
import { diagrams } from '$lib/server/db/schema.js';
import { getUserFromRequest } from '$lib/server/auth.js';
import { eq, and } from 'drizzle-orm';

export const GET: RequestHandler = async ({ request, params }) => {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const diagram = db
      .select()
      .from(diagrams)
      .where(and(eq(diagrams.id, parseInt(params.id)), eq(diagrams.userId, user.id)))
      .get();

    if (!diagram) {
      return json({ error: 'Diagram not found' }, { status: 404 });
    }

    return json(diagram);
  } catch (error) {
    console.error('Get diagram error:', error);
    return json({ error: 'Failed to fetch diagram' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request, params }) => {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content } = await request.json();

    const result = db
      .update(diagrams)
      .set({ title, content, updatedAt: new Date() })
      .where(and(eq(diagrams.id, parseInt(params.id)), eq(diagrams.userId, user.id)))
      .returning()
      .get();

    if (!result) {
      return json({ error: 'Diagram not found' }, { status: 404 });
    }

    return json(result);
  } catch (error) {
    console.error('Update diagram error:', error);
    return json({ error: 'Failed to update diagram' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ request, params }) => {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = db
      .delete(diagrams)
      .where(and(eq(diagrams.id, parseInt(params.id)), eq(diagrams.userId, user.id)))
      .returning()
      .get();

    if (!result) {
      return json({ error: 'Diagram not found' }, { status: 404 });
    }

    return json({ success: true });
  } catch (error) {
    console.error('Delete diagram error:', error);
    return json({ error: 'Failed to delete diagram' }, { status: 500 });
  }
};
