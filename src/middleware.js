import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

export async function middleware(req) {
  const res = NextResponse.next();
  const session = await getIronSession(req, res, sessionOptions);

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin/dashboard_a');

  if (isAdminRoute && !session.isAdmin) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin/dashboard_a/:path*'],
};