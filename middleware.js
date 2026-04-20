import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const tieneSesion = request.cookies.get('siac_auth')?.value === '1';

  if (pathname === '/') {
    return NextResponse.redirect(new URL('/web', request.url));
  }

  if (pathname === '/web' || pathname === '/login') {
    return NextResponse.next();
  }

  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    if (!tieneSesion) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  }

  if (pathname === '/MCC' || pathname.startsWith('/MCC/')) {
    return NextResponse.redirect(new URL(tieneSesion ? '/dashboard' : '/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/web', '/dashboard/:path*', '/MCC/:path*'],
};