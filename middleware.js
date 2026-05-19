import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. እነዚህ ገጾች ጥበቃ አያስፈልጋቸውም (ነጻ ናቸው)
  // ሎጊን ገጽ ላይ ከሆንን ወይም የባክኢንድ API ከሆነ ዝም ይበለው
  if (
    pathname === '/' || 
    pathname.startsWith('/admin/login') || 
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. ቶከን ከሌለ እና ጥበቃ የሚፈልግ ገጽ ከሆነ ወደ ሎጊን ይመልሰው
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                           pathname.startsWith('/admin');

  if (isProtectedRoute && !token) {
    // ታካሚ ከሆነ ወደ ዋናው ገጽ (/)፣ አድሚን ከሆነ ወደ /admin/login ይላከው
    const loginUrl = pathname.startsWith('/admin') ? '/admin/login' : '/';
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  return NextResponse.next();
}

// ሚድልዌሩ በየትኞቹ መንገዶች ላይ እንዲሰራ (Config)
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};