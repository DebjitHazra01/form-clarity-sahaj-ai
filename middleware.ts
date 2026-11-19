import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/api/form/:path*'],
};

export function middleware(request: Request) {
  // For API routes handling large form-data uploads, you might want to increase the body size limit.
  // Next.js currently does not provide a direct way to increase this limit in middleware,
  // but this middleware acts as a placeholder for any custom logic if needed.
  return NextResponse.next();
}
