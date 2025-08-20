// src/app/logout/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const res = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  res.cookies.set('session', '', { path: '/', httpOnly: true, maxAge: 0 });
  return res;
}
