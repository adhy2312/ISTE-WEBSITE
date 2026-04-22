import { NextResponse } from 'next/server';

// NextAuth is not used — auth is handled by Supabase SSR.
// This stub satisfies Next.js route handler requirements.
export async function GET() {
  return NextResponse.json({ error: 'Not used' }, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ error: 'Not used' }, { status: 404 });
}
