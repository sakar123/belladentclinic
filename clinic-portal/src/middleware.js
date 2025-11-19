import { NextResponse } from 'next/server';

// Dev mode: disable auth and allow all requests to pass through.
export default function middleware() {
  return NextResponse.next();
}

// No routes are matched by middleware while auth is disabled
export const config = { matcher: [] };
