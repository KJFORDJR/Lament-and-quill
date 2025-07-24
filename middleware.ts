import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Use a different logging approach
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] Middleware: ${req.method} ${req.nextUrl.pathname}`;
  
  // Try multiple logging approaches
  console.log(logMessage);
  console.error(logMessage); // Sometimes error logs are more visible
  
  // ❌ REMOVED: This was causing logout redirect loops
  // DO NOT redirect homepage to maintenance - this breaks logout
  // if (req.nextUrl.pathname === '/') {
  //   console.log(`[${timestamp}] REDIRECTING to maintenance page`);
  //   return NextResponse.redirect(new URL('/maintenance', req.url));
  // }
  
  // Allow all requests to pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*'
  ],
}
