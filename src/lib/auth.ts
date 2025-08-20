// src/lib/auth.ts
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.APP_SECRET || 'dev-secret');
const COOKIE_NAME = 'session';

export async function createSessionCookie(payload: { sub: string; email: string }) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  return { name: COOKIE_NAME, value: token, options: { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 } as const };
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { sub: string; email: string; iat: number; exp: number };
}

export function sessionCookieName() {
  return COOKIE_NAME;
}
