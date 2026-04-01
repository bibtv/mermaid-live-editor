export const prerender = false;

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async () => {
  return json(
    { success: true },
    {
      headers: {
        'Set-Cookie': 'auth_token=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0'
      }
    }
  );
};
