import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Use a different logging approach
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] Middleware: ${req.method} ${req.nextUrl.pathname}`;
  
  // Try multiple logging approaches
  console.log(logMessage);
  console.error(logMessage); // Sometimes error logs are more visible
  
  // Simple test - redirect homepage to maintenance
  if (req.nextUrl.pathname === '/') {
    console.log(`[${timestamp}] REDIRECTING to maintenance page`);
    return NextResponse.redirect(new URL('/maintenance', req.url));
  }
  
  // Allow all other requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*'
  ],
}
