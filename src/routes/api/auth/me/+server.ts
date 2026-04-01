import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getUserFromRequest } from '$lib/server/auth.js';

export const GET: RequestHandler = async ({ request }) => {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    return json({ id: user.id, email: user.email });
  } catch (error) {
    console.error('Get user error:', error);
    return json({ error: 'Failed to get user' }, { status: 500 });
  }
};
