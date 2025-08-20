// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.APP_SECRET || 'dev-secret');

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Protect all editor routes
  if (pathname.startsWith('/edit')) {
    const token = req.cookies.get('session')?.value;
    if (!token) {
      const url = new URL('/login', req.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      const url = new URL('/login', req.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/edit/:path*'],
};
