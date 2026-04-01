import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import { db } from '$lib/server/db/index.js';
import { diagrams } from '$lib/server/db/schema.js';
import { getUserFromRequest } from '$lib/server/auth.js';
import { eq, and } from 'drizzle-orm';

export const prerender = false;

export const load: PageServerLoad = async ({ request, url }) => {
  const user = getUserFromRequest(request);
  const diagramId = url.searchParams.get('id');

  if (diagramId) {
    if (!user) {
      throw redirect(302, '/login');
    }

    const diagram = db
      .select()
      .from(diagrams)
      .where(and(eq(diagrams.id, parseInt(diagramId)), eq(diagrams.userId, user.id)))
      .get();

    if (!diagram) {
      throw redirect(302, '/diagrams');
    }

    return {
      diagram: {
        id: diagram.id,
        title: diagram.title,
        content: diagram.content
      }
    };
  }

  return { diagram: null };
};
