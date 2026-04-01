import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { User } from './db/schema.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(user: User): string {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): { id: number; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string };
  } catch {
    return null;
  }
}

export function getUserFromRequest(request: Request): { id: number; email: string } | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map((c) => {
      const [key, ...val] = c.split('=');
      return [key, val.join('=')];
    })
  );

  const token = cookies.auth_token;
  if (!token) return null;

  return verifyToken(token);
}
