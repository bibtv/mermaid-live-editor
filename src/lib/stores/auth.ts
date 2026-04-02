import { writable } from 'svelte/store';

export type AuthUser = { id: number; email: string } | null;

export const authUser = writable<AuthUser>(null);

export async function fetchUser(): Promise<AuthUser> {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const user = await res.json();
      authUser.set(user);
      return user;
    }
    authUser.set(null);
    return null;
  } catch {
    authUser.set(null);
    return null;
  }
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
  authUser.set(null);
}
